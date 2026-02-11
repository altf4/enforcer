import './index.css'
import digitalIcon from './icon/boxcord.png';
import analogIcon from './icon/contcord.png';
const stageImages = require.context('./stages/', true);
const characterIcons = require.context('./characters/', true);

export function StageIcon({ stageId }: { stageId: number}): JSX.Element {
  if (stageId === undefined) {
    return <div/>
  }
  try {
    let stage: string = stageImages(`./${stageId}.png`);
    return <img src={stage} width={48} alt={String(stageId)} />
  } catch {
    return <div/>
  }
}

export function ControllerTypeIcon({ controllerType }: { controllerType: string}): JSX.Element {
  if (controllerType === "digital") {
    return <img
      src={digitalIcon}
      width={24}
      alt={"📦"}
    />
  }
  if (controllerType === "analog") {
    return <img
      src={analogIcon}
      width={24}
      alt={"🕹️"}
    />
  }
  return <div>?</div>
}

export function ResultIcons({ characterId, costume, results, controllerType }: { characterId: number, costume: number, results: string, controllerType: string}): JSX.Element {
  try {
    if (characterId === undefined) {
      return <div/>
    }
    let stage: string = characterIcons(`./${characterId}/${costume}/stock.png`);
    return (  <div className="characterResultsContainer">
                <div className="resultsText">{results}</div>
                <ControllerTypeIcon controllerType={controllerType}/>
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

export type GameDataRow = {
  filename: string
  stage: number
  overallResult: string
  results: string[]
  characterIds: number[]
  controllerTypes: string[]
  costumes: number[]
  details: CheckDataRow[]
}

export type CheckDataRow = {
  name: string
  passed: string[]
  violations: ViolationsDataRow[][]
}

export type ViolationsDataRow = {
  checkName: string
  evidence: any[]
  reason: string
  metric: number
}
