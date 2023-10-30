import * as React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'

export type CheckResult = {
    name: string
    passed: boolean
    timestamps: number[]
}

var defaultData: CheckResult[] = [
    {
        name: "default",
        passed: true,
        timestamps: [0, 10]
    },
]

export function ResultsTable({ results }: { results: CheckResult[] }) {

  console.log("results: ", results)

  function getTableRows() {
    var rows = []
    for (var result of results) {
      rows.push(<td>{result.name}</td>)
      var passed: string = "✔"
      if (!result.passed) {
        passed = "❌"
      }
      rows.push(<td>{passed}</td>)
      rows.push(<td>{result.timestamps}</td>)
    }
    return rows
  }

  if (results.length == 0) {
    return
  }
  return (
    <div className="p-2">
      <table>
        <tr>
          <th>Name</th>
          <th>Result</th>
          <th>Timestamps</th>
        </tr>
        {getTableRows()}
      </table>
      <div className="h-4" />
    </div>
  )
}

