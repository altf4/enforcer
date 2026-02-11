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
import init, { analyzeReplay, AllCheckResults, isBoxController, Violation } from 'slp-enforcer'
import { isHandwarmer, isSlpMinVersion, getGameSettings } from 'slp-enforcer'

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

let LIBRARY_VERSION: string = "2.0.1"

const CHECK_MAPPING: { key: keyof AllCheckResults; name: string }[] = [
  { key: 'travel_time', name: 'Box Travel Time' },
  { key: 'disallowed_cstick', name: 'Disallowed Analog C-Stick Values' },
  { key: 'uptilt_rounding', name: 'Uptilt Rounding' },
  { key: 'crouch_uptilt', name: 'Fast Crouch Uptilt' },
  { key: 'sdi', name: 'Illegal SDI' },
  { key: 'goomwave', name: 'GoomWave Clamping' },
  { key: 'control_stick_viz', name: 'Control Stick Visualization' },
]

function App() {
  const [results, updateResults] = React.useState<GameDataRow[]>([])
  const [progress, setProgress] = React.useState<number>(1)
  const [totalFileCount, setTotalFileCount] = React.useState<number>(0)
  const [processedFileCount, setProcessedFileCount] = React.useState<number>(0)
  const [uploadedFilenames, setUploadedFilenames] = React.useState<Set<string>>(new Set())
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

  function registerFilename(filename: string): boolean {
    if (uploadedFilenames.has(filename)) {
      return false; // Duplicate detected
    }
    setUploadedFilenames(prev => new Set([...prev, filename]));
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
      // Remove shadowing of 'passed' and update it safely
      let failed = false;

      const checkResultsMap: CheckDataRow[] = CHECK_MAPPING.map(({ name }) => ({
        name,
        passed: ["✅ Passed", "✅ Passed", "✅ Passed", "✅ Passed"],
        violations: [[], [], [], []]
      }))

      for (let i = 0; i < 4; i++) {
        if (!ports.includes(i)) {
          for (const cr of checkResultsMap) { cr.passed[i] = "" }
          playerPassed[i] = ""
          continue
        }

        controllerType[i] = isBoxController(slpBytes, i) ? "digital" : "analog"

        const allResults: AllCheckResults = analyzeReplay(slpBytes, i)

        for (let idx = 0; idx < CHECK_MAPPING.length; idx++) {
          const { key, name } = CHECK_MAPPING[idx];
          const result = allResults[key];
          const cr = checkResultsMap[idx];

          if (result.result) {
            cr.passed[i] = "❌";
            playerPassed[i] = "❌";
            failed = true;
            cr.violations[i] = violationArrayToDataRows(result.violations, name);
          }
          if (name === "Control Stick Visualization") {
            cr.passed[i] = "✅";
            cr.violations[i] = violationArrayToDataRows(result.violations, name);
          }
        }
      }

      passed = failed ? "❌ Failed" : "✅ Passed";
      checkResults = checkResultsMap
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
                  registerFilename={registerFilename}
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
                registerFilename={registerFilename}
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
