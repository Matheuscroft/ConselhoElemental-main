/** Authentication metadata only. Never part of a progress archive. */
export const ACCOUNT_TAB_ACCESS_KEY = 'conselho-elemental-tab-access-v1';
export function hasAccountTabAccess(storage: Pick<Storage,'getItem'>): boolean {
  // Even malformed/expired metadata must go through the isolated entry.
  return storage.getItem(ACCOUNT_TAB_ACCESS_KEY) !== null;
}
