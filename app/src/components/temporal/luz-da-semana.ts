import { createContext, type CSSProperties } from 'react';

/**
 * The light of the week (`--semana-acento` and `--semana-aura`), written by the
 * Temporal scene. A dialog is portaled out of the scene, so it reads the same
 * two properties from here and puts them back on itself.
 */
export const LuzDaSemanaContext = createContext<CSSProperties>({});
