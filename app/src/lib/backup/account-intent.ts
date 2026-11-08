import { encodeRestoreJournalPayload, decodeRestoreJournalPayload } from './restore-journal-codec';
import { inspectProgressBackup, STORE_KEYS } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';
import { validateLocalProgressMode } from './progress-mode';

export const ACCOUNT_INTENT_KEY = 'conselho-elemental-account-intent-v1';
export interface AccountIntent {
  format: 'conselho-elemental-account-intent'; version: 1; phase: 'pending' | 'paused';
  origin: string; userId: string; operationId: string; expectedRevision: string;
  archive: string; archiveSha256: string; baselineDigest: string; localMode: string | null;
}
const uuid = (s: unknown): s is string => typeof s === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s);
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function invalid(): never { throw new Error('A tentativa de envio precisa de revisão. Preserve os dados deste navegador.'); }
export async function accountDigest(text: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join('');
}
export async function accountBaselineDigest(storage: Pick<Storage, 'getItem'>): Promise<string> {
  return accountDigest(JSON.stringify({ core: storage.getItem(STORE_KEYS.core), fitness: storage.getItem(STORE_KEYS.fitness) }));
}
function parse(text: string): unknown { try { return JSON.parse(text); } catch { return invalid(); } }
export async function inspectAccountIntent(raw: string, origin: string): Promise<AccountIntent> {
  if (new TextEncoder().encode(raw).byteLength > 100 * 1024 * 1024) invalid();
  const envelope = parse(raw);
  if (!object(envelope) || Object.keys(envelope).length !== 2 || typeof envelope.payload !== 'string' || typeof envelope.checksum !== 'string') invalid();
  if (await accountDigest(envelope.payload) !== envelope.checksum) invalid();
  const v = parse(await decodeRestoreJournalPayload(envelope.payload));
  const fields = ['format','version','phase','origin','userId','operationId','expectedRevision','archive','archiveSha256','baselineDigest','localMode'];
  if (!object(v) || Object.keys(v).length !== fields.length || fields.some(k => !Object.hasOwn(v,k))
    || v.format !== 'conselho-elemental-account-intent' || v.version !== 1 || (v.phase !== 'pending' && v.phase !== 'paused')
    || !origin || v.origin !== origin || !uuid(v.userId) || !uuid(v.operationId) || (v.expectedRevision !== 'empty' && !uuid(v.expectedRevision))
    || typeof v.archive !== 'string' || typeof v.archiveSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(v.archiveSha256)
    || typeof v.baselineDigest !== 'string' || !/^[a-f0-9]{64}$/.test(v.baselineDigest)
    || (v.localMode !== null && typeof v.localMode !== 'string')) invalid();
  validateLocalProgressMode(v.localMode, origin);
  const { backup } = await inspectProgressBackup(v.archive);
  const audit = auditCriticalProgress(backup);
  if (audit.issues.length || audit.truncated || backup.source.origin !== origin || await accountDigest(v.archive) !== v.archiveSha256) invalid();
  return Object.freeze(v as unknown as AccountIntent);
}
export async function sealAccountIntent(value: AccountIntent): Promise<string> {
  const payload = await encodeRestoreJournalPayload(JSON.stringify(value)), raw = JSON.stringify({ payload, checksum: await accountDigest(payload) });
  await inspectAccountIntent(raw, value.origin); return raw;
}
