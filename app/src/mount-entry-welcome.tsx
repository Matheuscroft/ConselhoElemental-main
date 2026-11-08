import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EntryWelcome } from './components/entry/EntryWelcome';

/** Read-only first-run introduction. No auth client, store hydration or new storage. */
export function mountEntryWelcome(root: HTMLElement) {
  document.title = 'Boas-vindas — Conselho Elemental';
  createRoot(root).render(<StrictMode><EntryWelcome /></StrictMode>);
}
