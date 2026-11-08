import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_APP_ORIGIN, type RecoveryCredentials } from './account-recovery-entry';

export const RECOVERY_LOCK = 'conselho-elemental-password-recovery-operation-v1';
interface Options {
  url?: string; key?: string; origin: string;
  locks?: Pick<LockManager, 'request'>;
}
/** Dedicated implicit-flow client. Recovery credentials stay only in this Map
 * after the URL fragment is scrubbed; they never enter progress or normal Auth. */
export function createPasswordRecovery(options: Options, construct: typeof createClient = createClient) {
  if (!options.url || !options.key) throw new Error('A conexão de acesso ainda não está disponível.');
  const project = new URL(options.url), origin = new URL(options.origin);
  for (const url of [project, origin]) {
    if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))) throw new Error('A conexão de acesso precisa de revisão.');
  }
  if (!options.locks) throw new Error('Este navegador não oferece a proteção necessária. Use um navegador atualizado.');
  const memory = new Map<string, string>();
  let disposed = false, working = false, userId: string | null = null;
  const live = () => { if (disposed) throw new Error('A conferência de acesso foi encerrada. Solicite outro link.'); };
  // Unique key also isolates SDK BroadcastChannel/locks from every other client.
  const key = 'ce-recovery-memory-' + crypto.randomUUID();
  const client = construct(options.url, options.key, { auth: {
    flowType: 'implicit', persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, storageKey: key,
    storage: {
      getItem(name) { return disposed ? null : memory.get(name) ?? null; },
      setItem(name, value) { live(); memory.set(name, value); },
      removeItem(name) { memory.delete(name); },
    },
  } });
  async function exclusive<T>(action: () => Promise<T>): Promise<T> {
    live();
    if (working) throw new Error('Aguarde a operação de acesso atual.');
    working = true;
    try { return await options.locks!.request(RECOVERY_LOCK, { mode: 'exclusive', ifAvailable: true }, async lock => {
      if (!lock) throw new Error('Outra aba está conferindo o acesso. Aguarde antes de tentar novamente.');
      live(); return action();
    }); } finally { working = false; }
  }
  async function verified() {
    live(); const result = await client.auth.getUser(); live();
    if (result.error || !result.data.user?.id || (userId && userId !== result.data.user.id)) throw new Error('Não foi possível validar a conta deste link. Solicite outro.');
    return result.data.user;
  }
  return {
    request(email: string) { return exclusive(async () => {
      if (userId) throw new Error('Encerre a conferência atual antes de solicitar outro link.');
      const address = email.trim();
      if (!address || address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Informe um e-mail válido.');
      // Internal navigation stays on its current origin. Only the email return
      // uses the canonical app, so the link also works on another device.
      const redirectTo = `${PRODUCTION_APP_ORIGIN}/?progresso=recuperar`;
      const result = await client.auth.resetPasswordForEmail(address, { redirectTo }); live();
      if (result.error) throw new Error('Não foi possível enviar o link agora. Aguarde e tente novamente.');
      // Generic response avoids disclosing whether this email has an account.
      return 'Se houver uma conta com esse e-mail, você receberá um link. Ele pode ser aberto em outro aparelho. Apenas o link mais recente será válido.';
    }); },
    exchange(credentials: RecoveryCredentials) { return exclusive(async () => {
      if (userId || !credentials?.accessToken || !credentials?.refreshToken) throw new Error('Solicite outro link de recuperação.');
      try {
        const result = await client.auth.setSession({ access_token: credentials.accessToken, refresh_token: credentials.refreshToken }); live();
        if (result.error || !result.data.session || !result.data.user?.id) throw new Error('Não foi possível validar este link. Solicite outro.');
        userId = result.data.user.id;
        const user = await verified();
        return { email: user.email ?? '', userId: user.id };
      } catch (error) { memory.clear(); userId = null; throw error; }
    }); },
    update(password: string) { return exclusive(async () => {
      if (!userId) throw new Error('Valide seu link antes de definir a senha.');
      if (password.length < 8) throw new Error('Use pelo menos 8 caracteres na nova senha.');
      await verified();
      const result = await client.auth.updateUser({ password }); live();
      if (result.error || result.data.user?.id !== userId) throw new Error('Não foi possível confirmar a alteração. Confira a nova senha ao entrar antes de repetir.');
      const ended = await client.auth.signOut({ scope: 'local' }); live();
      memory.clear(); userId = null;
      return { logoutConfirmed: !ended.error };
    }); },
    dispose() { if (disposed) return; disposed = true; memory.clear(); userId = null; void client.auth.stopAutoRefresh().catch(() => {}); },
  };
}
