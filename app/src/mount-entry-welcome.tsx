import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrimeiroAcesso } from './components/entry/PrimeiroAcesso';

/** First-run opening: the awakening, two questions, then the entry.
 *  No auth client and no store hydration; only per-device preferences. */
export function mountEntryWelcome(root: HTMLElement) {
  document.title = 'Boas-vindas — Conselho Elemental';
  createRoot(root).render(<StrictMode><PrimeiroAcesso /></StrictMode>);
}
