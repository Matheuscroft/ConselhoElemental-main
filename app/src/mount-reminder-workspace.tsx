import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReminderWorkspace } from './components/reminders/ReminderWorkspace';
import './components/backup/restore-workspace.css';

/** Isolated document: no App/stores/Auth are imported, and no writes run on mount. */
export function mountReminderWorkspace(root: HTMLElement) {
  createRoot(root).render(<StrictMode><ReminderWorkspace /></StrictMode>);
}
