import './index.css'
import DataTable, { TableColumn } from 'react-data-table-component'

const ExpandedComponent = ({ data }: {data: any}) => <pre>{JSON.stringify(data, null, 2)}</pre>;

export type DataRow = {
  filename: string
  result: string
  details: CheckResult[]
}

export type CheckResult = {
  name: string
  passed: string
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
  }
]

export function ResultsTable({ results, isActive }: { results: DataRow[], isActive: boolean }): JSX.Element {
  if (results.length === 0) {
    return <div/>
  }
  if (!isActive) {
    return <div/>
  }
  return <DataTable columns={columns}
                    data={results}
                    customStyles={customStyles}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
          />
}
