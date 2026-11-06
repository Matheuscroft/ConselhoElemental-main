import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RestoreWorkspace } from './components/backup/RestoreWorkspace';
import './components/backup/restore-workspace.css';

/** Isolated mount: App, domain stores, and auth are intentionally absent from this graph. */
export function mountRestoreWorkspace(root: HTMLElement) {
  createRoot(root).render(<StrictMode><RestoreWorkspace /></StrictMode>);
}
