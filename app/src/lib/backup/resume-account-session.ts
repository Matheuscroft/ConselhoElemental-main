import { ACCOUNT_TRANSFER_WRITES_RELEASED } from './account-release';
import { ACCOUNT_TAB_ACCESS_KEY } from './account-resume-entry';
import { inspectTabAccess, persistRestoredAccess, withAccountAuthLock } from './account-tab-access';
import { AccountAuthError, accountAuthMessage, accountSessionEnded } from './account-auth-messages';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding, reviewAccountBinding } from './account-binding';
import { ACCOUNT_INTENT_KEY } from './account-intent';
import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { RESTORE_JOURNAL_KEY, type RestoreStorage } from './restore-journal';
import { LOCAL_PROGRESS_MODE_KEY } from './progress-mode';
import { STORE_KEYS } from './progress-backup';
import { createAccountReviewSession } from './account-session';
import { createAccountTransport } from './account-transport';
import { prepareLiveAccountAccess } from './account-live-access';

/** Exclusive pre-bootstrap only. Never hydrates, merges, retries an intent or reads legacy Auth. */
export async function resumeAccountSession(options: {
  config: { url?: string; key?: string }; origin: string; storage: RestoreStorage; accessStorage: RestoreStorage;
  isExclusive: () => boolean; locks?: Pick<LockManager, 'request'>;
}) {
  if (!ACCOUNT_TRANSFER_WRITES_RELEASED || !options.isExclusive()) throw new Error('Confira o acesso antes de retomar a sincronização.');
  const {storage,accessStorage,origin}=options;
  let raw=accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY);
  if (!raw || !options.config.url) throw new Error('Entre novamente para retomar o acesso.');
  const project=options.config.url;
  let saved=inspectTabAccess(raw,origin,project);
  const keys=[STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_BINDING_KEY,LOCAL_PROGRESS_MODE_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,RESTORE_JOURNAL_KEY];
  const before=keys.map(k=>storage.getItem(k)),bindingRaw=before[2];
  if (!bindingRaw || before.slice(4).some(v=>v!==null)) throw new Error('Há uma conferência pendente. Nenhum envio será repetido automaticamente.');
  let active=true;
  const current=()=>active&&options.isExclusive()&&accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)===raw&&keys.every((k,i)=>storage.getItem(k)===before[i]);
  const check=()=>{if(!current())throw new Error('O acesso ou o progresso mudou durante a conferência.');};
  const binding=await inspectAccountBinding(bindingRaw,origin);check();
  if (binding.userId!==saved.userId) throw new Error('O acesso salvo não corresponde à conta vinculada.');
  // Token rotation is serialized across tabs; the freshest record is re-read inside the lock and the
  // rotated pair is written back before it is released. Dead records are dropped; offline keeps them.
  return withAccountAuthLock(async()=>{
    const latest=accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY);
    if(!latest)throw new Error('Entre novamente para retomar o acesso.');
    if(latest!==raw){raw=latest;saved=inspectTabAccess(latest,origin,project);if(binding.userId!==saved.userId)throw new Error('O acesso salvo não corresponde à conta vinculada.');}
    const dead=()=>{if(accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)===raw)accessStorage.removeItem(ACCOUNT_TAB_ACCESS_KEY);};
    const owned=createAccountReviewSession(options.config);
    try {
      const restored=await owned.client.auth.setSession({access_token:saved.accessToken,refresh_token:saved.refreshToken});check();
      if(restored.error){if(accountSessionEnded(restored.error))dead();throw new AccountAuthError(accountAuthMessage(restored.error,'resume','O acesso expirou. Entre novamente.'));}
      if(restored.data.session?.user.id!==saved.userId){dead();throw new Error('O acesso expirou. Entre novamente.');}
      const identity=await owned.client.auth.getUser();check();
      if(identity.error){if(accountSessionEnded(identity.error))dead();throw new AccountAuthError(accountAuthMessage(identity.error,'resume','Não foi possível validar a conta salva.'));}
      if(identity.data.user?.id!==saved.userId)throw new Error('Não foi possível validar a conta salva.');
      raw=persistRestoredAccess({storage:accessStorage,origin,project,userId:saved.userId,session:restored.data.session,previous:{raw,consentedAt:saved.consentedAt}});check();
      const transport=createAccountTransport(owned.client,{expectedUserId:saved.userId,currentUserId:()=>active?saved.userId:null,isCurrent:current});
      await reviewAccountBinding(bindingRaw,origin,transport,storage);check();
      const handoff=await prepareLiveAccountAccess(owned,{userId:saved.userId,bindingRaw,origin,project,storage:accessStorage,remember:true,email:identity.data.user.email,previous:{raw,consentedAt:saved.consentedAt}});check();
      active=false;return handoff;
    }catch(error){active=false;owned.dispose();throw error;}
  },options.locks);
}
