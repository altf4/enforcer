import './index.css'
import DataTable, { TableColumn } from 'react-data-table-component'
import {ExpandedRow} from './ExpandedRow'

const ExpandedComponent = ({ data }: {data: any}) => <ExpandedRow results={[data]}/>

export type DataRow = {
  filename: string
  result: string
  p1results: string
  p2results: string
  p3results: string
  p4results: string
  details: CheckResult[]
}

export type CheckResult = {
  name: string
  passed: string[] // Array in player order
}

const customStyles = {
  rows: {
      style: {
          minHeight: '32px', // override the row height
          color: "white",
          backgroundColor: "#282c34",
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

const columns: TableColumn<DataRow>[] = [
  {
      name: 'Filename',
      selector: row => row.filename,
      sortable: true,
  },
  {
      name: 'Result',
      selector: row => row.result,
      sortable: true,
  },
  {
    name: 'P1',
    selector: row => row.p1results,
    maxWidth: "48px",
  },
  {
    name: 'P2',
    selector: row => row.p2results,
    maxWidth: "48px",
  },
  {
    name: 'P3',
    selector: row => row.p3results,
    maxWidth: "48px",
  },
  {
    name: 'P4',
    selector: row => row.p4results,
    maxWidth: "48px",
  },

]

export function ResultsTable({ results, isActive }: { results: DataRow[], isActive: boolean }): JSX.Element {
  if (!isActive) {
    return <div/>
  }
  console.log("Results length: ", results.length, results)
  return <DataTable columns={columns}
                    data={results}
                    customStyles={customStyles}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
          />
}
