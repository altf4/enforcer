import * as React from 'react'
import './App.css';
import {DropZone} from './DropZone'
import {ResultsTable, CheckResult, DataRow} from './ResultsTable'
import {ProgressBar} from './ProgressBar'

import {hasDisallowedCStickCoords, Coord} from 'slp-enforcer'
import {SlippiGame, FramesType} from 'slp-enforcer'

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

        let frames: FramesType = game.getFrames()
        let coords: Coord[] = []

        let frame: number = -123
        while (true) {
          try {
            let coord = new Coord()
            let x = frames[frame].players[0]?.pre.cStickX
            if (x !== undefined && x !== null) {
              coord.x = x
            }
            let y = frames[frame].players[0]?.pre.cStickY
            if (y !== undefined && y !== null) {
              coord.y = y
            }
            coords.push(coord)

          }
          catch(err) {
            break
          } 
          frame += 1
        }

        let passed = "¯\\_(ツ)_/¯  Unclear"
        let isHandwarmer = false
        // TODO Check for handwarmer
        if (isHandwarmer) {
          passed = "🔥 Handwarmer"
        } else {

          // TODO: Do all the individual checks here

          let passedChecks = !hasDisallowedCStickCoords(coords)
          if (passedChecks) {
            passed = "✅ Passed"
          } else {
            passed = "❌ Failed"
          }
        }

        let newResults: DataRow[] = results
        let checkResults: CheckResult[] = []

        let resultA: CheckResult = {
          name: "Disallowed C-Stick Coords",
          passed: passed,
        };
        checkResults.push(resultA)
        let fileResult: DataRow = {filename: inputFile.name, 
          result: passed, 
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
        <ResultsTable results={results} isActive={progress >= 1.0}></ResultsTable>
        <ProgressBar progress={progress} />
      </header>
    </div>
  );
}

export default App;
