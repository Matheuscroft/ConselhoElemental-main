import { accountDigest, accountBaselineDigest } from './account-intent';
import type { AccountCommitReceipt, createAccountTransport } from './account-transport';
import { inspectProgressBackup } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';

/** A receipt reference, not an authentication session or a second domain store. */
export const ACCOUNT_BINDING_KEY = 'conselho-elemental-account-binding-v1';
export interface AccountBinding extends AccountCommitReceipt {
  format: 'conselho-elemental-account-binding';
  version: 1;
  origin: string;
  baselineDigest: string;
}
const uuid = (s: unknown): s is string => typeof s === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s);
const hash = (s: unknown): s is string => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
function invalid(): never { throw new Error('O vínculo da conta precisa de revisão. Preserve os dados deste navegador.'); }
export async function inspectAccountBinding(raw: string, origin: string): Promise<Readonly<AccountBinding>> {
  if (raw.length > 4096) invalid();
  let envelope: unknown;
  try { envelope = JSON.parse(raw); } catch { return invalid(); }
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) invalid();
  const e = envelope as Record<string, unknown>;
  if (Object.keys(e).length !== 2 || typeof e.payload !== 'string' || !hash(e.checksum) || await accountDigest(e.payload) !== e.checksum) invalid();
  let value: unknown;
  try { value = JSON.parse(e.payload); } catch { return invalid(); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const v = value as Record<string, unknown>;
  const fields = ['format','version','origin','userId','operationId','revision','expectedRevision','archiveSha256','createdAt','baselineDigest'];
  if (Object.keys(v).length !== fields.length || fields.some(k => !Object.hasOwn(v,k))
    || v.format !== 'conselho-elemental-account-binding' || v.version !== 1 || !origin || v.origin !== origin
    || !uuid(v.userId) || !uuid(v.operationId) || !uuid(v.revision) || (v.expectedRevision !== 'empty' && v.expectedRevision !== 'legacy' && !uuid(v.expectedRevision))
    || !hash(v.archiveSha256) || !hash(v.baselineDigest) || typeof v.createdAt !== 'string' || !Number.isFinite(Date.parse(v.createdAt))) invalid();
  return Object.freeze(v as unknown as AccountBinding);
}
export async function sealAccountBinding(value: AccountBinding): Promise<string> {
  const payload = JSON.stringify(value);
  const raw = JSON.stringify({ payload, checksum: await accountDigest(payload) });
  await inspectAccountBinding(raw,value.origin);
  return raw;
}
/** No writes, hydration or implicit rebase. A changed remote revision is a conflict. */
export async function reviewAccountBinding(raw: string, origin: string, transport: ReturnType<typeof createAccountTransport>, storage: Pick<Storage,'getItem'>) {
  const binding = await inspectAccountBinding(raw,origin);
  const identity = await transport.verifyIdentity();
  if (identity.userId !== binding.userId) invalid();
  const remote = await transport.readProgress(binding.userId);
  if (!remote || typeof remote !== 'object' || !('archive' in remote) || typeof remote.archive !== 'string'
    || !('revision' in remote) || remote.revision !== binding.revision || await accountDigest(remote.archive) !== binding.archiveSha256) {
    throw new Error('O progresso online mudou ou não corresponde ao vínculo salvo. Preserve as duas versões antes de continuar.');
  }
  const { backup } = await inspectProgressBackup(remote.archive);
  const audit = auditCriticalProgress(backup);
  if (audit.issues.length || audit.truncated) invalid();
  const command = await transport.prepare({ archive:remote.archive, expectedRevision:binding.expectedRevision, operationId:binding.operationId, allProfilesConfirmed:true });
  const confirmed = await transport.confirm(command);
  if (confirmed.receipt.revision !== binding.revision) invalid();
  return { binding, localChanged:await accountBaselineDigest(storage) !== binding.baselineDigest };
}
