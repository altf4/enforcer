import * as React from 'react'
import './App.css';
import { DropZone } from './DropZone'
import { ResultsTable, CheckDataRow, GameDataRow, ViolationsDataRow } from './ResultsTable'
import { ProgressBar } from './ProgressBar'
import { Footer } from './Footer'; 

import { getCoordListFromGame, Coord, ListChecks, Check, isBoxController, Violation } from 'slp-enforcer'
import { SlippiGame, isHandwarmer, isSlpMinVersion } from 'slp-enforcer'

let LIBRARY_VERSION: string = "1.4.1"

function App() {
  const [results, updateResults] = React.useState<GameDataRow[]>([])
  const [progress, setProgress] = React.useState<number>(1)

  async function handleResults(newResults: GameDataRow[]) {
    updateResults(oldList => [...oldList, ...newResults])
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

  return (
    <div className="App">
      <header className="App-header">
        <div className="title" >SLP Enforcer</div>
        <DropZone processFile={runChecks} isActive={progress < 1.0 || results.length === 0} setProgress={setProgress} handleResults={handleResults} />
        <ResultsTable results={results} isActive={progress >= 1.0 && results.length > 0}></ResultsTable>
        <ProgressBar progress={progress} />
        <Footer isActive={progress < 1.0 || results.length === 0} version={LIBRARY_VERSION}/>
      </header>
    </div>
  );
}

export default App;
