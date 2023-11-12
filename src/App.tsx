import * as React from 'react'
import './App.css';
import {DropZone} from './DropZone'
import {ResultsTable, CheckResult, DataRow} from './ResultsTable'
import {ProgressBar} from './ProgressBar'

import {getCoordListFromGame, Coord, ListChecks, Check, getUniqueCoords, isBoxController} from 'slp-enforcer'
import {SlippiGame, isHandwarmer, averageTravelCoordHitRate} from 'slp-enforcer'

function App() {
  const [results, updateResults] = React.useState<DataRow[]>([])
  const [progress, setProgress] = React.useState<number>(100)

  function runChecks(inputFile: File, currentProgress: number) {
    const reader = new FileReader()
    reader.onabort = () => console.log('file reading was aborted')
    reader.onerror = () => console.log('file reading has failed')
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

      let newResults: DataRow[] = results
      let checkResults: CheckResult[] = []

      // TODO Check for handwarmer
      if (isHandwarmer(game)) {
        passed = "🔥 Handwarmer"
        for (let i=0; i<4; i++) {
          playerPassed[i] = "⦻ Skipped"
        }
      } else {

        // TODO: Do all the individual checks here
        let checks: Check[]
        checks = ListChecks()

        // const playerTypes = game.getSettings()?.players.map((player) => player.type);

        const ports: number[] | undefined = game.getSettings()?.players.filter(player=> player.type === 0).map((player) => player.playerIndex);
        if (ports === undefined) {
          return
        }

        for (let check of checks) {
          let checkResult: CheckResult = {
            name: check.name,
            passed: ["✅ Passed", "✅ Passed", "✅ Passed", "✅ Passed"]
          }
          for (let i=0; i<4; i++) {
            if (!ports.includes(i)) {
              checkResult.passed[i] = "█ No player"
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
            if(isBoxController(getCoordListFromGame(game, i, true))) {
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

     
      let fileResult: DataRow = {filename: inputFile.name, 
        result: passed,
        p1results: playerPassed[0],
        p2results: playerPassed[1],
        p3results: playerPassed[2],
        p4results: playerPassed[3],
        details: checkResults
      }
      newResults.push(fileResult)
      
      updateResults(newResults)
    }
    reader.readAsArrayBuffer(inputFile)
    setProgress(currentProgress)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>SLP Enforcer</div>
        <DropZone dropHandler={runChecks}> setProgress={setProgress}</DropZone>
        <ResultsTable results={results} isActive={progress >= 1.0 && results.length > 0}></ResultsTable>
        <ProgressBar progress={progress} />
      </header>
    </div>
  );
}

export default App;
