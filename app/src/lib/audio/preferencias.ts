/**
 * Device preferences for sound, kept in localStorage under their own key.
 * This is a device setting, not progress data: it is not part of the app
 * store, the backup or the sync.
 */

export interface PreferenciasSom {
  ligado: boolean;
  /** 0..1 */
  volume: number;
  haptico: boolean;
}

export const CHAVE_SOM = 'conselho-elemental:som';
export const PADROES_SOM: Readonly<PreferenciasSom> = Object.freeze({ ligado: true, volume: 0.6, haptico: true });

type Ouvinte = (preferencias: PreferenciasSom) => void;
const ouvintes = new Set<Ouvinte>();

const limitarVolume = (v: number) => Math.min(1, Math.max(0, v));

function armazenamento(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Reads each field on its own: a bad field falls back to its default. */
export function lerPreferencias(): PreferenciasSom {
  const resultado: PreferenciasSom = { ...PADROES_SOM };
  try {
    const bruto = armazenamento()?.getItem(CHAVE_SOM);
    if (!bruto) return resultado;
    const dado: unknown = JSON.parse(bruto);
    if (!dado || typeof dado !== 'object' || Array.isArray(dado)) return resultado;
    const { ligado, volume, haptico } = dado as Record<string, unknown>;
    if (typeof ligado === 'boolean') resultado.ligado = ligado;
    if (typeof haptico === 'boolean') resultado.haptico = haptico;
    if (typeof volume === 'number' && Number.isFinite(volume)) resultado.volume = limitarVolume(volume);
  } catch {
    /* corrupt or unavailable storage: defaults */
  }
  return resultado;
}

export function salvarPreferencias(parcial: Partial<PreferenciasSom>): PreferenciasSom {
  const atual = lerPreferencias();
  const proxima: PreferenciasSom = {
    ligado: typeof parcial.ligado === 'boolean' ? parcial.ligado : atual.ligado,
    haptico: typeof parcial.haptico === 'boolean' ? parcial.haptico : atual.haptico,
    volume:
      typeof parcial.volume === 'number' && Number.isFinite(parcial.volume)
        ? limitarVolume(parcial.volume)
        : atual.volume,
  };
  try {
    armazenamento()?.setItem(CHAVE_SOM, JSON.stringify(proxima));
  } catch {
    /* full or blocked storage: the change still reaches listeners this session */
  }
  for (const ouvinte of [...ouvintes]) {
    try {
      ouvinte(proxima);
    } catch {
      /* a listener must not break the others */
    }
  }
  return proxima;
}

export function assinarPreferencias(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}
