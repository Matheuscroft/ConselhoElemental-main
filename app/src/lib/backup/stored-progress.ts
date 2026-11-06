import { version } from '../../../package.json';
import { BACKUP_FORMAT, MAX_BACKUP_BYTES, STORE_KEYS, validateProgressSnapshot, type ProgressSnapshot } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';
import type { StoredProgress } from './restore-journal';

/** Validate actual bytes without normalizing, hydrating stores or inferring rewards.
 * Both absent is a fresh origin. Half a pair is not a restorable baseline.
 */
export function validateStoredProgress(pair: StoredProgress, origin: string): ProgressSnapshot | null {
  if (!origin) throw new Error('Origem ausente.');
  if (pair.core === null && pair.fitness === null) return null;
  if (pair.core === null || pair.fitness === null) throw new Error('Uma das partes do progresso está ausente. A recuperação precisa de revisão.');
  const parse = (raw: string) => {
    if (new TextEncoder().encode(raw).byteLength > MAX_BACKUP_BYTES) throw new Error('Parte do progresso excede o limite de tamanho.');
    let envelope: unknown;
    try { envelope = JSON.parse(raw); }
    catch { throw new Error('Não foi possível ler uma das partes do progresso salvo. Guarde a cópia original e solicite uma revisão.'); }
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)
      || Object.keys(envelope).length !== 2 || !Object.hasOwn(envelope, 'state') || !Object.hasOwn(envelope, 'version')) throw new Error('Envelope de progresso incompatível.');
    return envelope as { state: Record<string, unknown>; version: number };
  };
  const core = parse(pair.core), fitness = parse(pair.fitness);
  const snapshot = {
    format: BACKUP_FORMAT, schemaVersion: 1, appVersion: version,
    createdAt: new Date().toISOString(),
    source: { origin, accountId: core.state?.currentAccountId },
    stores: { core: { key: STORE_KEYS.core, ...core }, fitness: { key: STORE_KEYS.fitness, ...fitness } },
  };
  validateProgressSnapshot(snapshot);
  if (auditCriticalProgress(snapshot).issues.length) throw new Error('O progresso armazenado contém dados que precisam de revisão. Nenhum dado foi alterado.');
  return snapshot;
}
