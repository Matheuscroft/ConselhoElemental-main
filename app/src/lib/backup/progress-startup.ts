import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { ACCOUNT_BINDING_KEY, inspectAccountBinding } from './account-binding';
import { ACCOUNT_INTENT_KEY, inspectAccountIntent } from './account-intent';
import { RESTORE_JOURNAL_KEY } from './restore-journal';
import { LOCAL_PROGRESS_MODE_KEY, validateLocalProgressMode, isolateRestoredLocalDocument } from './progress-mode';

export const PROGRESS_SESSION_LOCK = 'conselho-elemental-progress-session-v1';
let applicationImportStarted = false;
let exclusiveSession = false;
export function hasExclusiveProgressSession(): boolean { return exclusiveSession; }
/** Once modules may have hydrated, only a new document can restore safely. */
export function hasProgressAppStarted(): boolean { return applicationImportStarted; }
export type StartupBlock = 'pending-restore' | 'pending-account' | 'storage-unavailable' | 'busy' | 'startup-failed';
interface StartupOptions {
  storage: () => Pick<Storage, 'getItem'>;
  origin?: string;
  locks?: Pick<LockManager, 'request'>;
  load: () => Promise<void>;
  /** Explicit handoff or isolated saved-access review, never direct App hydration. */
  exclusive?: boolean;
  blocked: (reason: StartupBlock) => void;
  /** Tests can end the lifetime. Production holds the shared lease until document destruction. */
  lifetime?: Promise<void>;
}

/** No stores, hydration, auth or writes before the guard.
 * A pending journal blocks even if malformed: automatic recovery is NOT enabled.
 * Shared leases coordinate only upgraded, cooperative tabs. They do not stop
 * old tabs, extensions, or unrelated storage writers.
 */
export async function startProgressSession(options: StartupOptions): Promise<void> {
  const enter = async () => {
    try {
      if (options.storage().getItem(ACCOUNT_RESOLUTION_KEY) !== null) { options.blocked('pending-account'); return; }
      if (options.storage().getItem(RESTORE_JOURNAL_KEY) !== null) {
        options.blocked('pending-restore');
        return;
      }
      const intentRaw = options.storage().getItem(ACCOUNT_INTENT_KEY);
      const mode = options.storage().getItem(LOCAL_PROGRESS_MODE_KEY);
      const bindingRaw = options.storage().getItem(ACCOUNT_BINDING_KEY);
      if (bindingRaw !== null) {
        try { await inspectAccountBinding(bindingRaw,options.origin ?? ''); }
        catch { options.blocked('pending-account'); return; }
        if (options.storage().getItem(ACCOUNT_BINDING_KEY) !== bindingRaw
          || options.storage().getItem(ACCOUNT_INTENT_KEY) !== intentRaw
          || options.storage().getItem(LOCAL_PROGRESS_MODE_KEY) !== mode
          || options.storage().getItem(RESTORE_JOURNAL_KEY) !== null) { options.blocked('pending-account'); return; }
        // A binding never authenticates. Even without its local-mode marker,
        // this document must not construct the legacy auth/sync client.
        isolateRestoredLocalDocument();
      }
      if (intentRaw !== null) {
        let paused = false;
        try { paused = (await inspectAccountIntent(intentRaw, options.origin ?? '')).phase === 'paused'; }
        catch { options.blocked('pending-account'); return; }
        // Paused work is safe only in a durable local document. Changes during
        // hashing cannot silently switch this document back to legacy auth.
        if (!paused || mode === null || options.storage().getItem(ACCOUNT_INTENT_KEY) !== intentRaw
          || options.storage().getItem(LOCAL_PROGRESS_MODE_KEY) !== mode
          || options.storage().getItem(RESTORE_JOURNAL_KEY) !== null) { options.blocked('pending-account'); return; }
      }
      if (mode !== null && validateLocalProgressMode(mode, options.origin ?? '')) isolateRestoredLocalDocument();
    } catch {
      options.blocked('storage-unavailable');
      return;
    }
    try {
      if (options.storage().getItem(ACCOUNT_RESOLUTION_KEY) !== null) { options.blocked('pending-account'); return; }
      applicationImportStarted = true;
      await options.load();
    } catch {
      options.blocked('startup-failed');
    }
    // Even a failed import/mount may have initialized part of the module graph.
    // Do not release its lease until this document ends (reload is the retry).
    await (options.lifetime ?? new Promise<void>(() => {}));
  };
  if (!options.locks) {
    if (options.exclusive) { options.blocked('busy'); return; }
    // Preserve normal use on older browsers; restoration remains unavailable everywhere.
    await enter();
    return;
  }
  try {
    await options.locks.request(PROGRESS_SESSION_LOCK, { mode: options.exclusive ? 'exclusive' : 'shared', ifAvailable: true }, async lock => {
      if (!lock) { options.blocked('busy'); return; }
      exclusiveSession = options.exclusive === true;
      try { await enter(); } finally { exclusiveSession = false; }
    });
  } catch {
    // A failed lock API is not a reason to bypass coordination silently.
    options.blocked('startup-failed');
  }
}
