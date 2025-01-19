import './index.css'
import DataTable, { TableColumn } from 'react-data-table-component'
import {CheckDataRow, ViolationsDataRow} from './ResultsTable'
import {CoordElement} from './CoordElement'

export type ViolationsDisplayRow = {
  checkName: string
  contents: JSX.Element[]
}

function RenderViolation(dataRow: ViolationsDataRow): JSX.Element {
    if (dataRow.checkName === "Illegal SDI") {
        let elements: JSX.Element[] = [<div>{dataRow.reason}</div>]
        for (let [i, coord] of dataRow.evidence.entries()) {
            elements.push(<CoordElement frameNumber={dataRow.metric + i} x={coord.x} y={coord.y}/>)
        } 
        return <div>{elements}</div>
    }

    if (dataRow.checkName === "Box Travel Time") {
        return <div>Only {(dataRow.metric * 100).toFixed(2)}% of main stick movements have travel (Should be above 25%)</div>
    }

    if (dataRow.checkName === "Uptilt Rounding") {
        return <div>{dataRow.reason}</div>
    }

    if (dataRow.checkName === "Disallowed Analog C-Stick Values") {
        if (dataRow.evidence.length === 0) {
            console.error("No evidence provided with this check. There should have been!")
        }
        return <div>{dataRow.reason}: ({dataRow.evidence[0].x}, {dataRow.evidence[0].y})</div>
    }

    if (dataRow.checkName === "Fast Crouch Uptilt") {
        let elements: JSX.Element[] = []
        for (let [i, coord] of dataRow.evidence.entries()) {
            elements.push(<div>Frame: {dataRow.metric + i} Main stick: ({coord.x}, {coord.y})</div>)
        } 
        return <div>{elements}</div>
    }
    
    console.error("Unknown check: ", dataRow.checkName)
    return <div>Unknown check: {dataRow.checkName}</div>
}

const customStyles = {
  rows: {
      style: {
          minHeight: '32px', // override the row height
          color: "white",
          backgroundColor: "#828282",
      },
  },
  headCells: {
      style: {
          paddingLeft: '8px', // override the cell padding for head cells
          paddingRight: '8px',
          color: "white",
          backgroundColor: "#5e5f62",
      },
  },
  cells: {
      style: {
          paddingLeft: '8px', // override the cell padding for data cells
          paddingRight: '8px',
      },
  },
};

const columns: TableColumn<ViolationsDisplayRow>[] = [
  {
    name: 'P1',
    cell: (row) => (
        row.contents[0]
    ),
  },
  {
    name: 'P2',
    cell: (row) => (
        row.contents[1]
    ),
  },
  {
    name: 'P3',
    cell: (row) => (
        row.contents[2]
    ),
  },
  {
    name: 'P4',
    cell: (row) => (
        row.contents[3]
    ),
  },

]

export function ViolationsResultsRow({ checkDataRow }: { checkDataRow: CheckDataRow }): JSX.Element {
    let expandedDataRows: ViolationsDisplayRow[] = []
    let violationPlayerArray = checkDataRow.violations

    for (const [playerIndex, violations] of violationPlayerArray.entries()) {
        for (let [violationIndex, violation] of violations.entries()) {
            
            if (expandedDataRows.length <= violationIndex) {
                expandedDataRows.push({checkName: checkDataRow.name, contents: [<></>, <></>, <></>, <></>]})
            }
            expandedDataRows[violationIndex].contents[playerIndex] = RenderViolation(violation)
        }
    }

    return <DataTable columns={columns}
                    data={expandedDataRows}
                    customStyles={customStyles}
            />
}
