import * as React from 'react'
import './App.css';
import { DropZone } from './DropZone'
import { ResultsTable, CheckResult, DataRow } from './ResultsTable'
import { ProgressBar } from './ProgressBar'

import { getCoordListFromGame, Coord, ListChecks, Check, getUniqueCoords, isBoxController } from 'slp-enforcer'
import { SlippiGame, isHandwarmer, isSlpMinVersion } from 'slp-enforcer'

function App() {
  const [results, updateResults] = React.useState<DataRow[]>([])
  const [progress, setProgress] = React.useState<number>(1)

  async function handleResults(newResults: DataRow[]) {
    updateResults(oldList => [...oldList, ...newResults])
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
        playerPassed.push("✅ Passed")
        playerPassed.push("✅ Passed")
        playerPassed.push("✅ Passed")
        playerPassed.push("✅ Passed")
        let characterIds: number[] = [-1, -1, -1, -1]
        let costumes: number[] = [-1, -1, -1, -1]

        let checkResults: CheckResult[] = []

        const ports: number[] | undefined = game.getSettings()?.players.filter(player => player.type === 0).map((player) => player.playerIndex);
        if (ports === undefined) {
          return
        }

        // Get character IDs, costumes
        for (let i = 0; i < 4; i++) {
          if (ports.includes(i)) {
            for (let player of game.getSettings()?.players!) {
              if (player.playerIndex == i) {
                // Wow, that was a lot just to match these
                characterIds[i] = player.characterId!
                costumes[i] = player.characterColor!
              }
            }
          }
        }

        if (isSlpMinVersion(game)) {
          console.log("old")
          passed = "💀 SLP Too Old (Slippi >=3.15.0)"
          for (let i = 0; i < 4; i++) {
            playerPassed[i] = "⦻ Skipped"
          }
        } else if (isHandwarmer(game)) {
          passed = "🔥 Handwarmer"
          for (let i = 0; i < 4; i++) {
            playerPassed[i] = "⦻ Skipped"
          }
        } else {

          let checks: Check[]
          checks = ListChecks()

          for (let check of checks) {
            let checkResult: CheckResult = {
              name: check.name,
              passed: ["✅ Passed", "✅ Passed", "✅ Passed", "✅ Passed"]
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

              // Only do checks for boxes
              if (isBoxController(getCoordListFromGame(game, i, true))) {
                if (check.checkFunction(game, i, coords)) {
                  checkResult.passed[i] = "❌ Failed"
                  playerPassed[i] = "❌ Failed"
                  passed = "❌ Failed"
                }
              }

            }
            checkResults.push(checkResult)
          }
        }

        let ourStage: number = game.getSettings()?.stageId!
        if (ourStage === undefined || ourStage === null) {
          ourStage = -1
        }

        let fileResult: DataRow = {
          filename: inputFile.name,
          stage: ourStage,
          result: passed,
          p1results: playerPassed[0],
          p2results: playerPassed[1],
          p3results: playerPassed[2],
          p4results: playerPassed[3],
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
      </header>
    </div>
  );
}

export default App;
