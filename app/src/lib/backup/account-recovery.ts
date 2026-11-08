import { createClient } from '@supabase/supabase-js';
import { RECOVERY_PROOF_KEY } from './account-recovery-proof';

export { RECOVERY_PROOF_KEY } from './account-recovery-proof';
export const RECOVERY_LOCK = 'conselho-elemental-password-recovery-operation-v1';
const MAX_AGE = 60 * 60 * 1000;
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
interface Options {
  url?: string; key?: string; origin: string; storage: StoragePort;
  locks?: Pick<LockManager, 'request'>; now?: () => number;
}
/** Dedicated PKCE client. Only the expiring recovery verifier is durable;
 * tokens/user session stay in a private Map, never in the progress or old Auth. */
export function createPasswordRecovery(options: Options, construct: typeof createClient = createClient) {
  if (!options.url || !options.key) throw new Error('A conexão de acesso ainda não está disponível.');
  const project = new URL(options.url), origin = new URL(options.origin);
  for (const url of [project, origin]) {
    if (url.username || url.password || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))) throw new Error('A conexão de acesso precisa de revisão.');
  }
  if (!options.locks) throw new Error('Este navegador não oferece a proteção necessária. Use um navegador atualizado.');
  const now = options.now ?? Date.now, memory = new Map<string, string>();
  let disposed = false, working = false, ownedProof: string | null = null, userId: string | null = null;
  const live = () => { if (disposed) throw new Error('A conferência de acesso foi encerrada. Solicite outro link.'); };
  function readProof() {
    const raw = options.storage.getItem(RECOVERY_PROOF_KEY);
    if (!raw || raw.length > 4096) throw new Error('Solicite um novo link neste navegador e abra-o no mesmo navegador.');
    let p;
    try { p = JSON.parse(raw); } catch { throw new Error('Solicite um novo link neste navegador.'); }
    if (p?.kind !== 'password-recovery' || p.project !== project.origin || p.origin !== origin.origin || typeof p.createdAt !== 'number' || !Number.isFinite(p.createdAt)
      || now() < p.createdAt || now() - p.createdAt >= MAX_AGE || typeof p.verifier !== 'string' || p.verifier.length > 2048) throw new Error('Este link precisa ser solicitado novamente neste navegador.');
    let verifier;
    try { verifier = JSON.parse(p.verifier); } catch { throw new Error('Solicite um novo link neste navegador.'); }
    if (typeof verifier !== 'string' || !verifier.endsWith('/PASSWORD_RECOVERY')) throw new Error('Este link não pertence à recuperação de senha.');
    ownedProof = raw;
    return p.verifier as string;
  }
  // Unique key also isolates SDK BroadcastChannel/locks from every other client.
  const key = 'ce-recovery-memory-' + crypto.randomUUID();
  const client = construct(options.url, options.key, { auth: {
    flowType: 'pkce', persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, storageKey: key,
    storage: {
      getItem(name) {
        if (disposed) return null;
        if (name !== key + '-code-verifier') return memory.get(name) ?? null;
        try { return readProof(); } catch { return null; } // SDK probes are optional; exchange checks strictly first.
      },
      setItem(name, value) {
        live();
        if (name !== key + '-code-verifier') { memory.set(name, value); return; }
        const raw = JSON.stringify({ kind: 'password-recovery', project: project.origin, origin: origin.origin, createdAt: now(), verifier: value });
        options.storage.setItem(RECOVERY_PROOF_KEY, raw);
        if (options.storage.getItem(RECOVERY_PROOF_KEY) !== raw) throw new Error('Não foi possível guardar a proteção do link.');
        ownedProof = raw;
      },
      removeItem(name) {
        if (name !== key + '-code-verifier') { memory.delete(name); return; }
        if (ownedProof && options.storage.getItem(RECOVERY_PROOF_KEY) === ownedProof) options.storage.removeItem(RECOVERY_PROOF_KEY);
        ownedProof = null;
      },
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
      const redirectTo = new URL('/?progresso=recuperar', origin.origin).href;
      const result = await client.auth.resetPasswordForEmail(address, { redirectTo }); live();
      if (result.error) throw new Error('Não foi possível enviar o link agora. Aguarde e tente novamente.');
      // Generic response avoids disclosing whether this email has an account.
      return 'Se houver uma conta com esse e-mail, você receberá um link. Abra-o neste navegador. Apenas o link mais recente será válido.';
    }); },
    exchange(code: string) { return exclusive(async () => {
      if (userId || !code || code.length > 2048) throw new Error('Solicite outro link de recuperação.');
      try {
        readProof();
        const result = await client.auth.exchangeCodeForSession(code); live();
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
