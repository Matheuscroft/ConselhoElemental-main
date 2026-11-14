/** Single decision point for where the saved account access lives:
 * `localStorage` when the person chose "Manter conectado neste aparelho",
 * `sessionStorage` (this tab only) otherwise. Reads look in both places
 * (persistent first), writes go to one place and drop the other copy, and
 * removal clears both, so tokens never exist twice.
 * Authentication metadata only; never part of a progress archive. */
export interface AccountAccessStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface AccountAccessSurface { readonly localStorage?: AccountAccessStorage; readonly sessionStorage?: AccountAccessStorage }

/** Only a boolean, only in sessionStorage, only to survive the Google redirect. */
export const ACCOUNT_REMEMBER_CHOICE_KEY = 'conselho-elemental-account-remember-v1';
const UNAVAILABLE = 'O navegador não conseguiu guardar o acesso. Entre novamente; seu progresso continua preservado.';

/** Version 1 only ever existed per tab: a v1 copy in localStorage is not trusted. */
function acceptedInLocal(raw: string): boolean {
  try { const value: unknown = JSON.parse(raw); return !(value && typeof value === 'object' && (value as { version?: unknown }).version === 1); }
  catch { return true; }
}

/** `remember` true/false chooses where a new record is written. `undefined`
 * keeps the record wherever it already lives (resume, forget, startup checks).
 * An unreadable or full localStorage falls back to this tab; an unreadable
 * sessionStorage still throws on read so startup keeps its protective screen. */
export function accountAccessStorage(remember: boolean | undefined, surface: AccountAccessSurface): AccountAccessStorage {
  const local = (): AccountAccessStorage | null => { try { return surface.localStorage ?? null; } catch { return null; } };
  const session = (): AccountAccessStorage | null => { try { return surface.sessionStorage ?? null; } catch { return null; } };
  const readLocal = (key: string): string | null => {
    try { const raw = local()?.getItem(key) ?? null; return raw !== null && acceptedInLocal(raw) ? raw : null; } catch { return null; }
  };
  return {
    getItem: key => readLocal(key) ?? surface.sessionStorage?.getItem(key) ?? null,
    setItem(key, value) {
      const persistent = remember === undefined ? readLocal(key) !== null : remember;
      const target = persistent ? local() : null;
      let stored = false;
      if (target) { try { target.setItem(key, value); stored = true; } catch { /* quota or private mode: keep it in this tab */ } }
      if (!stored) {
        const tab = session();
        if (!tab) throw new Error(UNAVAILABLE);
        try { tab.setItem(key, value); } catch { throw new Error(UNAVAILABLE); }
      }
      try { (stored ? session() : local())?.removeItem(key); } catch { /* the caller verifies the surviving copy */ }
    },
    removeItem(key) {
      for (const place of [local(), session()]) { try { place?.removeItem(key); } catch { /* the caller verifies absence */ } }
    },
  };
}

export function saveRememberChoice(remember: boolean, surface: AccountAccessSurface) {
  try { surface.sessionStorage?.setItem(ACCOUNT_REMEMBER_CHOICE_KEY, remember ? '1' : '0'); } catch { /* without it the return stays tab-only */ }
}
/** Read once and cleared. A missing marker means "this tab only". */
export function takeRememberChoice(surface: AccountAccessSurface): boolean {
  try {
    const value = surface.sessionStorage?.getItem(ACCOUNT_REMEMBER_CHOICE_KEY) ?? null;
    surface.sessionStorage?.removeItem(ACCOUNT_REMEMBER_CHOICE_KEY);
    return value === '1';
  } catch { return false; }
}
