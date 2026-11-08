import { createLiveAccountSync, type LiveAccountSession } from './lib/backup/account-live-sync';
import { hasExclusiveProgressSession } from './lib/backup/progress-startup';
import { isRestoredLocalDocument, markLiveAccountDocument } from './lib/backup/progress-mode';

/** Only imported from the explicit workspace handoff under an exclusive lease. */
export async function mountAccountApp(root: HTMLElement, session: LiveAccountSession) {
  if (!hasExclusiveProgressSession() || !isRestoredLocalDocument()) throw new Error('Reabra a conferência da conta antes de sincronizar.');
  const sync = createLiveAccountSync({origin:window.location.origin,storage:window.localStorage,session,isExclusive:hasExclusiveProgressSession,isOnline:()=>navigator.onLine});
  let detach: (()=>void) | undefined;
  let stopRefresh: (()=>void) | undefined;
  // Auth callback only invalidates; it never awaits another Auth method.
  const unstatus = sync.subscribe(()=>{if(sync.getSnapshot().status==='stopped')queueMicrotask(()=>{unwatch?.();stopRefresh?.();});});
  const unwatch = session.watchIdentity?.(() => { sync.invalidate(); });
  try {
    stopRefresh = session.startRefresh?.(() => sync.invalidate());
    await sync.flush();
    if (!['saved','idle'].includes(sync.getSnapshot().status)) { sync.stop(); throw new Error('Confira as versões da conta antes de entrar.'); }
    session.activateResume?.();
    const { mountApp } = await import('./bootstrap-app');
    if (!hasExclusiveProgressSession() || !['saved','idle'].includes(sync.getSnapshot().status)) throw new Error('A sessão mudou durante a abertura do app. Confira a conta novamente.');
    markLiveAccountDocument();
    mountApp(root,sync);
    const { attachAccountSync } = await import('./lib/backup/attach-account-sync');
    detach = attachAccountSync(sync);
  } catch (error) { detach?.(); stopRefresh?.(); unwatch?.(); unstatus(); sync.forgetAccess(); throw error; }
  return () => { detach?.(); stopRefresh?.(); unwatch?.(); unstatus(); sync.stop(); };
}
