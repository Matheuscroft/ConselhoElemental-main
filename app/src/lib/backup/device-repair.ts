/**
 * The way out for a browser that can no longer open the app because the link it
 * kept to the account does not match the account any more ("O progresso online
 * mudou ou não corresponde ao vínculo salvo").
 *
 * Both of these only touch this browser. Nothing here reads, sends or changes the
 * account: the person signs in again afterwards and the app brings the account's
 * progress to a device that has none, with no files and no comparison.
 *
 * Kept free of imports so a test can run it on its own.
 */

/** The part of `Storage` this needs, so a test can hand in a small fake. */
export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  clear(): void;
}

export interface RawLocalCopy {
  readonly format: 'conselho-elemental-copia-bruta';
  readonly createdAt: string;
  readonly origin: string;
  /** Every key this browser holds for the app, exactly as stored (nothing parsed or reshaped). */
  readonly entries: Readonly<Record<string, string>>;
}

/**
 * A raw copy of everything the app keeps in this browser. It is deliberately not the
 * app's own export format: it needs no valid progress to exist, so it also works on a
 * browser whose progress is damaged or half-linked, and it keeps the saved link and
 * pending attempts that a support person would want to see.
 */
export function rawLocalCopy(storage: StorageLike, origin: string, now: Date = new Date()): RawLocalCopy {
  const entries: Record<string, string> = {};
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key === null) continue;
    const value = storage.getItem(key);
    if (value !== null) entries[key] = value;
  }
  return { format: 'conselho-elemental-copia-bruta', createdAt: now.toISOString(), origin, entries };
}

export function rawCopyFileName(copy: RawLocalCopy): string {
  return `conselho-copia-bruta-${copy.createdAt.replace(/[:.]/g, '-')}.json`;
}

/**
 * Empties this browser's storage for the app. Throws when something is left, so the
 * screen never claims a repair that did not happen.
 */
export function clearThisDevice(local: StorageLike, session: StorageLike): void {
  local.clear();
  session.clear();
  if (local.length !== 0 || session.length !== 0) throw new Error('device-not-cleared');
}
