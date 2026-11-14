import { ACCOUNT_TAB_ACCESS_KEY } from './account-resume-entry';
import type { RestoreStorage } from './restore-journal';

/** Sliding window: access lasts this long after the LAST successful use. */
export const ACCOUNT_TAB_ACCESS_TTL = 90 * 24 * 60 * 60 * 1000;
/** Version 1 (tab-only, fixed from consent) is accepted only to finish the current tab's life. */
export const ACCOUNT_TAB_ACCESS_V1_TTL = 12 * 60 * 60 * 1000;
/** Serializes Auth token rotation across tabs: a rotated refresh token must never be reused. */
export const ACCOUNT_AUTH_LOCK = 'conselho-elemental-auth-refresh-v1';
export interface TabAccess {
  format: 'conselho-elemental-tab-access'; version: 1 | 2;
  origin: string; project: string; userId: string; consentedAt: number; lastUsedAt: number;
  accessToken: string; refreshToken: string;
}
export interface AccessTokens { user: { id: string }; access_token: string; refresh_token: string }
function invalid(): never { throw new Error('O acesso salvo precisa de conferência. Entre novamente; seu progresso continua preservado.'); }
export function accountProject(url: string): string {
  const parsed = new URL(url);
  if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.pathname !== '/' && parsed.pathname !== '')
    || (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(parsed.hostname)))) invalid();
  return parsed.origin;
}
export function inspectTabAccess(raw: string, origin: string, project: string, now = Date.now()): Readonly<TabAccess> {
  if (raw.length > 32768) invalid();
  let value: unknown; try { value = JSON.parse(raw); } catch { return invalid(); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const v = value as Record<string,unknown>;
  const base = ['format','version','origin','project','userId','consentedAt','accessToken','refreshToken'];
  const keys = v.version === 2 ? [...base,'lastUsedAt'] : base;
  const stamp = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n <= now;
  const token = (s: unknown) => typeof s === 'string' && s.length > 0 && s.length <= 14000 && !/\s/.test(s);
  if (Object.keys(v).length !== keys.length || keys.some(k => !Object.hasOwn(v,k))
    || v.format !== 'conselho-elemental-tab-access' || (v.version !== 1 && v.version !== 2) || !origin || v.origin !== origin || v.project !== accountProject(project)
    || typeof v.userId !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v.userId)
    || !stamp(v.consentedAt)
    || (v.version === 1 ? now - v.consentedAt >= ACCOUNT_TAB_ACCESS_V1_TTL : !stamp(v.lastUsedAt) || v.lastUsedAt < v.consentedAt || now - v.lastUsedAt >= ACCOUNT_TAB_ACCESS_TTL)
    || !token(v.accessToken) || !token(v.refreshToken)) invalid();
  return Object.freeze({ ...v, lastUsedAt: v.version === 1 ? v.consentedAt : v.lastUsedAt } as unknown as TabAccess);
}

/** CAS ownership prevents late Auth callbacks from replacing a newer access.
 * dispose retains metadata on reload; forgetting is a separate explicit action. */
export function createTabAccessControl(options: {
  storage: RestoreStorage; origin: string; project: string; userId: string;
  remember: boolean; tokens?: AccessTokens; previous?: { raw: string; consentedAt: number };
  now?: () => number;
}) {
  const now = options.now ?? Date.now, project = accountProject(options.project);
  let expected = options.previous?.raw ?? options.storage.getItem(ACCOUNT_TAB_ACCESS_KEY);
  if (options.previous && options.storage.getItem(ACCOUNT_TAB_ACCESS_KEY) !== expected) invalid();
  const consentedAt = options.previous?.consentedAt ?? now();
  let lastUsedAt = now();
  let tokens = options.tokens, active = false, disposed = false;
  function check() { if (options.storage.getItem(ACCOUNT_TAB_ACCESS_KEY) !== expected) invalid(); }
  function persist() {
    check();
    if (!options.remember) { options.storage.removeItem(ACCOUNT_TAB_ACCESS_KEY); expected = null; }
    else {
      if (!tokens || tokens.user.id !== options.userId) invalid();
      lastUsedAt = Math.max(consentedAt, now());
      const raw = JSON.stringify({format:'conselho-elemental-tab-access',version:2,origin:options.origin,project,userId:options.userId,consentedAt,lastUsedAt,accessToken:tokens.access_token,refreshToken:tokens.refresh_token});
      inspectTabAccess(raw,options.origin,project,now());
      options.storage.setItem(ACCOUNT_TAB_ACCESS_KEY,raw); expected = raw;
    }
    check();
  }
  return {
    /** Slides forward with every persisted use (activation, restoration, token rotation). */
    get deadline() { return options.remember ? lastUsedAt + ACCOUNT_TAB_ACCESS_TTL : null; },
    activate() { if (disposed) invalid(); persist(); active = true; },
    capture(next: AccessTokens) { if (disposed) return; if (next.user.id !== options.userId) invalid(); tokens = next; if (active && options.remember) persist(); },
    forget() { check(); options.storage.removeItem(ACCOUNT_TAB_ACCESS_KEY); expected = null; check(); active = false; },
    dispose() { disposed = true; active = false; tokens = undefined; },
  };
}

/** Runs `task` while holding the cross-tab Auth lock. Without Web Locks the task runs unguarded. */
export function withAccountAuthLock<T>(task: () => Promise<T>, locks: Pick<LockManager,'request'> | undefined = globalThis.navigator?.locks): Promise<T> {
  return locks ? locks.request(ACCOUNT_AUTH_LOCK, { mode: 'exclusive' }, task) as Promise<T> : task();
}

/** Writes the rotated pair back (and renews `lastUsedAt`) before the lock is released. */
export function persistRestoredAccess(options: {
  storage: RestoreStorage; origin: string; project: string; userId: string;
  session: AccessTokens; previous: { raw: string; consentedAt: number };
}): string {
  const control = createTabAccessControl({ ...options, remember: true, tokens: options.session });
  try { control.activate(); } finally { control.dispose(); }
  const raw = options.storage.getItem(ACCOUNT_TAB_ACCESS_KEY);
  if (!raw) invalid();
  return raw;
}

/** Fires `invalidate` once the sliding deadline passes without a newer use.
 * Timers cap near 24.8 days, so long waits re-arm in shorter steps and re-read the deadline. */
export function watchAccessDeadline(control: { readonly deadline: number | null }, invalidate: () => void, now: () => number = Date.now): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => {
    const deadline = control.deadline;
    if (deadline === null) return;
    const remaining = deadline - now();
    if (remaining <= 0) { invalidate(); return; }
    timer = setTimeout(arm, Math.min(remaining, 24 * 60 * 60 * 1000));
  };
  arm();
  return () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
}
