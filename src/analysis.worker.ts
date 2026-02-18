import init, { SlpGame } from 'slp-enforcer'
import type { PlayerAnalysis } from 'slp-enforcer'
import type { GameDataRow, CheckDataRow } from './ResultsTable'
import { CHECK_MAPPING, isViolation, getCheckViolations, violationArrayToDataRows } from './checkMapping'

let wasmReady = false

function runChecks(filename: string, buffer: ArrayBuffer): GameDataRow {
  const slpBytes = new Uint8Array(buffer)

  let game: SlpGame
  try {
    game = new SlpGame(slpBytes)
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

  try {
    let settings
    try {
      settings = game.getGameSettings()
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

    let playerPassed: string[] = ["✅", "✅", "✅", "✅"]
    let controllerType: string[] = ["?", "?", "?", "?"]
    let characterIds: number[] = [-1, -1, -1, -1]
    let costumes: number[] = [-1, -1, -1, -1]

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
      isTooOld = game.isSlpMinVersion()
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
      handwarmer = game.isHandwarmer()
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

    const vizDataRow: CheckDataRow = {
      name: "Control Stick Visualization",
      passed: ["", "", "", ""],
      violations: [[], [], [], []]
    }

    for (let i = 0; i < 4; i++) {
      if (!ports.includes(i)) {
        for (const cr of checkResultsMap) { cr.passed[i] = "" }
        playerPassed[i] = ""
        continue
      }

      try {
        const analysis: PlayerAnalysis = game.analyzePlayer(i)
        controllerType[i] = analysis.controller_type === "Box" ? "digital" : "analog"

        for (let idx = 0; idx < CHECK_MAPPING.length; idx++) {
          const { key, name } = CHECK_MAPPING[idx]
          const cr = checkResultsMap[idx]

          if (analysis[key] === undefined) {
            cr.passed[i] = ""
            continue
          }

          if (isViolation(analysis, key)) {
            cr.passed[i] = "❌"
            playerPassed[i] = "❌"
            failed = true
            cr.violations[i] = violationArrayToDataRows(getCheckViolations(analysis, key), name)
          }
        }
      } catch (err: any) {
        playerPassed[i] = "⦻"
        for (const cr of checkResultsMap) { cr.passed[i] = "⦻" }
        perPlayerErrors.push(`P${i + 1} analysis failed: ${err.message || 'Unknown error'}`)
      }

      // Control stick visualization
      try {
        const mainStickCoords = game.getMainStickCoords(i)
        vizDataRow.passed[i] = "✅"
        vizDataRow.violations[i] = [{
          checkName: "Control Stick Visualization",
          metric: 0,
          reason: "Control stick coordinate visualization",
          evidence: mainStickCoords,
        }]
      } catch { /* skip visualization on error */ }
    }

    checkResultsMap.push(vizDataRow)

    return {
      filename,
      stage: settings.stageId ?? -1,
      overallResult: failed ? "❌ Failed" : "✅ Passed",
      results: playerPassed,
      controllerTypes: controllerType,
      characterIds,
      costumes,
      details: checkResultsMap,
      errorReason: perPlayerErrors.length > 0 ? perPlayerErrors.join('; ') : undefined
    }
  } finally {
    game.free()
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
