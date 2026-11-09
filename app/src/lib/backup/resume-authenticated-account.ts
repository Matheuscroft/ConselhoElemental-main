import { ACCOUNT_TAB_ACCESS_KEY } from './account-resume-entry';
import { inspectTabAccess } from './account-tab-access';
import { createAccountReviewSession } from './account-session';
import { prepareAuthenticatedAccountAccess, rememberAuthenticatedAccountAccess } from './account-live-access';
import type { RestoreStorage } from './restore-journal';

interface Options {
  config: { url?: string; key?: string };
  origin: string;
  accessStorage: RestoreStorage;
  isCurrent: () => boolean;
}

async function restore(options: Options) {
  const {config,origin,accessStorage}=options;
  const raw=accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY);
  if(!raw||!config.url)throw new Error('Entre novamente para retomar o acesso.');
  const saved=inspectTabAccess(raw,origin,config.url);
  const current=()=>options.isCurrent()&&accessStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)===raw;
  const check=()=>{if(!current())throw new Error('O acesso mudou durante a conferência.');};
  const owned=createAccountReviewSession(config);
  try{
    const restored=await owned.client.auth.setSession({access_token:saved.accessToken,refresh_token:saved.refreshToken});check();
    if(restored.error||restored.data.session?.user.id!==saved.userId)throw new Error('O acesso expirou. Entre novamente.');
    const identity=await owned.client.auth.getUser();check();
    if(identity.error||identity.data.user?.id!==saved.userId)throw new Error('Não foi possível validar a conta salva.');
    return {owned,saved,raw,email:identity.data.user.email};
  }catch(error){owned.dispose();throw error;}
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
