import * as React from 'react'
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import './App.css';
import { DropZone, DropZoneHandle } from './DropZone'
import { CheckDataRow, GameDataRow, ViolationsDataRow } from './ResultsTable'
import { ProgressBar } from './ProgressBar'
import { Footer } from './Footer';
import { Header } from './components/layout/Header';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { ResultsView } from './components/results/ResultsView';
import { StickyProgressBar } from './components/shared/StickyProgressBar';
import init, { ListChecks, Check, isBoxController, Violation } from 'slp-enforcer'
import { isHandwarmer, isSlpMinVersion, getGameSettings } from 'slp-enforcer'

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

let LIBRARY_VERSION: string = "2.0.1"

function App() {
  const [results, updateResults] = React.useState<GameDataRow[]>([])
  const [progress, setProgress] = React.useState<number>(1)
  const [totalFileCount, setTotalFileCount] = React.useState<number>(0)
  const [processedFileCount, setProcessedFileCount] = React.useState<number>(0)
  const [uploadedFileHashes, setUploadedFileHashes] = React.useState<Set<string>>(new Set())
  const dropZoneRef = React.useRef<DropZoneHandle>(null)

  function handleSingleResult(newResult: GameDataRow) {
    updateResults(oldList => [...oldList, newResult])
    setProcessedFileCount(prev => prev + 1)
  }

  function startProcessing(fileCount: number) {
    setTotalFileCount(fileCount)
    setProcessedFileCount(0)
    setProgress(0)
  }

  function registerFileHash(hash: string): boolean {
    if (uploadedFileHashes.has(hash)) {
      return false; // Duplicate detected
    }
    setUploadedFileHashes(prev => new Set([...prev, hash]));
    return true; // New file, proceed with processing
  }

  function violationArrayToDataRows(violations: Violation[], checkName: string): ViolationsDataRow[] {
    let dataRows: ViolationsDataRow[] = [] 
    for (let violation of violations) {
      let newRow: ViolationsDataRow = {checkName: checkName, 
        metric: violation.metric, 
        reason: violation.reason,
        evidence: violation.evidence
      }
      dataRows.push(newRow)
    }
    return dataRows
  }

  async function runChecks(inputFile: File, preReadBuffer?: ArrayBuffer) {
    await init()
    const buffer = preReadBuffer ?? await inputFile.arrayBuffer()
    const slpBytes = new Uint8Array(buffer)

    let settings
    try {
      settings = getGameSettings(slpBytes)
    } catch {
      return {
        filename: inputFile.name,
        stage: -1,
        overallResult: "💀 Could Not Parse",
        results: ["⦻", "⦻", "⦻", "⦻"],
        controllerTypes: ["?", "?", "?", "?"],
        characterIds: [-1, -1, -1, -1],
        costumes: [-1, -1, -1, -1],
        details: []
      }
    }

    let passed = "✅ Passed"
    let playerPassed: string[] = []
    playerPassed.push("✅")
    playerPassed.push("✅")
    playerPassed.push("✅")
    playerPassed.push("✅")
    let controllerType : string[] = ["?", "?", "?", "?"]
    let characterIds: number[] = [-1, -1, -1, -1]
    let costumes: number[] = [-1, -1, -1, -1]

    let checkResults: CheckDataRow[] = []

    const ports: number[] = settings.players.filter(p => p.playerType === 0).map(p => p.playerIndex);

    // Get character IDs, costumes
    for (let i = 0; i < 4; i++) {
      if (ports.includes(i)) {
        const player = settings.players.find(p => p.playerIndex === i)
        if (player) {
          characterIds[i] = player.characterId
          costumes[i] = player.characterColor
        }
      }
    }

    if (isSlpMinVersion(slpBytes)) {
      passed = "💀 SLP Too Old (Slippi >=3.15.0)"
      for (let i = 0; i < 4; i++) {
        playerPassed[i] = "⦻"
      }
    } else if (isHandwarmer(slpBytes)) {
      passed = "🔥 Handwarmer"
      for (let i = 0; i < 4; i++) {
        playerPassed[i] = "⦻"
      }
    } else {

      let checks: Check[]
      checks = ListChecks()

      for (let check of checks) {
        let checkResult: CheckDataRow = {
          name: check.name,
          passed: ["✅ Passed", "✅ Passed", "✅ Passed", "✅ Passed"],
          violations: [[], [], [], []]
        }
        for (let i = 0; i < 4; i++) {
          if (!ports.includes(i)) {
            checkResult.passed[i] = ""
            playerPassed[i] = ""
            continue
          }

          if (isBoxController(slpBytes, i)) {
            controllerType[i] = "digital"
          } else {
            controllerType[i] = "analog"
          }

          let singleCheckResults = check.checkFunction(slpBytes, i)
          if (singleCheckResults.result) {
            checkResult.passed[i] = "❌"
            playerPassed[i] = "❌"
            passed = "❌ Failed"
            checkResult.violations[i] = violationArrayToDataRows(singleCheckResults.violations, check.name)
          }
          if (check.name === "Control Stick Visualization"){
            checkResult.passed[i] = "✅"
            checkResult.violations[i] = violationArrayToDataRows(singleCheckResults.violations, check.name)
          }
        }
        checkResults.push(checkResult)
      }
    }

    let ourStage: number = settings.stageId ?? -1

    let fileResult: GameDataRow = {
      filename: inputFile.name,
      stage: ourStage,
      overallResult: passed,
      results: playerPassed,
      controllerTypes: controllerType,
      characterIds: characterIds,
      costumes: costumes,
      details: checkResults
    }

    return fileResult
  }

  const showWelcome = results.length === 0 && progress >= 1.0;
  const showResults = results.length > 0;
  const isProcessing = progress < 1.0 && results.length > 0;

  const triggerFileUpload = () => {
    dropZoneRef.current?.openFilePicker();
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="App">
        <Header
          version={LIBRARY_VERSION}
          showUploadButton={showResults}
          onUploadMore={triggerFileUpload}
        />
        <header className="App-header">
          <MainContent>
            {/* Sticky Progress Bar - shown while processing with results */}
            {isProcessing && (
              <StickyProgressBar
                progress={progress}
                currentFile={processedFileCount}
                totalFiles={totalFileCount}
              />
            )}

            {showWelcome && (
              <WelcomeScreen>
                <DropZone
                  processFile={runChecks}
                  isActive={true}
                  setProgress={setProgress}
                  handleResults={handleSingleResult}
                  startProcessing={startProcessing}
                  registerFileHash={registerFileHash}
                />
              </WelcomeScreen>
            )}

            {showResults && (
              <ResultsView results={results} />
            )}

            {/* Initial Progress Bar - shown before any results */}
            {!showResults && progress < 1.0 && <ProgressBar progress={progress} />}

            {/* DropZone at bottom when showing results */}
            {showResults && (
              <DropZone
                ref={dropZoneRef}
                processFile={runChecks}
                isActive={true}
                setProgress={setProgress}
                handleResults={handleSingleResult}
                startProcessing={startProcessing}
                registerFileHash={registerFileHash}
              />
            )}
          </MainContent>

          <Footer isActive={showWelcome || showResults} version={LIBRARY_VERSION}/>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
