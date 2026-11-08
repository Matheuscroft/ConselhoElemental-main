import { ACCOUNT_TRANSFER_WRITES_RELEASED } from './account-release';
import { ACCOUNT_TAB_ACCESS_KEY } from './account-resume-entry';
import { inspectTabAccess } from './account-tab-access';
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
  isExclusive: () => boolean;
}) {
  if (!ACCOUNT_TRANSFER_WRITES_RELEASED || !options.isExclusive()) throw new Error('Confira o acesso antes de retomar a sincronização.');
  const {storage,accessStorage,origin}=options;
  const raw=accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY);
  if (!raw || !options.config.url) throw new Error('Entre novamente para retomar o acesso.');
  const saved=inspectTabAccess(raw,origin,options.config.url);
  const keys=[STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_BINDING_KEY,LOCAL_PROGRESS_MODE_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,RESTORE_JOURNAL_KEY];
  const before=keys.map(k=>storage.getItem(k)),bindingRaw=before[2];
  if (!bindingRaw || before.slice(4).some(v=>v!==null)) throw new Error('Há uma conferência pendente. Nenhum envio será repetido automaticamente.');
  let active=true;
  const current=()=>active&&options.isExclusive()&&accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)===raw&&keys.every((k,i)=>storage.getItem(k)===before[i]);
  const check=()=>{if(!current())throw new Error('O acesso ou o progresso mudou durante a conferência.');};
  const binding=await inspectAccountBinding(bindingRaw,origin);check();
  if (binding.userId!==saved.userId) throw new Error('O acesso salvo não corresponde à conta vinculada.');
  const owned=createAccountReviewSession(options.config);
  try {
    const restored=await owned.client.auth.setSession({access_token:saved.accessToken,refresh_token:saved.refreshToken});check();
    if(restored.error || restored.data.session?.user.id!==saved.userId)throw new Error('O acesso expirou. Entre novamente.');
    const identity=await owned.client.auth.getUser();check();
    if(identity.error || identity.data.user?.id!==saved.userId)throw new Error('Não foi possível validar a conta salva.');
    const transport=createAccountTransport(owned.client,{expectedUserId:saved.userId,currentUserId:()=>active?saved.userId:null,isCurrent:current});
    await reviewAccountBinding(bindingRaw,origin,transport,storage);check();
    const handoff=await prepareLiveAccountAccess(owned,{userId:saved.userId,bindingRaw,origin,project:options.config.url,storage:accessStorage,remember:true,email:identity.data.user.email,previous:{raw,consentedAt:saved.consentedAt}});check();
    active=false;return handoff;
  }catch(error){active=false;owned.dispose();throw error;}
}
