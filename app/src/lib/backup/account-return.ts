export type AccountReturnNotice = 'returned' | 'invalid' | 'none';
/** A confirmation URL is not proof of identity. Discard credentials and require
 * explicit login, including when the email link falls back to the site's root. */
export function captureAccountReturn(href: string, replace: (url: string) => void): AccountReturnNotice {
  const url = new URL(href), fragment = new URLSearchParams(url.hash.slice(1));
  const tokens = ['access_token', 'refresh_token', 'token_hash', 'id_token'];
  const context = url.searchParams.get('progresso') === 'conta' || url.pathname === '/' || ['/auth', '/entrar', '/cadastro', '/boas-vindas'].includes(url.pathname);
  const hashAuth = [...tokens, 'error', 'error_code', 'error_description'].some(key => fragment.has(key));
  const queryAuth = tokens.some(key => url.searchParams.has(key)) || (context && ['code', 'error', 'error_code', 'error_description'].some(key => url.searchParams.has(key)));
  if (!hashAuth && !queryAuth) return 'none';
  const invalid = ['error', 'error_code', 'error_description'].some(key => fragment.has(key) || url.searchParams.has(key));
  // No callback code/token survives in route state or browser history.
  replace('/?progresso=conta');
  return invalid ? 'invalid' : 'returned';
}
