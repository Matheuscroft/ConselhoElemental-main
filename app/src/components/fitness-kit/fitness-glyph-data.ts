/** Original 32px illustrations. Anatomical highlights sit over a human silhouette;
 * equipment and movements use literal shapes instead of ornamental symbols. */
export const BODY_OUTLINES = {
  upper: 'M13 9v2l-4 1c-2 1-3 4-4 7l-2 7 4 1 4-9v5l-1 7h12l-1-7v-5l4 9 4-1-2-7c-1-3-2-6-4-7l-4-1V9',
  lower: 'M9 3h14l1 6-2 8-1 9 3 2v2h-7l-1-12-1-6h-1l-1 6-1 12H5v-2l3-2-1-9-1-8 3-6Z',
} as const;
export const ANATOMY = {
  chest: {body:'upper', target:'M11 14q2-2 4-1v5q-3 1-5-1l1-3Zm6-1q2-1 4 1l1 3q-2 2-5 1v-5Z'},
  back: {body:'upper', rear:true, target:'M11 13l5 2 5-2v5l-3 7h-4l-3-7v-5Z'},
  shoulders: {body:'upper', target:'M9 13q2-1 3 1l-2 5-3-1 2-5Zm14 0 2 5-3 1-2-5q1-2 3-1Z'},
  arms: {body:'upper', target:'m8 16 3 1-4 9-3-1 4-9Zm16 0 4 9-3 1-4-9 3-1Z'},
  core: {body:'upper', target:'M13 19h6v9h-6v-9Z', detail:'M16 19v9m-3-6h6m-6 3h6'},
  legs: {body:'lower', target:'M9 7h5l-2 11-1 8H9L8 16 9 7Zm8 0h5l1 9-2 10h-2l-1-8-1-11Z'},
  upper_back: {body:'upper', rear:true, target:'M11 13l5 1 5-1v5l-5 2-5-2v-5Z'},
  lats: {body:'upper', rear:true, target:'m11 16 4 3v7l-3-3-1-7Zm10 0-1 7-3 3v-7l4-3Z'},
  lower_back: {body:'upper', rear:true, target:'M13 23l3-2 3 2 1 5h-8l1-5Z'},
  biceps: {body:'upper', target:'m8 16 3 1-2 5-3-1 2-5Zm16 0 2 5-3 1-2-5 3-1Z'},
  triceps: {body:'upper', rear:true, target:'m8 15 3 2-2 5-3-1 2-6Zm16 0 2 6-3 1-2-5 3-2Z'},
  forearms: {body:'upper', target:'m5 22 3 1-1 3-3-1 1-3Zm22 0 1 3-3 1-1-3 3-1Z'},
  obliques: {body:'upper', target:'M11 20l3 2-1 6h-2l1-5-1-3Zm10 0-1 3 1 5h-2l-1-6 3-2Z'},
  glutes: {body:'lower', rear:true, target:'M9 6h6v6q-4 3-7 0l1-6Zm7 0h6l1 6q-3 3-7 0V6Z'},
  quadriceps: {body:'lower', target:'M9 8h5l-2 10H9L8 14l1-6Zm8 0h5l1 6-1 4h-3L17 8Z'},
  hamstrings: {body:'lower', rear:true, target:'M9 13h4l-1 6H9l-1-4 1-2Zm9 0h4l1 2-1 4h-3l-1-6Z'},
  adductors: {body:'lower', target:'m12 7 3 1-2 8-2 2 1-11Zm4 1 3-1 2 11-2-2-3-8Z'},
  calves: {body:'lower', rear:true, target:'M9 19h3l-1 6H9v-6Zm10 0h3l-1 6h-2v-6Z'},
  tibialis: {body:'lower', target:'m9 19 2 1-1 6H9v-7Zm11 1 2-1-1 7h-1v-6Z'},
  serratus: {body:'upper', target:'m10 18 3 1v5l-2-1-1-5Zm12 0-1 5-2 1v-5l3-1Z', detail:'m10 19 3 1m-2 1 2 1m9-3-3 1m2 1-2 1'},
} as const;

/** Filled parts make people/plates visible at 20–32px; detail lines remain sparse. */
export const MOVEMENTS = {
  running: {head:[20,5,3], fill:'m17 10 5 2-4 7-5-3 4-6Z', line:'m17 11-6 2-3 5m12-5 5 3h4 M16 18l5 4 2 7m-10-11-4 7H3 M3 9h5M1 13h5'},
  swimming: {head:[24,12,3], fill:'m8 18 7-8 6 3-7 7-6-2Z', line:'m15 10-4-6-6 3 M3 23q3-3 6 0t6 0 6 0 6 0 M3 28q3-3 6 0t6 0 6 0 6 0'},
  martial_arts: {fill:'M11 4 6 7 2 14l5 3 4-5v16h10V12l4 5 5-3-4-7-5-3H11Z', line:'m11 4 5 9 5-9M16 13l-3 5', accent:'M10 18h12v3H10v-3Zm5 3-3 7h3l2-7h-2Zm2 0 3 7h3l-4-7h-2Z', neutral:true},
  cycling: {head:[19,5,2.5], fill:'m15 9 5 2-4 5-5-3 4-4Z', line:'m15 10-5 5 6 4-1 6m5-14 4 4h4 M8 25l6-10h7l4 10H8Zm6-10-2-3H9', circles:[[7,25,5],[25,25,5]]},
  strength: {fill:'M4 9h4v14H4V9Zm20 0h4v14h-4V9Z', line:'M8 16h16M1 13v6m30-6v6M11 7h10'},
  hypertrophy: {fill:'M5 23l3-7V9l4-2 3 3-4 3v4l6 1 6-4 5 4-2 7-9 4-9-2-3-4Z', line:'m8 18 4 3q4-6 9-1 M20 5h8m-4-4v8'},
  calisthenics: {head:[16,12,2.5], fill:'M13 16h6v8h-6v-8Z', line:'M2 4h28M7 4v9l6 4m12-13v9l-6 4 M14 23l-3 7m7-7 3 7'},
  yoga: {head:[16,6,3], fill:'M13 11h6l1 10h-8l1-10Z', line:'m13 13-5 8-5 1m16-9 5 8 5 1 M13 21l-7 6q10 6 20 0l-7-6 M10 29h12'},
  mobility: {head:[13,5,3], fill:'m12 10 6 2-2 9-5-1 1-10Z', line:'m13 12-7 5-4-1m15-3 5-4 6-6 M12 20l-2 9m6-9 8 5 5-1 M25 13q4 3 3 7m-1-3 1 3 3-1'},
  conditioning: {fill:'M16 28S3 21 3 12c0-7 9-9 13-3 4-6 13-4 13 3 0 9-13 16-13 16Z', line:'M6 16h5l3-6 4 12 3-6h5', inverse:true},
  mixed: {fill:'M3 5h10v9H3V5Zm16 0h10v9H19V5ZM3 20h10v9H3v-9Zm16 0h10v9H19v-9Z', line:'M5 10h6m-3-3v6 M21 10h6 M5 24h6m16 0h-6m3-3v6'},
  custom: {fill:'M5 3h15l6 6v20H5V3Z', line:'M20 3v7h6 M10 15h11m-11 5h6m-6 5h4'},
  barbell: {fill:'M4 5h3v22H4V5Zm21 0h3v22h-3V5ZM7 9h3v14H7V9Zm15 0h3v14h-3V9Z', line:'M10 16h12M1 12v8m30-8v8'},
  dumbbell: {fill:'M5 7h5v18H5V7Zm17 0h5v18h-5V7ZM2 11h3v10H2V11Zm25 0h3v10h-3V11Z', line:'M10 16h12'},
  bench: {fill:'M3 13h23l3 4H3v-4Z', line:'M8 17 5 29m18-12 4 12M3 29h6m15 0h6'},
  cable: {fill:'M5 4h4v26H5V4Zm18 0h4v26h-4V4ZM13 20h6v9h-6v-9Z', line:'M7 4h18M7 7h9v6m0-6h9 M12 16l4-3 4 3M16 16v4M3 30h26'},
  machine: {fill:'M7 3h4v26H7V3Zm4 16h12v4H11v-4Z', line:'M9 3h15v12h-5 M24 8l5 4M21 23l4 7M4 30h24 M11 8h6v8h-6'},
  band: {fill:'M7 5c-6 0-6 20 0 22 6 2 12-25 18-22 6 3 5 24-1 22C18 25 13 5 7 5Z', line:'M6 9q1-3 3 0m14 14q2 3 3 0'},
  plate: {fill:'M16 2a14 14 0 1 0 0 28 14 14 0 0 0 0-28Z', line:'M16 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8M8 9l2 2m12-2-2 2M8 23l2-2m12 2-2-2'},
  kettlebell: {fill:'M8 13q-5 8 0 15h16q5-7 0-15H8Z', line:'M10 13V8a6 6 0 0 1 12 0v5 M14 6h4'},
  ez_bar: {fill:'M3 8h5v16H3V8Zm21 0h5v16h-5V8Z', line:'m8 16 4-3 8 6 4-3M1 13v6m30-6v6'},
  rack: {fill:'M5 3h3v27H5V3Zm19 0h3v27h-3V3Z', line:'M5 3h22M7 8h18M10 13h12M10 10v6m12-6v6 M2 30h9m10 0h9'},
  preacher_bench: {fill:'m5 10 14-6 3 5-14 7-3-6ZM17 19h11v4H17v-4Z', line:'m11 15-5 15m13-7 4 7M16 12l3 7M3 30h8m10 0h8'},
  wrist_roller: {fill:'M3 3h26v5H3V3ZM12 23h8v7h-8v-7Z', line:'M16 8v15M6 1v9m20-9v9M13 12l6 2-6 3 6 3'},
  earth: {fill:'m5 18 8-13 10 4 5 14-13 6L3 24l2-6Z', line:'m13 5 2 13 8-9m-8 9 13 5m-13-5v11L5 18'},
} as const;
export type FitnessGlyphName = keyof typeof ANATOMY | keyof typeof MOVEMENTS;
