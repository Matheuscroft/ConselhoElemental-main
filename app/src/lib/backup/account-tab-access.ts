import { ACCOUNT_TAB_ACCESS_KEY } from './account-resume-entry';
import type { RestoreStorage } from './restore-journal';

export const ACCOUNT_TAB_ACCESS_TTL = 12 * 60 * 60 * 1000;
export interface TabAccess {
  format: 'conselho-elemental-tab-access'; version: 1;
  origin: string; project: string; userId: string; consentedAt: number;
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
  const keys = ['format','version','origin','project','userId','consentedAt','accessToken','refreshToken'];
  const token = (s: unknown) => typeof s === 'string' && s.length > 0 && s.length <= 14000 && !/\s/.test(s);
  if (Object.keys(v).length !== keys.length || keys.some(k => !Object.hasOwn(v,k))
    || v.format !== 'conselho-elemental-tab-access' || v.version !== 1 || !origin || v.origin !== origin || v.project !== accountProject(project)
    || typeof v.userId !== 'string' || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v.userId)
    || typeof v.consentedAt !== 'number' || !Number.isSafeInteger(v.consentedAt) || v.consentedAt > now || now - v.consentedAt >= ACCOUNT_TAB_ACCESS_TTL
    || !token(v.accessToken) || !token(v.refreshToken)) invalid();
  return Object.freeze(v as unknown as TabAccess);
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
  let tokens = options.tokens, active = false, disposed = false;
  function check() { if (options.storage.getItem(ACCOUNT_TAB_ACCESS_KEY) !== expected) invalid(); }
  function persist() {
    check();
    if (!options.remember) { options.storage.removeItem(ACCOUNT_TAB_ACCESS_KEY); expected = null; }
    else {
      if (!tokens || tokens.user.id !== options.userId) invalid();
      const raw = JSON.stringify({format:'conselho-elemental-tab-access',version:1,origin:options.origin,project,userId:options.userId,consentedAt,accessToken:tokens.access_token,refreshToken:tokens.refresh_token});
      inspectTabAccess(raw,options.origin,project,now());
      options.storage.setItem(ACCOUNT_TAB_ACCESS_KEY,raw); expected = raw;
    }
    check();
  }
  return {
    deadline: options.remember ? consentedAt + ACCOUNT_TAB_ACCESS_TTL : null,
    activate() { if (disposed) invalid(); persist(); active = true; },
    capture(next: AccessTokens) { if (disposed) return; if (next.user.id !== options.userId) invalid(); tokens = next; if (active && options.remember) persist(); },
    forget() { check(); options.storage.removeItem(ACCOUNT_TAB_ACCESS_KEY); expected = null; check(); active = false; },
    dispose() { disposed = true; active = false; tokens = undefined; },
  };
}
