import type { createAccountReviewSession } from './account-session';
import type { LiveAccountSession } from './account-live-sync';
import { createTabAccessControl, watchAccessDeadline } from './account-tab-access';
import type { RestoreStorage } from './restore-journal';

export interface AuthenticatedAccountSession {
  client: ReturnType<typeof createAccountReviewSession>['client'];
  dispose: () => void;
  userId: string;
  email?: string;
  startRefresh?: (onFailure: () => void) => () => void;
  watchIdentity?: (invalidate: () => void) => () => void;
  activateResume?: () => void;
  forgetResume?: () => void;
}

/** Persists the authenticated tab immediately, without authorizing any progress read or write. */
export async function rememberAuthenticatedAccountAccess(owned: ReturnType<typeof createAccountReviewSession>, options: {
  userId: string; origin: string; project: string; storage: RestoreStorage;
  previous?: { raw: string; consentedAt: number };
}): Promise<void> {
  const result = await owned.client.auth.getSession();
  if (result.error || !result.data.session || result.data.session.user.id !== options.userId) throw new Error('Valide o acesso novamente antes de continuar.');
  const control = createTabAccessControl({...options,remember:true,tokens:result.data.session});
  try { control.activate(); } finally { control.dispose(); }
}

/** Authenticated local mode. It owns Auth refresh, but has no progress transport or binding. */
export async function prepareAuthenticatedAccountAccess(owned: ReturnType<typeof createAccountReviewSession>, options: {
  userId: string; origin: string; project: string; storage: RestoreStorage;
  email?: string; previous?: { raw: string; consentedAt: number };
}): Promise<AuthenticatedAccountSession> {
  const result = await owned.client.auth.getSession();
  if (result.error || !result.data.session || result.data.session.user.id !== options.userId) throw new Error('Valide o acesso novamente antes de continuar.');
  const control = createTabAccessControl({...options,remember:true,tokens:result.data.session});
  return {
    client:owned.client,userId:options.userId,email:options.email,
    activateResume:()=>control.activate(),forgetResume:()=>control.forget(),
    dispose:()=>{control.dispose();owned.dispose();},
    startRefresh:invalidate=>owned.startLiveRefresh(document,invalidate),
    watchIdentity:invalidate=>{
      const {data:{subscription}}=owned.client.auth.onAuthStateChange((_event,next)=>{
        try { if (!next || next.user.id !== options.userId) invalidate(); else control.capture(next); }
        catch { invalidate(); }
      });
      const stopDeadline=watchAccessDeadline(control,invalidate);
      return ()=>{subscription.unsubscribe();stopDeadline();};
    },
  };
}

/** Called after identity/binding review. Persistence starts only under the live lease. */
export async function prepareLiveAccountAccess(owned: ReturnType<typeof createAccountReviewSession>, options: {
  userId: string; bindingRaw: string; origin: string; project: string; storage: RestoreStorage;
  email?: string;
  remember: boolean; previous?: { raw: string; consentedAt: number };
}): Promise<LiveAccountSession> {
  const result = options.remember ? await owned.client.auth.getSession() : null;
  if (result && (result.error || !result.data.session || result.data.session.user.id !== options.userId)) throw new Error('Valide o acesso novamente antes de continuar.');
  const control = createTabAccessControl({...options,tokens:result?.data.session ?? undefined});
  return {
    client:owned.client,userId:options.userId,email:options.email,bindingRaw:options.bindingRaw,allProfilesConfirmed:true,
    activateResume:()=>control.activate(),forgetResume:()=>control.forget(),
    dispose:()=>{control.dispose();owned.dispose();},
    startRefresh:invalidate=>owned.startLiveRefresh(document,invalidate),
    watchIdentity:invalidate=>{
      // Synchronous callback only: awaiting Auth inside it can deadlock the SDK.
      const {data:{subscription}}=owned.client.auth.onAuthStateChange((_event,next)=>{
        try { if (!next || next.user.id !== options.userId) invalidate(); else control.capture(next); }
        catch { invalidate(); }
      });
      const stopDeadline=watchAccessDeadline(control,invalidate);
      return ()=>{subscription.unsubscribe();stopDeadline();};
    },
  };
}
