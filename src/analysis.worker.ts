import init, { analyzeReplay, AllCheckResults, isBoxController } from 'slp-enforcer'
import { isHandwarmer, isSlpMinVersion, getGameSettings } from 'slp-enforcer'
import type { GameDataRow, CheckDataRow } from './ResultsTable'
import { CHECK_MAPPING, violationArrayToDataRows } from './checkMapping'

let wasmReady = false

function runChecks(filename: string, buffer: ArrayBuffer): GameDataRow {
  const slpBytes = new Uint8Array(buffer)

  let settings
  try {
    settings = getGameSettings(slpBytes)
  } catch (err: any) {
    return {
      filename,
      stage: -1,
      overallResult: "💀 Could Not Parse",
      results: ["⦻", "⦻", "⦻", "⦻"],
      controllerTypes: ["?", "?", "?", "?"],
      characterIds: [-1, -1, -1, -1],
      costumes: [-1, -1, -1, -1],
      details: [],
      errorReason: `Failed to parse SLP file: ${err.message || 'Unknown error'}`
    }
  }

  let passed = "✅ Passed"
  let playerPassed: string[] = ["✅", "✅", "✅", "✅"]
  let controllerType: string[] = ["?", "?", "?", "?"]
  let characterIds: number[] = [-1, -1, -1, -1]
  let costumes: number[] = [-1, -1, -1, -1]
  let checkResults: CheckDataRow[] = []

  const ports: number[] = settings.players.filter((p: any) => p.playerType === 0).map((p: any) => p.playerIndex)

  for (let i = 0; i < 4; i++) {
    if (ports.includes(i)) {
      const player = settings.players.find((p: any) => p.playerIndex === i)
      if (player) {
        characterIds[i] = player.characterId
        costumes[i] = player.characterColor
      }
    }
  }

  // Check SLP version
  let isTooOld = false
  try {
    isTooOld = isSlpMinVersion(slpBytes)
  } catch (err: any) {
    return {
      filename,
      stage: settings.stageId ?? -1,
      overallResult: "💀 Could Not Parse",
      results: ["⦻", "⦻", "⦻", "⦻"],
      controllerTypes: ["?", "?", "?", "?"],
      characterIds,
      costumes,
      details: [],
      errorReason: `Version check failed: ${err.message || 'Unknown error'}`
    }
  }

  if (isTooOld) {
    return {
      filename,
      stage: settings.stageId ?? -1,
      overallResult: "💀 SLP Too Old (Slippi >=3.15.0)",
      results: ["⦻", "⦻", "⦻", "⦻"],
      controllerTypes: controllerType,
      characterIds,
      costumes,
      details: []
    }
  }

  // Check for handwarmer
  let handwarmer = false
  try {
    handwarmer = isHandwarmer(slpBytes)
  } catch (err: any) {
    return {
      filename,
      stage: settings.stageId ?? -1,
      overallResult: "💀 Could Not Parse",
      results: ["⦻", "⦻", "⦻", "⦻"],
      controllerTypes: ["?", "?", "?", "?"],
      characterIds,
      costumes,
      details: [],
      errorReason: `Handwarmer check failed: ${err.message || 'Unknown error'}`
    }
  }

  if (handwarmer) {
    return {
      filename,
      stage: settings.stageId ?? -1,
      overallResult: "🔥 Handwarmer",
      results: ["⦻", "⦻", "⦻", "⦻"],
      controllerTypes: controllerType,
      characterIds,
      costumes,
      details: []
    }
  }

  // Run per-player analysis
  let failed = false
  const perPlayerErrors: string[] = []

  const checkResultsMap: CheckDataRow[] = CHECK_MAPPING.map(({ name }) => ({
    name,
    passed: ["✅ Passed", "✅ Passed", "✅ Passed", "✅ Passed"],
    violations: [[], [], [], []]
  }))

  for (let i = 0; i < 4; i++) {
    if (!ports.includes(i)) {
      for (const cr of checkResultsMap) { cr.passed[i] = "" }
      playerPassed[i] = ""
      continue
    }

    try {
      controllerType[i] = isBoxController(slpBytes, i) ? "digital" : "analog"
    } catch (err: any) {
      controllerType[i] = "?"
      perPlayerErrors.push(`P${i + 1} controller detection failed: ${err.message || 'Unknown error'}`)
    }

    try {
      const allResults: AllCheckResults = analyzeReplay(slpBytes, i)

      for (let idx = 0; idx < CHECK_MAPPING.length; idx++) {
        const { key, name } = CHECK_MAPPING[idx]
        const result = allResults[key]
        const cr = checkResultsMap[idx]

        if (result.result) {
          cr.passed[i] = "❌"
          playerPassed[i] = "❌"
          failed = true
          cr.violations[i] = violationArrayToDataRows(result.violations, name)
        }
        if (name === "Control Stick Visualization") {
          cr.passed[i] = "✅"
          cr.violations[i] = violationArrayToDataRows(result.violations, name)
        }
      }
    } catch (err: any) {
      playerPassed[i] = "⦻"
      for (const cr of checkResultsMap) { cr.passed[i] = "⦻" }
      perPlayerErrors.push(`P${i + 1} analysis failed: ${err.message || 'Unknown error'}`)
    }
  }

  passed = failed ? "❌ Failed" : "✅ Passed"
  checkResults = checkResultsMap

  let ourStage: number = settings.stageId ?? -1

  return {
    filename,
    stage: ourStage,
    overallResult: passed,
    results: playerPassed,
    controllerTypes: controllerType,
    characterIds: characterIds,
    costumes: costumes,
    details: checkResults,
    errorReason: perPlayerErrors.length > 0 ? perPlayerErrors.join('; ') : undefined
  }
}

// Worker message handler
// eslint-disable-next-line no-restricted-globals
const ctx = self as any

ctx.onmessage = async (e: MessageEvent) => {
  const msg = e.data

  if (msg.type === 'init') {
    try {
      if (!wasmReady) {
        await init()
        wasmReady = true
      }
      ctx.postMessage({ type: 'ready' })
    } catch (err: any) {
      ctx.postMessage({ type: 'error', taskId: -1, error: `WASM init failed: ${err.message}` })
    }
    return
  }

  if (msg.type === 'analyze') {
    try {
      if (!wasmReady) {
        await init()
        wasmReady = true
      }
      const result = runChecks(msg.filename, msg.buffer)
      ctx.postMessage({ type: 'result', taskId: msg.taskId, result })
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown worker error'
      ctx.postMessage({
        type: 'result',
        taskId: msg.taskId,
        result: {
          filename: msg.filename,
          stage: -1,
          overallResult: "💀 Could Not Parse",
          results: ["⦻", "⦻", "⦻", "⦻"],
          controllerTypes: ["?", "?", "?", "?"],
          characterIds: [-1, -1, -1, -1],
          costumes: [-1, -1, -1, -1],
          details: [],
          errorReason: `Unexpected error: ${errorMessage}`
        }
      })
    }
  }
}
