export type AccountReturnNotice = 'returned' | 'invalid' | 'oauth' | 'none';
/** Set (value = start time) just before leaving for a social provider. A bare
 * `?code=` is only treated as an OAuth return while this fresh marker exists. */
export const ACCOUNT_OAUTH_PENDING_KEY = 'conselho-elemental-account-oauth-pending-v1';
const OAUTH_PENDING_TTL = 10 * 60 * 1000;
export interface AccountOAuthReturn { code: string | null; errorCode: string | null }
/** In memory only: the code never reaches storage, history or logs. */
let oauthReturn: AccountOAuthReturn | null = null;
export function takeOAuthReturn(): AccountOAuthReturn | null { const value = oauthReturn; oauthReturn = null; return value; }
function oauthPending(now = Date.now()) {
  try {
    const started = Number(globalThis.sessionStorage?.getItem(ACCOUNT_OAUTH_PENDING_KEY));
    return Number.isSafeInteger(started) && started <= now && now - started < OAUTH_PENDING_TTL;
  } catch { return false; }
}
function clearOAuthPending() { try { globalThis.sessionStorage?.removeItem(ACCOUNT_OAUTH_PENDING_KEY); } catch { /* expires by itself */ } }
/** A confirmation URL is not proof of identity. Discard credentials and require
 * explicit login, including when the email link falls back to the site's root. */
export function captureAccountReturn(href: string, replace: (url: string) => void): AccountReturnNotice {
  const url = new URL(href), fragment = new URLSearchParams(url.hash.slice(1));
  const tokens = ['access_token', 'refresh_token', 'token_hash', 'id_token'];
  const context = url.searchParams.get('progresso') === 'conta' || url.pathname === '/' || ['/auth', '/entrar', '/cadastro', '/boas-vindas'].includes(url.pathname);
  const hashAuth = [...tokens, 'error', 'error_code', 'error_description'].some(key => fragment.has(key));
  const queryAuth = tokens.some(key => url.searchParams.has(key)) || (context && ['code', 'error', 'error_code', 'error_description'].some(key => url.searchParams.has(key)));
  if (!hashAuth && !queryAuth) return 'none';
  if (context && oauthPending()) {
    const codes = url.searchParams.getAll('code');
    const failure = ['error_code', 'error'].map(key => fragment.get(key) ?? url.searchParams.get(key)).find(value => value !== null && value !== undefined);
    const hasError = ['error', 'error_code', 'error_description'].some(key => fragment.has(key) || url.searchParams.has(key));
    const clean = !tokens.some(key => fragment.has(key) || url.searchParams.has(key));
    const code = codes.length === 1 && clean && !hasError && /^[A-Za-z0-9._~-]{8,512}$/.test(codes[0]) ? codes[0] : null;
    if (code || hasError) {
      clearOAuthPending();
      // Only a short technical tag survives; never the description or any URL text.
      const tag = (failure ?? '').toLowerCase();
      oauthReturn = { code, errorCode: code ? null : /^[a-z0-9_]{1,64}$/.test(tag) ? tag : 'oauth_error' };
      replace('/?progresso=conta');
      return 'oauth';
    }
  }
  const invalid = ['error', 'error_code', 'error_description'].some(key => fragment.has(key) || url.searchParams.has(key));
  // No callback code/token survives in route state or browser history.
  replace('/?progresso=conta');
  return invalid ? 'invalid' : 'returned';
}
