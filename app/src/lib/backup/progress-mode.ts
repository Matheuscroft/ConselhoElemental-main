/** Operational metadata only; no activities, credentials or reward balances. */
export const LOCAL_PROGRESS_MODE_KEY = 'conselho-elemental-local-progress-mode-v1';
let localDocument = false;
let liveAccountDocument = false;
export function markLiveAccountDocument(): void { liveAccountDocument = true; }
export function isLiveAccountDocument(): boolean { return liveAccountDocument; }
/** Selected only by pre-bootstrap validation; cannot be undone in this document. */
export function isolateRestoredLocalDocument(): void { localDocument = true; }
export function isRestoredLocalDocument(): boolean { return localDocument; }
export function localProgressMode(origin: string): string {
  if (!origin) throw new Error('Origem ausente.');
  return JSON.stringify({ format: 'conselho-elemental-local-progress', version: 1, origin });
}
export function validateLocalProgressMode(raw: string | null, origin: string): boolean {
  if (raw === null) return false;
  if (raw.length > 4096) throw new Error('Modo local salvo incompatível.');
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('O modo local salvo precisa de revisão. Não limpe os dados do navegador.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== 3 || !Object.hasOwn(value, 'format') || !Object.hasOwn(value, 'version') || !Object.hasOwn(value, 'origin')) throw new Error('Modo local salvo incompatível.');
  const record = value as Record<string, unknown>;
  if (record.format !== 'conselho-elemental-local-progress' || record.version !== 1 || record.origin !== origin || !origin) throw new Error('Modo local salvo incompatível com esta origem.');
  return true;
}
