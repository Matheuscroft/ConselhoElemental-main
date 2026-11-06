/** Capture only the recovery route. Remove credentials before importing Auth or App. */
export function captureRecoveryEntry(href: string, replace: (url: string) => void) {
  const url = new URL(href);
  const codes = url.searchParams.getAll('code');
  const fragment = new URLSearchParams(url.hash.slice(1));
  const sensitive = ['code', 'access_token', 'refresh_token', 'token_hash', 'id_token', 'error', 'error_code', 'error_description'];
  const hasFragment = sensitive.some(key => fragment.has(key));
  const otherSensitive = sensitive.filter(key => key !== 'code').some(key => url.searchParams.has(key));
  const rejected = hasFragment || otherSensitive || codes.length > 1 || url.searchParams.get('progresso') !== 'recuperar';
  let code = !rejected && codes.length === 1 && codes[0].length > 0 && codes[0].length <= 2048 ? codes[0] : null;
  const supplied = codes.length > 0 || hasFragment || otherSensitive;
  for (const key of sensitive) url.searchParams.delete(key);
  if (hasFragment) url.hash = '';
  replace(url.pathname + url.search + url.hash);
  return {
    kind: code ? 'callback' as const : supplied ? 'invalid' as const : 'request' as const,
    takeCode() { const value = code; code = null; return value; },
    discard() { code = null; },
  };
}
export type RecoveryEntry = ReturnType<typeof captureRecoveryEntry>;
