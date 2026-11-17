/**
 * Registro de todos os padrões de movimento desenhados. Hoje só os de força
 * (musculação e calistenia); corrida, ciclismo, natação e lutas entram por
 * outro arquivo de dados e se somam aqui.
 */

import type { PadraoDef } from './figura-tipos';
import type { PadraoExtra } from './figura-desenho';
import { EXTRAS_FORCA, PADROES_FORCA } from './figura-padroes-forca';
import { EXTRAS_CARDIO_LUTA, PADROES_CARDIO_LUTA } from './figura-padroes-cardio-luta';

const montar = (...grupos: readonly (readonly PadraoDef[])[]): Record<string, PadraoDef> => {
  const registro: Record<string, PadraoDef> = {};
  for (const grupo of grupos) for (const padrao of grupo) registro[padrao.id] = padrao;
  return registro;
};

export const PADROES: Record<string, PadraoDef> = montar(PADROES_FORCA, PADROES_CARDIO_LUTA);

/** Detalhes de cena (polia, placa dos pés, apoio das mãos) por id de padrão. */
export const EXTRAS: Record<string, PadraoExtra> = { ...EXTRAS_FORCA, ...EXTRAS_CARDIO_LUTA };

export const padraoExiste = (id: string): boolean => Object.prototype.hasOwnProperty.call(PADROES, id);
