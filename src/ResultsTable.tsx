import './index.css'
import DataTable, { TableColumn } from 'react-data-table-component'
import {ExpandedRow} from './ExpandedRow'
const stageImages = require.context('./stages/', true);
const characterIcons = require.context('./characters/', true);

export function StageIcon({ stageId }: { stageId: number}): JSX.Element {
  if (stageId === undefined) {
    return <div/>
  }
  let stage: string = stageImages(`./${stageId}.png`);
  return <img
            src={stage}
            width={48}
            alt={String(stageId)}
          />
}

export function CharacterIcon({ characterId, costume, results }: { characterId: number, costume: number, results: string}): JSX.Element {
  try {
    if (characterId === undefined) {
      return <div/>
    }
    let stage: string = characterIcons(`./${characterId}/${costume}/stock.png`);
    return (  <div>
                {results}
                <img
                  src={stage}
                  width={24}
                  height={24}
                  alt={String(characterId)}
                />
              </div>
            )
  } catch {
    return <div/>
  }
}

const ExpandedComponent = ({ data }: {data: any}) => <ExpandedRow results={[data]}/>

export type DataRow = {
  filename: string
  stage: number
  result: string
  p1results: string
  p2results: string
  p3results: string
  p4results: string
  characterIds: number[]
  costumes: number[]
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
    name: 'Stage',
    selector: row => row.stage,
    cell: (row) => (
      StageIcon({stageId: row.stage})
    ),
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
    cell: (row) => (
      CharacterIcon({characterId: row.characterIds[0], costume: row.costumes[0], results: row.p1results})
    ),
  },
  {
    name: 'P2',
    selector: row => row.p2results,
    maxWidth: "48px",
    cell: (row) => (
      CharacterIcon({characterId: row.characterIds[1], costume: row.costumes[1], results: row.p2results})
    ),
  },
  {
    name: 'P3',
    selector: row => row.p3results,
    maxWidth: "48px",
    cell: (row) => (
      CharacterIcon({characterId: row.characterIds[2], costume: row.costumes[2], results: row.p3results})
    ),
  },
  {
    name: 'P4',
    selector: row => row.p4results,
    maxWidth: "48px",
    cell: (row) => (
      CharacterIcon({characterId: row.characterIds[3], costume: row.costumes[3], results: row.p4results})
    ),
  },

]

export function ResultsTable({ results, isActive }: { results: DataRow[], isActive: boolean }): JSX.Element {
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
