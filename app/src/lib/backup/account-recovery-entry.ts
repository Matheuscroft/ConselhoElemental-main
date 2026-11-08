export const PRODUCTION_APP_ORIGIN = 'https://conselho-elemental-main.vercel.app';
export interface RecoveryCredentials { accessToken: string; refreshToken: string }
const QUERY_CREDENTIALS = ['code', 'access_token', 'refresh_token', 'token_hash', 'id_token'];
const CALLBACK_ERRORS = ['error', 'error_code', 'error_description'];
const MAX_TOKEN_LENGTH = 32_768;

function implicitCredentials(url: URL): RecoveryCredentials | null {
  const fragment = new URLSearchParams(url.hash.slice(1));
  const access = fragment.getAll('access_token'), refresh = fragment.getAll('refresh_token'), types = fragment.getAll('type');
  if (access.length !== 1 || refresh.length !== 1 || types.length !== 1 || types[0] !== 'recovery') return null;
  if (!access[0] || !refresh[0] || access[0].length > MAX_TOKEN_LENGTH || refresh[0].length > MAX_TOKEN_LENGTH) return null;
  if ([...QUERY_CREDENTIALS, ...CALLBACK_ERRORS].some(key => url.searchParams.has(key))) return null;
  if (['code', 'token_hash', 'id_token', ...CALLBACK_ERRORS].some(key => fragment.has(key))) return null;
  return { accessToken: access[0], refreshToken: refresh[0] };
}

/** The implicit recovery fragment is sufficient on any browser and never reaches Vercel logs. */
export function isPasswordRecoveryCallback(href: string) {
  const url = new URL(href);
  return implicitCredentials(url) !== null;
}

/** Capture a recovery callback and remove credentials before importing Auth or App. */
export function captureRecoveryEntry(href: string, replace: (url: string) => void, callbackFallback = false) {
  const url = new URL(href);
  const recoveryRoute = url.searchParams.get('progresso') === 'recuperar';
  const fallback = !recoveryRoute && callbackFallback;
  const fragment = new URLSearchParams(url.hash.slice(1));
  let credentials = recoveryRoute || fallback ? implicitCredentials(url) : null;
  const sensitive = [...QUERY_CREDENTIALS, ...CALLBACK_ERRORS];
  const supplied = sensitive.some(key => url.searchParams.has(key) || fragment.has(key)) || fragment.has('type');
  for (const key of sensitive) url.searchParams.delete(key);
  if (url.hash) url.hash = '';
  replace(recoveryRoute || fallback ? '/?progresso=recuperar' : url.pathname + url.search + url.hash);
  return {
    kind: credentials ? 'callback' as const : supplied ? 'invalid' as const : 'request' as const,
    takeCredentials() { const value = credentials; credentials = null; return value; },
    discard() { credentials = null; },
  };
}
export type RecoveryEntry = ReturnType<typeof captureRecoveryEntry>;
