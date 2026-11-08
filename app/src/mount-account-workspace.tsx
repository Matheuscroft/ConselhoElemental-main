import type { LiveAccountSession } from './lib/backup/account-live-sync';
import type { AccountReturnNotice } from './lib/backup/account-return';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AccountWorkspace } from './components/backup/AccountWorkspace';
import './components/backup/restore-workspace.css';
/** No App, domain stores or global auth client in this entry. */
export function mountAccountWorkspace(root: HTMLElement, onStart?: (session: LiveAccountSession) => void, notice: AccountReturnNotice = 'none') {
  document.title = 'Minha conta — Conselho Elemental';
  const mounted = createRoot(root);
  mounted.render(<StrictMode><AccountWorkspace notice={notice} onStart={onStart ? session => { mounted.unmount(); onStart(session); } : undefined}/></StrictMode>);
}
