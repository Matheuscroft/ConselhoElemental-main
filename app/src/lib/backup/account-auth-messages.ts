/** Pure mapping from a Supabase Auth failure to a safe Portuguese message.
 * Never echoes the server text, the email, a token, a URL or a key. A login
 * failure never says whether an account exists (same text for unknown email
 * and wrong password). `code` is a short technical tag for bug reports. */
export type AccountAuthAction = 'login' | 'signup' | 'resend' | 'reset' | 'oauth';
export interface AccountAuthMessage { message: string; code: string | null }

const NETWORK = 'Sem conexão com o servidor. Verifique a internet.';
const SERVER = 'O serviço de conta está indisponível. Tente de novo em instantes.';
const EMAIL_LIMIT = 'O envio de e-mails está no limite. Tente de novo em alguns minutos.';
const TOO_MANY = 'Muitas tentativas. Aguarde alguns minutos.';

function field(error: unknown, key: string): unknown {
  return error && typeof error === 'object' && key in error ? (error as Record<string, unknown>)[key] : undefined;
}
export function accountAuthMessage(error: unknown, action: AccountAuthAction, fallback: string): AccountAuthMessage {
  const rawCode = field(error, 'code'), rawStatus = field(error, 'status'), name = field(error, 'name');
  const code = typeof rawCode === 'string' && /^[a-z0-9_]{1,64}$/.test(rawCode) ? rawCode : null;
  const status = typeof rawStatus === 'number' ? rawStatus : null;
  const tag = code ?? (status ? `http_${status}` : null);
  const out = (message: string, shown: string | null = tag): AccountAuthMessage => ({ message, code: shown });
  if (code === 'over_email_send_rate_limit') return out(EMAIL_LIMIT);
  if (code === 'over_request_rate_limit' || status === 429) return out(action === 'reset' ? EMAIL_LIMIT : TOO_MANY);
  if (status !== null && status >= 500) return out(SERVER);
  if (!code && (status === 0 || name === 'AuthRetryableFetchError' || error instanceof TypeError)) return out(NETWORK, 'network');
  if (action === 'login') {
    // GoTrue checks the password first, so email_not_confirmed is only returned for the right password.
    if (code === 'email_not_confirmed') return out('Confirme seu e-mail para entrar. Se não recebeu o link, use "Reenviar confirmação" em "Não recebeu o e-mail de confirmação?".');
    if (code === 'invalid_credentials') return out('E-mail ou senha incorretos.');
  }
  if (action === 'signup' || action === 'resend') {
    if (code === 'email_address_not_authorized') return out('Este e-mail ainda não pode receber mensagens nesta fase do beta.');
  }
  if (action === 'signup') {
    if (code === 'weak_password') return out('A senha é fraca demais. Use pelo menos 8 caracteres e evite senhas comuns.');
    if (code === 'signup_disabled') return out('O cadastro está fechado no momento.');
  }
  if (action === 'oauth') {
    if (code === 'provider_disabled' || code === 'oauth_provider_not_supported') return out('Este provedor de acesso ainda não está disponível. Use e-mail e senha por enquanto.');
    if (code === 'access_denied') return out('O acesso pelo provedor foi cancelado ou negado. Nada foi alterado.');
    if (code === 'provider_email_needs_verification') return out('O provedor não confirmou seu e-mail. Use outro método de acesso.');
    if (code && ['bad_oauth_callback', 'bad_oauth_state', 'bad_code_verifier', 'flow_state_not_found', 'flow_state_expired', 'oauth_error'].includes(code)) return out('Não foi possível concluir o retorno do provedor. Tente de novo.');
  }
  return out(fallback);
}
/** Error that carries the safe technical code next to the safe message. */
export class AccountAuthError extends Error {
  code: string | null;
  constructor(result: AccountAuthMessage) { super(result.message); this.name = 'AccountAuthError'; this.code = result.code; }
}
export function accountErrorCode(reason: unknown): string | null {
  const code = field(reason, 'code');
  return reason instanceof Error && reason.name === 'AccountAuthError' && typeof code === 'string' ? code : null;
}
