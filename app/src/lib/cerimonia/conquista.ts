import type { ElementoId } from '../design/palette.ts';
import type { Premio } from './cerimonia.ts';
import { LevelingCalculatorService } from '../../services/leveling-calculator.ts';

const NOME: Record<ElementoId, string> = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' };

export interface DadosDaConquista {
  readonly tipo: 'quest' | 'project';
  readonly nome: string;
  readonly elemento: ElementoId;
  /** What the bonus paid, in XP. */
  readonly bonus: number;
  /** The element's XP before and after finishing. */
  readonly xpAntes: number;
  readonly xpDepois: number;
  /** The mage's own level before and after. */
  readonly magoAntes: number;
  readonly magoDepois: number;
}

/**
 * The ceremony for finishing a whole Journey or Great Work: the name of what was done in the element's colour, the
 * element's XP counting up by the bonus, and the one thing it unlocked (a level of the element, a level of the mage,
 * or simply the bonus). Pure: it reads numbers and names nothing it was not given.
 */
export function premioDeConquista(dados: DadosDaConquista): Premio {
  const elemento = NOME[dados.elemento];
  const tipo = dados.tipo === 'quest' ? 'Jornada concluída' : 'Grande Obra concluída';
  const bonus = Math.max(0, Math.round(dados.bonus));
  const nivelAntes = LevelingCalculatorService.calculate(dados.xpAntes).level;
  const nivelDepois = LevelingCalculatorService.calculate(dados.xpDepois).level;
  const destrave = nivelDepois > nivelAntes
    ? { titulo: `${elemento} chegou ao nível ${nivelDepois}`, detalhe: 'A maestria deste elemento subiu' }
    : dados.magoDepois > dados.magoAntes
      ? { titulo: `Você chegou ao nível ${dados.magoDepois}`, detalhe: 'Seu nível de mago subiu' }
      : bonus > 0 ? { titulo: 'Bônus da conquista', detalhe: `+${bonus} XP de ${elemento}` } : undefined;
  return {
    elemento: dados.elemento,
    sobretitulo: `${tipo} · ${elemento}`,
    grandeza: 'grande',
    titulo: dados.nome.trim() || tipo,
    numero: bonus > 0 ? { rotulo: `XP de ${elemento}`, de: Math.round(dados.xpAntes), para: Math.round(dados.xpDepois) } : undefined,
    destrave,
  };
}
