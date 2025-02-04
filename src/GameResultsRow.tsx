import './index.css'
import DataTable, { TableColumn } from 'react-data-table-component'
import {GameDataRow, ViolationsDataRow} from './ResultsTable'
import {ViolationsResultsRow} from './ViolationResultsRow'

export type GameDisplayRow = {
  name: string
  p1result: string
  p2result: string
  p3result: string
  p4result: string
  violations: ViolationsDataRow[][]
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

const columns: TableColumn<GameDisplayRow>[] = [
  {
    name: 'Check Name',
    selector: row => row.name,
    maxWidth: "256px",
    minWidth: "128px",
    sortable: true,
  },    
  {
    name: 'P1',
    selector: row => row.p1result,
    maxWidth: "48px",
  },
  {
    name: 'P2',
    selector: row => row.p2result,
    maxWidth: "48px",
  },
  {
    name: 'P3',
    selector: row => row.p3result,
    maxWidth: "48px",
  },
  {
    name: 'P4',
    selector: row => row.p4result,
    maxWidth: "48px",
  },

]

const ExpandedComponent = ({ data }: {data: any}) => <ViolationsResultsRow checkDataRow={data}/>

export function GameResultsRow({ results }: { results: GameDataRow }): JSX.Element {
    let expandedDataRows: GameDisplayRow[] = []
    for (let checkResult of results.details) {
      let expandedDataRow: GameDisplayRow = {
        name: checkResult.name,
        p1result: checkResult.passed[0],
        p2result: checkResult.passed[1],
        p3result: checkResult.passed[2],
        p4result: checkResult.passed[3],
        violations: checkResult.violations
      }
      if (checkResult.name === "Control Stick Visualization") {
        expandedDataRow = {
          name: checkResult.name,
          p1result: "",
          p2result: "",
          p3result: "",
          p4result: "",
          violations: checkResult.violations
        }
        console.log("vio", checkResult.violations)
      }
      expandedDataRows.push(expandedDataRow)
    }

    return <DataTable columns={columns}
                    data={expandedDataRows}
                    customStyles={customStyles}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
            />
}
