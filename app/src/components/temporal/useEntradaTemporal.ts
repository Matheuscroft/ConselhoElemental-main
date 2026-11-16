import { useState } from 'react';

/**
 * The Temporal screens are staged once per opening of the app; coming back
 * (or moving between Semana, Mês, Ano and Calendário) only fades. The flag is
 * this screen's own: seeing Ciclos or Pilares arrive never spends it.
 */
let temporalJaVisto = false;

export type EntradaTemporal = 'plena' | 'breve';

/**
 * `entrada` is fixed for the life of the scene. The flag is spent in the
 * initializer, which is the moment the arrival is decided: the next scene to
 * mount, in this opening of the app, is only a fade.
 */
export function useEntradaTemporal(): EntradaTemporal {
  const [entrada] = useState<EntradaTemporal>(() => {
    const decidida: EntradaTemporal = temporalJaVisto ? 'breve' : 'plena';
    temporalJaVisto = true;
    return decidida;
  });
  return entrada;
}
