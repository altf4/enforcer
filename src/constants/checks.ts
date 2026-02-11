export const CHECK_NAMES = [
  'Box Travel Time',
  'Disallowed Analog C-Stick Values',
  'Uptilt Rounding',
  'Fast Crouch Uptilt',
  'Illegal SDI',
  'GoomWave Clamping',
] as const;

export type CheckName = typeof CHECK_NAMES[number];
