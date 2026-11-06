import { createProgressBackup, inspectProgressBackup, type BackupSummary, type ProgressSnapshot } from './progress-backup';
import { progressFingerprint, compareProgressBackup, type RestoreComparison } from './restore-comparison';
import { auditCriticalProgress } from './critical-progress';

export interface LocalAssociationContext {
  origin: string;
  readLocal: () => ProgressSnapshot;
  isCurrent: () => boolean;
  signal?: AbortSignal;
}
export interface LocalAssociationReview {
  readonly profileName: string;
  readonly profileId: string | null;
  readonly summary: Readonly<BackupSummary>;
  readonly xp: readonly Readonly<{ element: string; amount: number }>[];
  readonly associationAllowed: false;
}
interface BoundReview { archive: string; fingerprint: string; origin: string; profileId: string | null; fields: { core: string[]; fitness: string[] } }
// Ephemeral review only: no new persisted state, binding or authorization claim.
const boundReviews = new WeakMap<LocalAssociationReview, BoundReview>();
function active(context: LocalAssociationContext): void {
  if (context.signal?.aborted || !context.isCurrent()) throw new Error('Conferência cancelada ou desatualizada. Confira novamente.');
}
function current(context: LocalAssociationContext, expected: Pick<BoundReview, 'origin' | 'profileId' | 'fingerprint'>): void {
  active(context);
  const snapshot = context.readLocal();
  if (context.origin !== expected.origin || snapshot.source.origin !== expected.origin
    || snapshot.source.accountId !== expected.profileId || progressFingerprint(snapshot) !== expected.fingerprint) {
    throw new Error('O progresso ou perfil mudou. Refaça a conferência antes de continuar.');
  }
}
export function assertLocalAssociationReviewCurrent(review: LocalAssociationReview, context: LocalAssociationContext): void {
  const bound = boundReviews.get(review);
  if (!bound) throw new Error('Prepare uma nova conferência neste navegador.');
  current(context, bound);
}
/** No session/client reads or writes. Snapshot serialization starts before awaits. */
export async function prepareLocalAssociationReview(input: LocalAssociationContext): Promise<LocalAssociationReview> {
  const context = { ...input }; active(context);
  const snapshot = context.readLocal();
  if (!context.origin || snapshot.source.origin !== context.origin) throw new Error('A origem do progresso precisa de revisão.');
  const baseline = { origin: context.origin, profileId: snapshot.source.accountId, fingerprint: progressFingerprint(snapshot) };
  const archive = await createProgressBackup(snapshot);
  active(context);
  const { backup, summary } = await inspectProgressBackup(archive);
  const audit = auditCriticalProgress(backup);
  if (audit.issues.length || audit.truncated) throw new Error('O progresso contém registros que precisam de revisão. Guarde sua cópia antes de associar uma conta.');
  current(context, baseline);
  const user = backup.stores.core.state.user as Record<string, unknown>;
  const xp = [['xp_earth', 'Terra'], ['xp_fire', 'Fogo'], ['xp_water', 'Água'], ['xp_air', 'Ar']].map(([key, element]) => Object.freeze({ element, amount: user[key] as number }));
  const review: LocalAssociationReview = Object.freeze({
    profileName: typeof user.name === 'string' && user.name.trim() ? user.name : 'Perfil local',
    profileId: baseline.profileId, summary: Object.freeze({ ...summary }), xp: Object.freeze(xp), associationAllowed: false,
  });
  boundReviews.set(review, { ...baseline, archive, fields: { core: Object.keys(backup.stores.core.state), fitness: Object.keys(backup.stores.fitness.state) } });
  return review;
}

/** Contract for a FUTURE trusted, read-only backend adapter. No adapter/SDK is
 * installed here. Identity validation and RLS remain server responsibilities.
 * These methods receive no local archive, activities, balance or credentials.
 */
export type AssociationReadResponse = {
  complete: true;
  userId: string;
  revision: string;
  coverage: { core: readonly string[]; fitness: readonly string[] };
} & ({ kind: 'empty'; archive: null } | { kind: 'snapshot'; archive: string });
export interface AssociationReader {
  verifyIdentity: (signal?: AbortSignal) => Promise<{ userId: string }>;
  readProgress: (userId: string, signal?: AbortSignal) => Promise<unknown>;
}
export interface RemoteAssociationContext extends LocalAssociationContext {
  expectedUserId: string;
  currentUserId: () => string | null;
}
export interface RemoteAssociationReview {
  readonly userId: string;
  readonly revision: string;
  readonly remoteSummary: BackupSummary | null;
  readonly comparison: RestoreComparison | null;
  readonly associationAllowed: false;
}
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
/** Compare only. Even complete results NEVER authorize upload, merge or removing
 * local isolation. A commit/reconciliation protocol is a separate backend stage.
 */
export async function prepareRemoteAssociationReview(local: LocalAssociationReview, input: RemoteAssociationContext, inputReader: AssociationReader): Promise<RemoteAssociationReview> {
  const context = { ...input }, reader = { ...inputReader }, bound = boundReviews.get(local);
  if (!bound) throw new Error('Prepare uma nova conferência local antes de consultar a conta.');
  const check = () => {
    current(context, bound);
    if (!context.expectedUserId || context.currentUserId() !== context.expectedUserId) throw new Error('A conta de acesso mudou. Refaça a conferência.');
  };
  check();
  let identity: { userId: string };
  try { identity = await reader.verifyIdentity(context.signal); }
  catch { check(); throw new Error('Não foi possível confirmar a conta. Seu progresso continua local.'); }
  check();
  if (!identity || identity.userId !== context.expectedUserId) throw new Error('A identidade da conta não corresponde à conferência.');
  let response: unknown;
  try { response = await reader.readProgress(identity.userId, context.signal); }
  catch { check(); throw new Error('Não foi possível ler todo o progresso online. Uma falha não significa conta vazia.'); }
  check();
  if (!object(response) || response.complete !== true || response.userId !== context.expectedUserId
    || typeof response.revision !== 'string' || !response.revision.trim() || response.revision.length > 512
    || !object(response.coverage)) throw new Error('A leitura online está incompleta ou incompatível. A associação continua indisponível.');
  for (const part of ['core', 'fitness'] as const) {
    const keys = response.coverage[part];
    if (!Array.isArray(keys) || keys.some(key => typeof key !== 'string') || new Set(keys).size !== keys.length
      || keys.length !== bound.fields[part].length || bound.fields[part].some(key => !keys.includes(key))) {
      throw new Error('A leitura online ainda não cobre todo o progresso local, incluindo personagem e Treinos.');
    }
  }
  const { kind, archive, revision } = response;
  let remoteSummary: BackupSummary | null = null, comparison: RestoreComparison | null = null;
  if (kind === 'snapshot' && typeof archive === 'string') {
    const { backup, summary } = await inspectProgressBackup(archive);
    check();
    const audit = auditCriticalProgress(backup);
    if (audit.issues.length || audit.truncated) throw new Error('O progresso online precisa de revisão antes da associação.');
    const { backup: localBackup } = await inspectProgressBackup(bound.archive);
    // Comparison accepts a snapshot, not its signed archive envelope.
    const localSnapshot: ProgressSnapshot = {
      format: localBackup.format, schemaVersion: localBackup.schemaVersion,
      appVersion: localBackup.appVersion, createdAt: localBackup.createdAt,
      source: localBackup.source, stores: localBackup.stores,
    };
    comparison = await compareProgressBackup(archive, localSnapshot);
    check(); remoteSummary = summary;
  } else if (kind !== 'empty' || archive !== null) throw new Error('A conta online não foi confirmada como vazia.');
  check();
  return Object.freeze({ userId: context.expectedUserId, revision, remoteSummary, comparison, associationAllowed: false });
}
