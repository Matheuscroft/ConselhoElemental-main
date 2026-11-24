import { LevelingCalculatorService, MASTERY_LADDER } from '../../services/leveling-calculator.ts';
import { LIMIARES } from '../momentos/nivel-vfx.ts';

/**
 * The way up, for the screen that lets someone watch their mastery: where each element and the mage stand, how far the
 * next step is and what it is called. Pure: it reads XP and answers with names and numbers, it writes nothing.
 */

export type DegrauDaBorda = 'faisca' | 'fluxo' | 'dominio';
export const DEGRAUS: ReadonlyArray<{ id: DegrauDaBorda; nome: string; nivel: number }> = [
  { id: 'faisca', nome: 'Faísca', nivel: 1 },
  { id: 'fluxo', nome: 'Fluxo', nivel: LIMIARES[0] },
  { id: 'dominio', nome: 'Domínio', nivel: LIMIARES[1] },
];

/** The XP a given level starts at (the sum of everything below it). Monotonic, so a search finds it. */
export function xpDoNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  let baixo = 0;
  let alto = 1;
  while (LevelingCalculatorService.calculate(alto).level < nivel) alto *= 2;
  while (baixo < alto) {
    const meio = Math.floor((baixo + alto) / 2);
    if (LevelingCalculatorService.calculate(meio).level >= nivel) alto = meio; else baixo = meio + 1;
  }
  return baixo;
}

export interface CaminhoDoElemento {
  readonly nivel: number;
  readonly titulo: string;
  /** 0..1 inside the current level. */
  readonly fracao: number;
  readonly xpTotal: number;
  readonly degrau: DegrauDaBorda;
  readonly degrauNome: string;
  /** The next step of the card's frame, when there is one. */
  readonly proximo?: { readonly id: DegrauDaBorda; readonly nome: string; readonly nivel: number; readonly faltamNiveis: number; readonly faltamXp: number };
}

export function caminhoDoElemento(xp: number): CaminhoDoElemento {
  const calculo = LevelingCalculatorService.calculate(xp);
  const atual = [...DEGRAUS].reverse().find((degrau) => calculo.level >= degrau.nivel) ?? DEGRAUS[0];
  const seguinte = DEGRAUS.find((degrau) => degrau.nivel > calculo.level);
  return {
    nivel: calculo.level,
    titulo: calculo.title,
    fracao: calculo.progressFraction,
    xpTotal: calculo.xpTotal,
    degrau: atual.id,
    degrauNome: atual.nome,
    proximo: seguinte ? {
      id: seguinte.id, nome: seguinte.nome, nivel: seguinte.nivel,
      faltamNiveis: seguinte.nivel - calculo.level,
      faltamXp: Math.max(0, xpDoNivel(seguinte.nivel) - calculo.xpTotal),
    } : undefined,
  };
}

export interface CaminhoDoMago {
  readonly nivel: number;
  readonly titulo: string;
  readonly fracao: number;
  readonly xpTotal: number;
  readonly xpParaProximoNivel: number;
  /** The next title on the ladder (Aprendiz, Adepto... Lenda), when there is one. */
  readonly proximoTitulo?: { readonly titulo: string; readonly nivel: number; readonly faltamNiveis: number };
  /** The top of the ladder, so the end of the road is always in sight. */
  readonly topo: { readonly titulo: string; readonly nivel: number };
}

export function caminhoDoMago(xpTotal: number): CaminhoDoMago {
  const calculo = LevelingCalculatorService.calculate(xpTotal);
  const seguinte = MASTERY_LADDER.find((degrau) => degrau.min > calculo.level);
  const topo = MASTERY_LADDER[MASTERY_LADDER.length - 1];
  return {
    nivel: calculo.level,
    titulo: calculo.title,
    fracao: calculo.progressFraction,
    xpTotal: calculo.xpTotal,
    xpParaProximoNivel: calculo.xpToNextLevel - (calculo.xpTotal - calculo.xpAtLevelStart),
    proximoTitulo: seguinte ? { titulo: seguinte.title, nivel: seguinte.min, faltamNiveis: seguinte.min - calculo.level } : undefined,
    topo: { titulo: topo.title, nivel: topo.min },
  };
}
