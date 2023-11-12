import './index.css'
import DataTable, { TableColumn } from 'react-data-table-component'
import {DataRow} from './ResultsTable'

export type ExpandedDataRow = {
  name: string
  p1result: string
  p2result: string
  p3result: string
  p4result: string
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

const columns: TableColumn<ExpandedDataRow>[] = [
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

export function ExpandedRow({ results }: { results: DataRow[] }): JSX.Element {
    let expandedDataRows: ExpandedDataRow[] = []
    for (let checkResult of results[0].details) {
      let expandedDataRow: ExpandedDataRow = {
        name: checkResult.name,
        p1result: checkResult.passed[0],
        p2result: checkResult.passed[1],
        p3result: checkResult.passed[2],
        p4result: checkResult.passed[3],
      }
      expandedDataRows.push(expandedDataRow)
    }

    return <DataTable columns={columns}
                    data={expandedDataRows}
                    customStyles={customStyles}
            />
}
