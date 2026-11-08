import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { ACCOUNT_TRANSFER_WRITES_RELEASED } from './account-release';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding, reviewAccountBinding, sealAccountBinding } from './account-binding';
import { ACCOUNT_INTENT_KEY, accountBaselineDigest, sealAccountIntent } from './account-intent';
import { createAccountTransport, type AccountRpcClient } from './account-transport';
import { createProgressBackup, STORE_KEYS } from './progress-backup';
import { validateStoredProgress } from './stored-progress';
import { RESTORE_JOURNAL_KEY, type RestoreStorage } from './restore-journal';
import { LOCAL_PROGRESS_MODE_KEY, localProgressMode, validateLocalProgressMode } from './progress-mode';

export interface LiveAccountSession {
  client: AccountRpcClient;
  dispose: () => void;
  userId: string;
  email?: string;
  bindingRaw: string;
  allProfilesConfirmed: true;
  startRefresh?: (onFailure: () => void) => () => void;
  watchIdentity?: (invalidate: () => void) => () => void;
  activateResume?: () => void;
  forgetResume?: () => void;
}
export type AccountSyncStatus = 'idle' | 'offline' | 'checking' | 'saving' | 'saved' | 'pending' | 'blocked' | 'stopped';
export interface AccountSyncView { status: AccountSyncStatus; message: string; lastSavedAt?: string; email?: string }
interface Options {
  origin: string;
  storage: RestoreStorage;
  session: LiveAccountSession;
  /** Must remain true only during this document's exclusive progress lease. */
  isExclusive: () => boolean;
  isOnline?: () => boolean;
}

/** One in-memory session coordinator. It never reads legacy auth or hydrates a store.
 * Pending writes are never retried automatically, including after a lost response. */
export function createLiveAccountSync(options: Options) {
  if (!ACCOUNT_TRANSFER_WRITES_RELEASED) throw new Error('A sincronização ainda não foi liberada.');
  const { origin, storage, isExclusive } = options, session = { ...options.session };
  if (session.allProfilesConfirmed !== true || !isExclusive()) throw new Error('Confirme a sessão exclusiva e o envio de todos os perfis.');
  let active = true, generation = 0, bindingRaw = session.bindingRaw;
  let job: Promise<void> | null = null;
  let view: Readonly<AccountSyncView> = Object.freeze({ status:'idle', message:'Suas alterações serão salvas nesta conta durante o uso.', email:session.email });
  const listeners = new Set<() => void>();
  const set = (status: AccountSyncStatus, message: string) => { view = Object.freeze({...view,status,message}); for (const notify of listeners) notify(); };
  const current = (token: number) => active && token === generation && isExclusive()
    && storage.getItem(ACCOUNT_RESOLUTION_KEY) === null && storage.getItem(ACCOUNT_BINDING_KEY) === bindingRaw && storage.getItem(RESTORE_JOURNAL_KEY) === null;
  const check = (token: number) => { if (!current(token)) throw new Error('A sessão ou o progresso mudou. Confira a conta antes de continuar.'); };
  const write = (key: string, value: string | null) => {
    if (value === null) storage.removeItem(key); else storage.setItem(key,value);
    if (storage.getItem(key) !== value) throw new Error('O navegador não confirmou a gravação. Preserve a tentativa e a cópia local.');
  };
  function stop() {
    if (!active) return;
    active = false; generation++; session.dispose();
    set('stopped','Sincronização pausada. Edições e tentativas pendentes permanecem neste navegador.');
  }
  function forgetAccess() {
    let forgotten = true;
    try { session.forgetResume?.(); } catch { forgotten = false; }
    stop();
    return forgotten;
  }
  async function execute() {
    const token = ++generation;
    try {
      check(token);
      if (options.isOnline?.() === false) { set('offline','Sem internet. Seu progresso permanece neste aparelho e será conferido quando a conexão voltar.'); return; }
      if (storage.getItem(ACCOUNT_INTENT_KEY) !== null) { set('pending','Uma tentativa aguarda conferência. Nenhum reenvio automático será feito.'); return; }
      const binding = await inspectAccountBinding(bindingRaw,origin); check(token);
      if (binding.userId !== session.userId) throw new Error('A conta não corresponde ao vínculo desta sessão.');
      const transport = createAccountTransport(session.client,{expectedUserId:session.userId,currentUserId:()=>active?session.userId:null,isCurrent:()=>current(token)});
      set('checking','Conferindo a versão online antes de salvar…');
      await reviewAccountBinding(bindingRaw,origin,transport,storage); check(token);
      const pair = {core:storage.getItem(STORE_KEYS.core),fitness:storage.getItem(STORE_KEYS.fitness)};
      const digest = await accountBaselineDigest(storage); check(token);
      const unchanged = () => storage.getItem(STORE_KEYS.core) === pair.core && storage.getItem(STORE_KEYS.fitness) === pair.fitness;
      if (!unchanged()) { set('idle','Há novas edições locais. Elas serão conferidas no próximo envio.'); return; }
      if (digest === binding.baselineDigest) { view = Object.freeze({...view,lastSavedAt:binding.createdAt}); set('saved','A versão conferida está salva na conta.'); return; }
      const snapshot = validateStoredProgress(pair,origin);
      if (!snapshot) throw new Error('Não há progresso integral válido para enviar.');
      const archive = await createProgressBackup(snapshot);
      const command = await transport.prepare({archive,expectedRevision:binding.revision,allProfilesConfirmed:true});
      const localMode = storage.getItem(LOCAL_PROGRESS_MODE_KEY); validateLocalProgressMode(localMode,origin);
      const raw = await sealAccountIntent({format:'conselho-elemental-account-intent',version:1,phase:'pending',origin,userId:session.userId,
        operationId:command.operationId,expectedRevision:binding.revision,archive:command.archive,archiveSha256:command.archiveSha256,baselineDigest:digest,localMode});
      check(token);
      if (!unchanged()) { set('idle','Há novas edições locais. Elas serão conferidas no próximo envio.'); return; }
      if (storage.getItem(ACCOUNT_INTENT_KEY) !== null || storage.getItem(LOCAL_PROGRESS_MODE_KEY) !== localMode) throw new Error('A tentativa ou o modo de uso mudou.');
      write(ACCOUNT_INTENT_KEY,raw); // durable before any remote write
      set('saving','Salvando o progresso integral…');
      await transport.commit(command);
      const confirmed = await transport.confirm(command); check(token);
      if (storage.getItem(ACCOUNT_INTENT_KEY) !== raw) throw new Error('A tentativa mudou durante o envio.');
      const next = await sealAccountBinding({format:'conselho-elemental-account-binding',version:1,origin,...confirmed.receipt,baselineDigest:digest});
      check(token);
      if (storage.getItem(ACCOUNT_INTENT_KEY) !== raw || storage.getItem(LOCAL_PROGRESS_MODE_KEY) !== localMode) throw new Error('A tentativa ou o modo de uso mudou.');
      write(LOCAL_PROGRESS_MODE_KEY,localMode ?? localProgressMode(origin));
      write(ACCOUNT_BINDING_KEY,next);
      // No more awaited work or transport calls after the binding handoff.
      bindingRaw = next;
      write(ACCOUNT_INTENT_KEY,null);
      view = Object.freeze({...view,lastSavedAt:confirmed.receipt.createdAt});
      set(unchanged()?'saved':'idle',unchanged()?'Progresso integral salvo e recibo conferido.':'A versão enviada foi salva. Edições mais recentes continuam locais até o próximo envio.');
    } catch (error) {
      if (!active) return;
      const pending = (() => { try { return storage.getItem(ACCOUNT_INTENT_KEY) !== null; } catch { return true; } })();
      set(pending?'pending':'blocked',pending?'Envio interrompido ou não confirmado. Confira o recibo; sua tentativa e as edições locais foram preservadas.':error instanceof Error?error.message:'A sincronização foi pausada para proteger as versões.');
    }
  }
  return {
    getSnapshot: () => view,
    subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    flush(): Promise<void> {
      if (!active || view.status === 'pending' || view.status === 'blocked') return Promise.resolve();
      if (job) return job;
      job = execute().finally(() => { job = null; }); return job;
    },
    invalidate() { if (!active) return; forgetAccess(); },
    forgetAccess,
    stop,
  };
}
export type LiveAccountSync = ReturnType<typeof createLiveAccountSync>;
