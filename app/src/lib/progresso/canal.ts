import type { AscensaoNova } from './eventos.ts';

/**
 * A tiny channel between the app-wide listener and the screen that plays the
 * ascension ceremony (Ciclos). An ascension that happens while another screen
 * is open waits here, so the person sees it the next time Ciclos opens.
 */
type Ouvinte = (ascensao: AscensaoNova) => void;

const ouvintes = new Set<Ouvinte>();
const pendentes: AscensaoNova[] = [];

/** Returns true when a screen took it right away; otherwise it is kept for later. */
export function emitirAscensao(ascensao: AscensaoNova): boolean {
  if (ouvintes.size === 0) {
    pendentes.push(ascensao);
    return false;
  }
  ouvintes.forEach((ouvir) => ouvir(ascensao));
  return true;
}

/** Subscribes the ceremony screen; pending ascensions are delivered at once, in order. */
export function assinarAscensoes(ouvir: Ouvinte): () => void {
  ouvintes.add(ouvir);
  while (pendentes.length > 0) {
    const proxima = pendentes.shift();
    if (proxima) ouvir(proxima);
  }
  return () => { ouvintes.delete(ouvir); };
}

export function ascensoesPendentes(): number {
  return pendentes.length;
}
