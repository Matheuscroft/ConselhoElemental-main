import { attachSessionRefresh } from './account-session-refresh';
import { createClient } from '@supabase/supabase-js';
/** Construct only after an explicit sign-in action in the isolated workspace.
 * Tokens stay in SDK memory; no existing browser session is read or persisted. */
export function createAccountReviewSession(config: { url?: string; key?: string }, construct: typeof createClient = createClient) {
  if (!config.url || !config.key) throw new Error('A conexão com a conta ainda não está disponível nesta versão. Seu progresso continua local.');
  const url = new URL(config.url);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))throw new Error('A conexão de conta precisa de revisão.');
  const memory=new Map<string,string>();
  let disposed=false;
  let liveCleanup: (()=>void)|undefined;
  // The SDK ignores custom storage when persistSession is false. True selects
  // our Map adapter, not browser persistence. A unique key isolates Auth events.
  const client=construct(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,storageKey:'ce-account-review-memory-'+crypto.randomUUID(),storage:{getItem:k=>disposed?null:memory.get(k)??null,setItem:(k,v)=>{if(!disposed)memory.set(k,v);},removeItem:k=>{memory.delete(k);}}}});
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
