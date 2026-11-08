import type { createAccountReviewSession } from './account-session';
import type { LiveAccountSession } from './account-live-sync';
import { createTabAccessControl } from './account-tab-access';
import type { RestoreStorage } from './restore-journal';

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
      const timeout=control.deadline===null?undefined:setTimeout(invalidate,Math.max(0,control.deadline-Date.now()));
      return ()=>{subscription.unsubscribe();if(timeout!==undefined)clearTimeout(timeout);};
    },
  };
}
