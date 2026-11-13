import { ACCOUNT_TAB_ACCESS_KEY } from './account-resume-entry';
import { inspectTabAccess, persistRestoredAccess, withAccountAuthLock } from './account-tab-access';
import { AccountAuthError, accountAuthMessage, accountSessionEnded } from './account-auth-messages';
import { createAccountReviewSession } from './account-session';
import { prepareAuthenticatedAccountAccess, rememberAuthenticatedAccountAccess } from './account-live-access';
import type { RestoreStorage } from './restore-journal';

interface Options {
  config: { url?: string; key?: string };
  origin: string;
  accessStorage: RestoreStorage;
  isCurrent: () => boolean;
  locks?: Pick<LockManager, 'request'>;
}
const EXPIRED = 'O acesso expirou. Entre novamente.';

/** Restores under the cross-tab Auth lock. Inside it the freshest record is read (another tab may
 * have rotated the pair), the rotated pair is written back before the lock is released, and a
 * definitively dead record (rotated, revoked, expired or corrupt) is dropped so it cannot loop.
 * Offline or server errors keep the record: the person is only asked to try again. */
async function restore(options: Options) {
  const {config,origin,accessStorage}=options;
  if(!config.url)throw new Error('Entre novamente para retomar o acesso.');
  const project=config.url;
  return withAccountAuthLock(async()=>{
    let raw=accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY);
    if(!raw)throw new Error('Entre novamente para retomar o acesso.');
    const dead=(failed:string)=>{if(accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)===failed){accessStorage.removeItem(ACCOUNT_TAB_ACCESS_KEY);}};
    let saved:ReturnType<typeof inspectTabAccess>;
    try{saved=inspectTabAccess(raw,origin,project);}catch(error){dead(raw);throw error;}
    const current=()=>options.isCurrent()&&accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)===raw;
    const check=()=>{if(!current())throw new Error('O acesso mudou durante a conferência.');};
    const owned=createAccountReviewSession(config);
    try{
      const restored=await owned.client.auth.setSession({access_token:saved.accessToken,refresh_token:saved.refreshToken});check();
      if(restored.error){if(accountSessionEnded(restored.error))dead(raw);throw new AccountAuthError(accountAuthMessage(restored.error,'resume',EXPIRED));}
      if(restored.data.session?.user.id!==saved.userId){dead(raw);throw new Error(EXPIRED);}
      const identity=await owned.client.auth.getUser();check();
      if(identity.error){if(accountSessionEnded(identity.error))dead(raw);throw new AccountAuthError(accountAuthMessage(identity.error,'resume','Não foi possível validar a conta salva.'));}
      if(identity.data.user?.id!==saved.userId)throw new Error('Não foi possível validar a conta salva.');
      raw=persistRestoredAccess({storage:accessStorage,origin,project,userId:saved.userId,session:restored.data.session,previous:{raw,consentedAt:saved.consentedAt}});check();
      return {owned,saved,raw,email:identity.data.user.email};
    }catch(error){owned.dispose();throw error;}
  },options.locks);
}

/** Reopens Auth for the isolated account workspace. No progress is read or written. */
export async function resumeAuthenticatedAccountReview(options: Options) {
  const restored=await restore(options);
  try{
    await rememberAuthenticatedAccountAccess(restored.owned,{userId:restored.saved.userId,origin:options.origin,project:options.config.url!,storage:options.accessStorage,previous:{raw:restored.raw,consentedAt:restored.saved.consentedAt}});
    return {owned:restored.owned,userId:restored.saved.userId,email:restored.email};
  }catch(error){restored.owned.dispose();throw error;}
}

/** Reopens an authenticated local app without enabling any remote progress operation. */
export async function resumeAuthenticatedAccountSession(options: Options) {
  const restored=await restore(options);
  try{
    return await prepareAuthenticatedAccountAccess(restored.owned,{userId:restored.saved.userId,origin:options.origin,project:options.config.url!,storage:options.accessStorage,email:restored.email,previous:{raw:restored.raw,consentedAt:restored.saved.consentedAt}});
  }catch(error){restored.owned.dispose();throw error;}
}
