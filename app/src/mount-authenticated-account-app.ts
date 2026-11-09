import type { AuthenticatedAccountSession } from './lib/backup/account-live-access';
import { createAuthenticatedLocalSync } from './lib/backup/authenticated-local-sync';
import { hasExclusiveProgressSession } from './lib/backup/progress-startup';
import { isolateRestoredLocalDocument } from './lib/backup/progress-mode';

/** Opens the private app after Auth while progress remains local and no remote write is enabled. */
export async function mountAuthenticatedAccountApp(root: HTMLElement, session: AuthenticatedAccountSession) {
  if(!hasExclusiveProgressSession())throw new Error('Reabra o app para validar seu acesso.');
  const sync=createAuthenticatedLocalSync(session);
  const unwatch=session.watchIdentity?.(()=>sync.invalidate());
  let stopRefresh:(()=>void)|undefined;
  try{
    stopRefresh=session.startRefresh?.(()=>sync.invalidate());
    session.activateResume?.();
    isolateRestoredLocalDocument();
    const {mountApp}=await import('./bootstrap-app');
    if(!hasExclusiveProgressSession()||sync.getSnapshot().status==='stopped')throw new Error('O acesso mudou durante a abertura do app.');
    mountApp(root,sync);
  }catch(error){stopRefresh?.();unwatch?.();sync.forgetAccess();throw error;}
  return()=>{stopRefresh?.();unwatch?.();sync.stop();};
}
