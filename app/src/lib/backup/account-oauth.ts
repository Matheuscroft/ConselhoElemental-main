import type { SupabaseClient } from '@supabase/supabase-js';
import { PRODUCTION_APP_ORIGIN } from './account-recovery-entry';
import { ACCOUNT_OAUTH_PENDING_KEY } from './account-return';
import { AccountAuthError, accountAuthMessage } from './account-auth-messages';
import type { OAuthPkceOptions } from './account-session';

/** Social sign-in. Authentication only: no archive, binding, sync or adoption.
 * A new or linked Auth user starts exactly like an e-mail login: explicit consent later. */
export type AccountOAuthProvider = 'google';
export const ACCOUNT_OAUTH_PROVIDERS: readonly AccountOAuthProvider[] = ['google'];
export const ACCOUNT_OAUTH_LABELS: Record<AccountOAuthProvider, string> = { google: 'Continuar com Google' };
/** Same fixed return as the e-mail confirmation: the panel allow-list holds only this and ?progresso=recuperar. */
export const ACCOUNT_OAUTH_REDIRECT = `${PRODUCTION_APP_ORIGIN}/?progresso=conta`;
export const ACCOUNT_OAUTH_STORAGE_KEY = 'ce-account-oauth';
const FALLBACK = 'Não foi possível entrar pelo provedor. Tente de novo ou use e-mail e senha.';

type Client = Pick<SupabaseClient, 'auth'>;
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function oauthPkceOptions(verifierStorage: Store): OAuthPkceOptions { return { storageKey: ACCOUNT_OAUTH_STORAGE_KEY, verifierStorage }; }
export function clearOAuthAttempt(storage: Store) {
  try { storage.removeItem(ACCOUNT_OAUTH_PENDING_KEY); storage.removeItem(`${ACCOUNT_OAUTH_STORAGE_KEY}-code-verifier`); } catch { /* both expire with the tab */ }
}
/** The browser only leaves for the project's own Auth host. */
function authorizeUrl(value: string, projectUrl: string) {
  const target = new URL(value), project = new URL(projectUrl);
  if (target.origin !== project.origin || target.pathname !== '/auth/v1/authorize') throw new Error('O endereço do provedor precisa de revisão. Nada foi enviado.');
  return target.toString();
}
/** Starts the provider redirect. Resolves with the URL to open; the caller navigates. */
export async function startAccountOAuth(client: Client, provider: AccountOAuthProvider, options: { projectUrl: string; storage: Store; now?: () => number }, current: () => boolean) {
  if (!ACCOUNT_OAUTH_PROVIDERS.includes(provider)) throw new Error('Escolha um provedor de acesso disponível.');
  if (!current()) throw new Error('A conferência mudou. Entre novamente.');
  clearOAuthAttempt(options.storage);
  const result = await client.auth.signInWithOAuth({ provider, options: { redirectTo: ACCOUNT_OAUTH_REDIRECT, skipBrowserRedirect: true } });
  if (!current()) { clearOAuthAttempt(options.storage); throw new Error('A conferência mudou. Entre novamente.'); }
  if (result.error || !result.data?.url) { clearOAuthAttempt(options.storage); throw new AccountAuthError(accountAuthMessage(result.error, 'oauth', FALLBACK)); }
  let url: string;
  try { url = authorizeUrl(result.data.url, options.projectUrl); } catch (reason) { clearOAuthAttempt(options.storage); throw reason; }
  options.storage.setItem(ACCOUNT_OAUTH_PENDING_KEY, String((options.now ?? Date.now)()));
  return url;
}
/** Completes the PKCE exchange from the in-memory code, then validates identity on the server. */
export async function completeAccountOAuth(client: Client, code: string, storage: Store, current: () => boolean) {
  const check = () => { if (!current()) throw new Error('A conferência mudou. Entre novamente.'); };
  check();
  try {
    if (!/^[A-Za-z0-9._~-]{8,512}$/.test(code)) throw new AccountAuthError(accountAuthMessage({ code: 'bad_oauth_callback' }, 'oauth', FALLBACK));
    const result = await client.auth.exchangeCodeForSession(code); check();
    if (result.error) throw new AccountAuthError(accountAuthMessage(result.error, 'oauth', FALLBACK));
    const signedId = result.data.session?.user?.id;
    if (!signedId) throw new AccountAuthError(accountAuthMessage({ code: 'bad_oauth_callback' }, 'oauth', FALLBACK));
    const verified = await client.auth.getUser(); check();
    if (verified.error || !verified.data.user?.id) throw new Error('Não foi possível validar a conta no servidor.');
    if (verified.data.user.id !== signedId) throw new Error('A conta validada mudou. Entre na mesma conta novamente.');
    const user = verified.data.user;
    return { kind: 'authenticated' as const, userId: user.id, email: user.email };
  } finally { clearOAuthAttempt(storage); }
}
/** Safe text for a failed return (cancelled, denied, provider not configured). */
export function oauthReturnFailure(errorCode: string): AccountAuthError {
  const code = /^[a-z0-9_]{1,64}$/.test(errorCode) ? errorCode : 'oauth_error';
  const known = accountAuthMessage({ code }, 'oauth', FALLBACK);
  return new AccountAuthError(known.message === FALLBACK ? { message: 'Não foi possível concluir o retorno do provedor. Tente de novo.', code } : known);
}
