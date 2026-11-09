import type { AuthenticatedAccountSession } from './account-live-access';
import type { AccountSyncView, LiveAccountSync } from './account-live-sync';

/** Account-aware local mode. It exposes Auth status to the app and never owns a progress transport. */
export function createAuthenticatedLocalSync(session: AuthenticatedAccountSession): LiveAccountSync {
  let active=true;
  let view: Readonly<AccountSyncView>=Object.freeze({
    status:'blocked',email:session.email,
    message:'Conta conectada. A sincronização aguarda sua escolha; as alterações continuam somente neste aparelho.',
  });
  const listeners=new Set<()=>void>();
  const set=(next: Readonly<AccountSyncView>)=>{view=next;for(const listener of listeners)listener();};
  function stop(){
    if(!active)return;
    active=false;session.dispose();
    set(Object.freeze({...view,status:'stopped',message:'Acesso encerrado. O progresso deste aparelho continua preservado.'}));
  }
  function forgetAccess(){
    let forgotten=true;
    try{session.forgetResume?.();}catch{forgotten=false;}
    stop();return forgotten;
  }
  return {
    getSnapshot:()=>view,
    subscribe:listener=>{listeners.add(listener);return()=>{listeners.delete(listener);};},
    flush:()=>Promise.resolve(),
    invalidate:forgetAccess,
    forgetAccess,
    stop,
  } as LiveAccountSync;
}
