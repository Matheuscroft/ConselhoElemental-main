import { createRoot } from 'react-dom/client';
import { AccountRecoveryWorkspace } from './components/backup/AccountRecoveryWorkspace';
import type { RecoveryEntry } from './lib/backup/account-recovery-entry';
import './components/backup/restore-workspace.css';
/** No App, store hydration or legacy Auth in this document. */
export function mountAccountRecovery(root: HTMLElement, entry: RecoveryEntry) {
  document.title = 'Recuperar acesso — Conselho Elemental';
  createRoot(root).render(<AccountRecoveryWorkspace entry={entry} />);
}
