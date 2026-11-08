import { matchesPasswordRecoveryProof } from './account-recovery-proof';

/** A local reset request is forwarded before Auth creates its PKCE verifier. */
export const PRODUCTION_APP_ORIGIN = 'https://conselho-elemental-main.vercel.app';
export function canonicalRecoveryRequestTarget(href: string) {
  const url = new URL(href);
  const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const sensitive = ['code', 'access_token', 'refresh_token', 'token_hash', 'id_token', 'error', 'error_code', 'error_description'];
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.get('progresso') !== 'recuperar' || !localHost || url.protocol !== 'http:'
    || sensitive.some(key => url.searchParams.has(key) || fragment.has(key))) return null;
  return `${PRODUCTION_APP_ORIGIN}/?progresso=recuperar`;
}

/** Detect a recovery code even if the provider falls back to Site URL and drops
 * the route query. Auth codes are accepted only alongside this browser's proof. */
export function isPasswordRecoveryCallback(href: string, proof: string | null, origin: string, projectUrl: string | undefined, now = Date.now()) {
  const url = new URL(href);
  return url.searchParams.getAll('code').length === 1
    && matchesPasswordRecoveryProof(proof, origin, projectUrl, now);
}

/** Capture a recovery callback and remove credentials before importing Auth or App. */
export function captureRecoveryEntry(href: string, replace: (url: string) => void, proofFallback = false) {
  const url = new URL(href);
  const codes = url.searchParams.getAll('code');
  const recoveryRoute = url.searchParams.get('progresso') === 'recuperar';
  const fallback = !recoveryRoute && proofFallback && codes.length === 1;
  const fragment = new URLSearchParams(url.hash.slice(1));
  const sensitive = ['code', 'access_token', 'refresh_token', 'token_hash', 'id_token', 'error', 'error_code', 'error_description'];
  const hasFragment = sensitive.some(key => fragment.has(key));
  const otherSensitive = sensitive.filter(key => key !== 'code').some(key => url.searchParams.has(key));
  const rejected = hasFragment || otherSensitive || codes.length > 1 || (!recoveryRoute && !fallback);
  let code = !rejected && codes.length === 1 && codes[0].length > 0 && codes[0].length <= 2048 ? codes[0] : null;
  const supplied = codes.length > 0 || hasFragment || otherSensitive;
  for (const key of sensitive) url.searchParams.delete(key);
  if (hasFragment) url.hash = '';
  replace(recoveryRoute || fallback ? '/?progresso=recuperar' : url.pathname + url.search + url.hash);
  return {
    kind: code ? 'callback' as const : supplied ? 'invalid' as const : 'request' as const,
    takeCode() { const value = code; code = null; return value; },
    discard() { code = null; },
  };
}
export type RecoveryEntry = ReturnType<typeof captureRecoveryEntry>;
