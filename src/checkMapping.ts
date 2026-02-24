import type { PlayerAnalysis, CheckResult, FuzzAnalysis, Violation } from 'slp-enforcer'
import type { ViolationsDataRow } from './ResultsTable'

type CheckKey = 'travel_time' | 'disallowed_cstick' | 'uptilt_rounding'
  | 'crouch_uptilt' | 'sdi' | 'goomwave' | 'input_fuzzing'

export const CHECK_MAPPING: { key: CheckKey; name: string }[] = [
  { key: 'travel_time', name: 'Box Travel Time' },
  { key: 'disallowed_cstick', name: 'Disallowed Analog C-Stick Values' },
  { key: 'uptilt_rounding', name: 'Uptilt Rounding' },
  { key: 'crouch_uptilt', name: 'Fast Crouch Uptilt' },
  { key: 'sdi', name: 'Illegal SDI' },
  { key: 'goomwave', name: 'GoomWave Clamping' },
  { key: 'input_fuzzing', name: 'Input Fuzzing' },
]

export function isViolation(analysis: PlayerAnalysis, key: CheckKey): boolean {
  const field = analysis[key]
  if (field === undefined) return false
  if (key === 'input_fuzzing') {
    return !(field as FuzzAnalysis).pass
  }
  return (field as CheckResult).result
}

export function getCheckViolations(analysis: PlayerAnalysis, key: CheckKey): Violation[] {
  const field = analysis[key]
  if (field === undefined) return []
  if (key === 'input_fuzzing') {
    return (field as FuzzAnalysis).violations ?? []
  }
  return (field as CheckResult).details ?? []
}

export function violationArrayToDataRows(violations: Violation[], checkName: string): ViolationsDataRow[] {
  return violations.map(v => ({
    checkName,
    metric: v.metric,
    reason: v.reason,
    evidence: v.evidence,
  }))
}
