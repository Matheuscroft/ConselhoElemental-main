import type { SupabaseClient } from '@supabase/supabase-js';

export type AccountAccessMode = 'login' | 'signup';
export function validAccountEmail(email: string) {
  const address = email.trim();
  return address.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}
export function validAccountAccess(mode: AccountAccessMode, email: string, password: string, confirmation = '') {
  return validAccountEmail(email) && password.length > 0 && password.length <= 4096
    && (mode === 'login' || (password.length >= 8 && password === confirmation));
}
export function accountConfirmationRedirect(origin: string) {
  const url = new URL(origin);
  if (url.username || url.password || url.origin !== origin || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))) throw new Error('A origem do acesso precisa de revisão.');
  return new URL('/?progresso=conta', url.origin).href;
}
/** Known operational failures only; never show opaque server messages or credentials. */
export function accountAccessFailure(error: unknown, fallback: string): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
  if (code === 'email_address_not_authorized') return 'O envio de confirmação para novos testadores ainda está sendo configurado. Seu progresso continua salvo neste aparelho.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'O limite de e-mails foi atingido. Aguarde antes de pedir outro link; seu progresso continua salvo.';
  return fallback;
}
type Client = Pick<SupabaseClient, 'auth'>;
/** Authentication only: no archive, storage, binding, sync or data transfer. */
export async function accessAccount(client: Client, input: { mode: AccountAccessMode; email: string; password: string; confirmation?: string; origin: string }, current: () => boolean) {
  const check = () => { if (!current()) throw new Error('A conferência mudou. Entre novamente.'); };
  check();
  if (!validAccountAccess(input.mode, input.email, input.password, input.confirmation)) throw new Error('Confira o e-mail e a senha. No cadastro, confirme uma senha com pelo menos 8 caracteres.');
  const credentials = { email: input.email.trim(), password: input.password };
  if (input.mode === 'signup') {
    const result = await client.auth.signUp({ ...credentials, options: { emailRedirectTo: accountConfirmationRedirect(input.origin) } });
    check();
    if (result.error) throw new Error(accountAccessFailure(result.error, 'Não foi possível confirmar o pedido. Confira seu e-mail antes de repetir e revise a política de senha.'));
    // Even an autoconfirm session is not adopted. The following login is explicit.
    return { kind: 'confirmation' as const, message: 'Se este e-mail precisar de confirmação, você receberá um link. Depois, entre para validar o acesso. Nenhum progresso foi enviado.' };
  }
  const result = await client.auth.signInWithPassword(credentials); check();
  if (result.error || !result.data.session) throw new Error('Não foi possível entrar. Confira os dados e a confirmação do e-mail.');
  const signedId=result.data.user?.id;
  const verified = await client.auth.getUser(); check();
  if (verified.error || !verified.data.user?.id) throw new Error('Não foi possível validar a conta no servidor.');
  if(!signedId||verified.data.user.id!==signedId)throw new Error('A conta validada mudou. Entre na mesma conta novamente.');
  return { kind: 'authenticated' as const, userId: verified.data.user.id };
}
export async function resendAccountConfirmation(client: Client, email: string, origin: string, current: () => boolean) {
  if (!current() || !validAccountEmail(email)) throw new Error('Confira o e-mail antes de solicitar outro link.');
  const result = await client.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: accountConfirmationRedirect(origin) } });
  if (!current()) throw new Error('A conferência mudou. Confira o e-mail antes de repetir.');
  if (result.error) throw new Error(accountAccessFailure(result.error, 'Não foi possível confirmar o envio. Aguarde e confira seu e-mail antes de repetir.'));
  return 'Se houver confirmação pendente para este e-mail, você receberá outro link. Nenhum progresso foi enviado.';
}
