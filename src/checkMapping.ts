import type { AllCheckResults, Violation } from 'slp-enforcer'
import type { ViolationsDataRow } from './ResultsTable'

export const CHECK_MAPPING: { key: keyof AllCheckResults; name: string }[] = [
  { key: 'travel_time', name: 'Box Travel Time' },
  { key: 'disallowed_cstick', name: 'Disallowed Analog C-Stick Values' },
  { key: 'uptilt_rounding', name: 'Uptilt Rounding' },
  { key: 'crouch_uptilt', name: 'Fast Crouch Uptilt' },
  { key: 'sdi', name: 'Illegal SDI' },
  { key: 'goomwave', name: 'GoomWave Clamping' },
  { key: 'control_stick_viz', name: 'Control Stick Visualization' },
]

export function violationArrayToDataRows(violations: Violation[], checkName: string): ViolationsDataRow[] {
  return violations.map(v => ({
    checkName,
    metric: v.metric,
    reason: v.reason,
    evidence: v.evidence,
  }))
}
