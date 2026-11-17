import { isolateRestoredLocalDocument } from './lib/backup/progress-mode';

/** Opens the app on this device's own progress: no account, no sync, nothing sent, replaced or deleted.
 *  The document is isolated first, so the legacy auth/sync client is never built. */
export async function mountLocalOnly(root: HTMLElement) {
  isolateRestoredLocalDocument();
  const { mountApp } = await import('./bootstrap-app');
  mountApp(root);
}
