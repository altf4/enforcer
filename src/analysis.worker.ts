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
  } catch {
    return {
      filename,
      stage: -1,
      overallResult: "💀 Could Not Parse",
      results: ["⦻", "⦻", "⦻", "⦻"],
      controllerTypes: ["?", "?", "?", "?"],
      characterIds: [-1, -1, -1, -1],
      costumes: [-1, -1, -1, -1],
      details: []
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

  if (isSlpMinVersion(slpBytes)) {
    passed = "💀 SLP Too Old (Slippi >=3.15.0)"
    for (let i = 0; i < 4; i++) {
      playerPassed[i] = "⦻"
    }
  } else if (isHandwarmer(slpBytes)) {
    passed = "🔥 Handwarmer"
    for (let i = 0; i < 4; i++) {
      playerPassed[i] = "⦻"
    }
  } else {
    let failed = false

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

      controllerType[i] = isBoxController(slpBytes, i) ? "digital" : "analog"

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
    }

    passed = failed ? "❌ Failed" : "✅ Passed"
    checkResults = checkResultsMap
  }

  let ourStage: number = settings.stageId ?? -1

  return {
    filename,
    stage: ourStage,
    overallResult: passed,
    results: playerPassed,
    controllerTypes: controllerType,
    characterIds: characterIds,
    costumes: costumes,
    details: checkResults
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
      ctx.postMessage({
        type: 'error',
        taskId: msg.taskId,
        error: err.message || 'Unknown worker error'
      })
    }
  }
}
