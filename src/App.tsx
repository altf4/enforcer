import * as React from 'react'
import { ThemeProvider } from 'styled-components';
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

import { getCoordListFromGame, Coord, ListChecks, Check, isBoxController, Violation } from 'slp-enforcer'
import { SlippiGame, isHandwarmer, isSlpMinVersion } from 'slp-enforcer'

let LIBRARY_VERSION: string = "1.4.4"

function App() {
  const [results, updateResults] = React.useState<GameDataRow[]>([])
  const [progress, setProgress] = React.useState<number>(1)
  const [totalFileCount, setTotalFileCount] = React.useState<number>(0)
  const [processedFileCount, setProcessedFileCount] = React.useState<number>(0)
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

  function runChecks(inputFile: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onabort = () => reject('file reading was aborted')
      reader.onerror = () => reject('file reading has failed')
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        const game = new SlippiGame(binaryStr as ArrayBuffer);

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

        const ports: number[] | undefined = game.getSettings()?.players.filter(player => player.type === 0).map((player) => player.playerIndex);
        if (ports === undefined) {
          return
        }

        // Get character IDs, costumes
        for (let i = 0; i < 4; i++) {
          if (ports.includes(i)) {
            for (let player of game.getSettings()?.players!) {
              if (player.playerIndex === i) {
                // Wow, that was a lot just to match these
                characterIds[i] = player.characterId!
                costumes[i] = player.characterColor!
              }
            }
          }
        }

        if (isSlpMinVersion(game)) {
          passed = "💀 SLP Too Old (Slippi >=3.15.0)"
          for (let i = 0; i < 4; i++) {
            playerPassed[i] = "⦻"
          }
        } else if (isHandwarmer(game)) {
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

              let coords: Coord[] = []
              if (check.name === "Disallowed Analog C-Stick Values") {
                coords = getCoordListFromGame(game, i, false)
              } else {
                coords = getCoordListFromGame(game, i, true)
              }

              if (isBoxController(getCoordListFromGame(game, i, true))) {
                controllerType[i] = "digital"
              } else {
                controllerType[i] = "analog"
              }

              let singleCheckResults = check.checkFunction(game, i, coords)
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

        let ourStage: number = game.getSettings()?.stageId!
        if (ourStage === undefined || ourStage === null) {
          ourStage = -1
        }

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

        resolve(fileResult)
      }
      reader.readAsArrayBuffer(inputFile)
    })
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
            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
              <DropZone
                ref={dropZoneRef}
                processFile={runChecks}
                isActive={true}
                setProgress={setProgress}
                handleResults={handleSingleResult}
                startProcessing={startProcessing}
              />
            </div>
          )}

          <Footer isActive={showWelcome || showResults} version={LIBRARY_VERSION}/>
        </header>
      </div>
    </ThemeProvider>
  );
}

export default App;
