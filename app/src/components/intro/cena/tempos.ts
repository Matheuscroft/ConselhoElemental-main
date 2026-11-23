/**
 * Timings the shell needs without loading the 3D chunk (this file imports nothing from Three.js).
 * "Entrar na história", in scene seconds: the dive lasts `mergulho`; the veil starts covering at `cobrir`;
 * at `pico` the light covers the screen and the next screen is mounted underneath.
 */
export const TEMPOS_HISTORIA = { mergulho: 1.95, cobrir: 1.7, pico: 2.05, dissolver: 0.75 } as const;
