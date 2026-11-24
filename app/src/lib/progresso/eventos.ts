import { LevelingCalculatorService } from '../../services/leveling-calculator.ts';
import { nivelDeVfx, type NivelVfx } from '../momentos/nivel-vfx.ts';
import type { ElementoDoDia } from '../momentos/elemento-do-dia.ts';

/**
 * What the person just did, read from the difference between two states of the
 * app. Read-only: nothing here writes, scores or persists; it only names the
 * moments that deserve an answer on screen and in sound.
 */
export interface ConclusaoNova {
  readonly tipo: 'conclusao';
  readonly id: string;
  readonly nome: string;
  readonly elemento: ElementoDoDia | null;
  readonly xp: number;
}

/** An element crossed into a higher level of the frame (Fluxo, then Domínio). */
export interface AscensaoNova {
  readonly tipo: 'ascensao';
  readonly elemento: ElementoDoDia;
  readonly nivel: 2 | 3;
  readonly maestria: number;
}

/** The mage's own level (the sum of the four XP) went up. One event, from the first level to the last. */
export interface NivelDoMago {
  readonly tipo: 'nivel';
  readonly de: number;
  readonly para: number;
  /** Mastery title of the new level. */
  readonly titulo: string;
}

export type EventoDeProgresso = ConclusaoNova | AscensaoNova | NivelDoMago;

interface HabitoLido {
  readonly id: string;
  readonly name?: string;
  readonly elementId: string;
  readonly sourceModule?: string;
  readonly completions?: readonly { readonly id: string; readonly xpAwarded?: number; readonly xpElementId?: string; readonly executedScore?: number }[];
  readonly childHabits?: readonly HabitoLido[];
}
interface AcaoLida {
  readonly id: string;
  readonly name?: string;
  readonly title?: string;
  readonly elementId: string;
  readonly completedAt?: Date | string | null;
  readonly completionXp?: { readonly amount: number; readonly elementId: string };
  readonly sourceModule?: string;
  readonly completedScore?: number | null;
}
interface UsuarioLido {
  readonly xp_fire: number;
  readonly xp_water: number;
  readonly xp_air: number;
  readonly xp_earth: number;
}
interface ConquistaLida {
  readonly id: string;
  readonly title?: string;
  readonly elementId: string;
  readonly isCompleted?: boolean;
  readonly completionBonus?: { readonly amount: number; readonly elementId: string };
}
export interface EstadoLido {
  readonly habits: readonly HabitoLido[];
  readonly actions: readonly AcaoLida[];
  /** Quests and Great Works: finishing one is a completion of its own, paying its bonus to its element. */
  readonly conquistas?: readonly ConquistaLida[];
  readonly user: UsuarioLido;
}

const ELEMENTOS: readonly ElementoDoDia[] = ['fogo', 'agua', 'ar', 'terra'];
const CHAVE_XP: Record<ElementoDoDia, keyof UsuarioLido> = {
  fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air', terra: 'xp_earth',
};
const comoElemento = (id: string | undefined): ElementoDoDia | null =>
  id !== undefined && (ELEMENTOS as readonly string[]).includes(id) ? (id as ElementoDoDia) : null;

/** Level of the frame an element has earned from its mastery. */
export function nivelDoElemento(usuario: UsuarioLido, elemento: ElementoDoDia): NivelVfx {
  return nivelDeVfx(LevelingCalculatorService.calculate(usuario[CHAVE_XP[elemento]]).level);
}

function recibos(estado: EstadoLido): Map<string, ConclusaoNova> {
  const mapa = new Map<string, ConclusaoNova>();
  const visitar = (habitos: readonly HabitoLido[]) => {
    for (const habito of habitos) {
      for (const c of habito.completions ?? []) {
        // A workout cycle pays its XP to Terra (the body) and records the score instead of a paid snapshot.
        const treino = habito.sourceModule === 'modulo_treino' && typeof c.xpAwarded !== 'number';
        const xp = typeof c.xpAwarded === 'number' && Number.isFinite(c.xpAwarded) ? c.xpAwarded
          : treino && typeof c.executedScore === 'number' && Number.isFinite(c.executedScore) ? Math.round(c.executedScore * 10) / 10 : 0;
        // A parent whose children already paid carries an explicit 0 of its own: it must not announce "+0".
        if (c.xpAwarded === 0) continue;
        mapa.set(`ciclo:${c.id}`, {
          tipo: 'conclusao', id: `ciclo:${c.id}`, nome: habito.name ?? '',
          elemento: treino ? 'terra' : comoElemento(c.xpElementId ?? habito.elementId),
          xp,
        });
      }
      visitar(habito.childHabits ?? []);
    }
  };
  visitar(estado.habits);
  for (const conquista of estado.conquistas ?? []) {
    if (!conquista.isCompleted || !conquista.completionBonus) continue;
    mapa.set(`conquista:${conquista.id}`, {
      tipo: 'conclusao', id: `conquista:${conquista.id}`, nome: conquista.title ?? '',
      elemento: comoElemento(conquista.completionBonus.elementId ?? conquista.elementId),
      xp: Number.isFinite(conquista.completionBonus.amount) ? conquista.completionBonus.amount : 0,
    });
  }
  for (const acao of estado.actions) {
    if (!acao.completedAt) continue;
    // A parent whose subitems already paid carries no XP of its own: it must not announce "+0".
    if (acao.completionXp && acao.completionXp.amount === 0) continue;
    // A workout action pays its score to Terra without a paid snapshot.
    const treino = acao.sourceModule === 'modulo_treino' && !acao.completionXp;
    mapa.set(`acao:${acao.id}`, {
      tipo: 'conclusao', id: `acao:${acao.id}`, nome: acao.name ?? acao.title ?? '',
      elemento: treino ? 'terra' : comoElemento(acao.completionXp?.elementId ?? acao.elementId),
      xp: treino ? (typeof acao.completedScore === 'number' && Number.isFinite(acao.completedScore) ? Math.round(acao.completedScore * 10) / 10 : 0) : acao.completionXp?.amount ?? 0,
    });
  }
  return mapa;
}

/**
 * The events between two states. A completion is new when its receipt was not
 * there before; an ascension is new when an element's frame level went up.
 * A level that goes down (a reverted receipt) is not an event.
 */
export function detectarEventos(antes: EstadoLido, depois: EstadoLido): EventoDeProgresso[] {
  const eventos: EventoDeProgresso[] = [];
  const anteriores = recibos(antes);
  for (const [id, conclusao] of recibos(depois)) {
    if (!anteriores.has(id)) eventos.push(conclusao);
  }
  for (const elemento of ELEMENTOS) {
    const de = nivelDoElemento(antes.user, elemento);
    const para = nivelDoElemento(depois.user, elemento);
    if (para > de && para >= 2) {
      eventos.push({
        tipo: 'ascensao', elemento, nivel: para as 2 | 3,
        maestria: LevelingCalculatorService.calculate(depois.user[CHAVE_XP[elemento]]).level,
      });
    }
  }
  const nivelAntes = LevelingCalculatorService.calculateAvatar(antes.user).level;
  const nivelDepois = LevelingCalculatorService.calculateAvatar(depois.user);
  if (nivelDepois.level > nivelAntes) {
    eventos.push({ tipo: 'nivel', de: nivelAntes, para: nivelDepois.level, titulo: nivelDepois.title });
  }
  return eventos;
}
