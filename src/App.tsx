import * as React from 'react'
import './App.css';
import {DropZone} from './DropZone'
import {ResultsTable, CheckResult} from './CheckResults'
import {hasDisallowedCStickCoords, Coord} from 'slp-enforcer'
import {SlippiGame, FramesType} from 'slp-enforcer'

function App() {
  const [results, updateResults] = React.useState<CheckResult[]>([])

  function runChecks(inputFile: any) {
    const reader = new FileReader()
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        const game = new SlippiGame(binaryStr as ArrayBuffer);

        var frames: FramesType = game.getFrames()
        var coords: Coord[] = []

        var frame: number = -123
        while (true) {
          try {
            var coord = new Coord()
            var x = frames[frame].players[0]?.pre.cStickX
            if (x !== undefined && x !== null) {
              coord.x = x
            }
            var y = frames[frame].players[0]?.pre.cStickY
            if (y !== undefined && y !== null) {
              coord.y = y
            }
            coords.push(coord)

          }
          catch(err) {
            console.log("max frames: ", frame, err)
            break
          } 
          frame += 1
        }

        console.log("Has disallowed coords: ", hasDisallowedCStickCoords(coords))
        var newResults: CheckResult[] = []
        var resultA: CheckResult = {
          name: "Disallowed C-Stick Coords",
          passed: !hasDisallowedCStickCoords(coords),
          timestamps: [],
        };

        newResults.push(resultA)

        updateResults(newResults)
      }
      reader.readAsArrayBuffer(inputFile)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>SLP Enforcer</div>
        <DropZone dropHandler={runChecks}></DropZone>
        <ResultsTable results={results}></ResultsTable>
      </header>
    </div>
  );
}

export default App;
