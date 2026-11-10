import { attachSessionRefresh } from './account-session-refresh';
import { createClient } from '@supabase/supabase-js';
/** Construct only after an explicit sign-in action in the isolated workspace.
 * Tokens stay in SDK memory; no existing browser session is read or persisted. */
/** OAuth only: PKCE needs its code verifier to survive the provider redirect.
 * Only keys ending in `-code-verifier` reach `verifierStorage`; the session
 * itself still lives in memory. */
export interface OAuthPkceOptions { storageKey: string; verifierStorage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> }
export function createAccountReviewSession(config: { url?: string; key?: string }, construct: typeof createClient = createClient, pkce?: OAuthPkceOptions) {
  if (!config.url || !config.key) throw new Error('A conexão com a conta ainda não está disponível nesta versão. Seu progresso continua local.');
  const url = new URL(config.url);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw new Error('A conexão de conta precisa de revisão.');
  const memory=new Map<string,string>();
  let disposed=false;
  let liveCleanup: (()=>void)|undefined;
  // The SDK ignores custom storage when persistSession is false. True selects
  // our Map adapter, not browser persistence. A unique key isolates Auth events.
  const verifier=(k:string)=>!!pkce&&k.endsWith('-code-verifier');
  const client=construct(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,...(pkce?{flowType:'pkce' as const}:{}),storageKey:pkce?pkce.storageKey:'ce-account-review-memory-'+crypto.randomUUID(),storage:{getItem:k=>disposed?null:verifier(k)?pkce!.verifierStorage.getItem(k):memory.get(k)??null,setItem:(k,v)=>{if(disposed)return;if(verifier(k))pkce!.verifierStorage.setItem(k,v);else memory.set(k,v);},removeItem:k=>{if(verifier(k))pkce!.verifierStorage.removeItem(k);memory.delete(k);}}}});
  return {client,
    startLiveRefresh(surface: Pick<Document,'visibilityState'|'addEventListener'|'removeEventListener'>,onFailure:()=>void) {
      if(disposed)throw new Error('A sessão foi encerrada. Entre novamente.');
      liveCleanup ??= attachSessionRefresh(client.auth,surface,onFailure);
      return liveCleanup;
    },
    dispose(){
      if(disposed)return;
      disposed=true;memory.clear();
      if(liveCleanup)liveCleanup();
      else try{void Promise.resolve(client.auth.stopAutoRefresh()).catch(()=>{});}catch{/* Drop only this transient client. */}
    }
  };
}
