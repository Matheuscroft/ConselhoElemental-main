import type { ProgressSnapshot } from '@/lib/backup/progress-backup';
import { STORE_KEYS } from '@/lib/backup/progress-backup';
import { ACCOUNT_BINDING_KEY } from '@/lib/backup/account-binding';
import { ACCOUNT_INTENT_KEY } from '@/lib/backup/account-intent';
import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { LOCAL_PROGRESS_MODE_KEY, validateLocalProgressMode } from '@/lib/backup/progress-mode';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { progressFingerprint } from '@/lib/backup/restore-comparison';
import { validateStoredProgress } from '@/lib/backup/stored-progress';
import { buildTemporalCommitments, buildTemporalEvents, type TemporalSnapshot } from '@/lib/temporal/selectors';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';
import { reminderKey, type ReminderAction } from './occurrence-reminder';
import { readProfileReminders } from './profile-reminder-codec';
import { cancelReminderHandoff, REMINDER_HANDOFF_KEY, stageReminderHandoff } from './reminder-handoff';
import { planReminderWrite } from './reminder-write-plan';
import { REMINDER_WRITES_RELEASED } from './reminder-release';
import { reminderWorkspaceHref } from './reminder-return';

export type ActivityReminderIdentity = { sourceType: 'task' | 'habit' | 'commitment'; sourceId: string; day: string };
export interface ReminderPreparationContext {
  storage: Pick<Storage, 'getItem'>;
  session: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  origin: string;
  readProgress: () => ProgressSnapshot;
  localDocument: boolean;
  liveAccountDocument: boolean;
  isCurrent?: () => boolean;
}
export type ActivityReminderDraft = { kind: 'configure'; time: string } | { kind: 'command'; action: ReminderAction };
function changed(): never { throw new Error('A atividade ou o progresso mudou. Confira o aviso novamente; seu preenchimento foi preservado.'); }
function assertAvailable(ctx: ReminderPreparationContext) {
  if (!REMINDER_WRITES_RELEASED) throw new Error('A edição de avisos ainda não foi liberada.');
  if (ctx.isCurrent?.() === false) changed();
  if (!ctx.localDocument || ctx.liveAccountDocument) throw new Error('A edição de avisos está disponível apenas em uma sessão já configurada para uso local. Nenhuma preferência de sincronização foi alterada.');
  if ([ACCOUNT_BINDING_KEY, ACCOUNT_INTENT_KEY, ACCOUNT_RESOLUTION_KEY].some(key => ctx.storage.getItem(key) !== null)) throw new Error('Há um vínculo ou uma conferência de conta. A edição de avisos para progresso conectado ainda não está disponível.');
  if (ctx.storage.getItem(RESTORE_JOURNAL_KEY) !== null) throw new Error('Confira a recuperação pendente antes de preparar outro aviso.');
  const mode = ctx.storage.getItem(LOCAL_PROGRESS_MODE_KEY);
  if (!validateLocalProgressMode(mode, ctx.origin)) throw new Error('Este progresso não está configurado para uso somente local.');
  if (ctx.session.getItem(REMINDER_HANDOFF_KEY) !== null) throw new Error('Há uma alteração de aviso pendente nesta aba. Abra a conferência antes de preparar outra.');
  return mode;
}

/** Read the current persisted pair AND the existing live persist projections. No domain writes. */
export function reviewActivityReminder(input: ReminderPreparationContext, identity: ActivityReminderIdentity) {
  const ctx = { ...input }, mode = assertAvailable(ctx);
  const ref = { ...identity };
  if (!['task', 'habit', 'commitment'].includes(ref.sourceType)) throw new Error('Esta origem ainda não aceita avisos.');
  const key = reminderKey(ref), day = dateFromInput(ref.day)!;
  const before = { core: ctx.storage.getItem(STORE_KEYS.core), fitness: ctx.storage.getItem(STORE_KEYS.fitness) };
  const saved = validateStoredProgress(before, ctx.origin);
  if (!saved || progressFingerprint(saved) !== progressFingerprint(ctx.readProgress())) throw new Error('O progresso carregado e o salvo precisam coincidir antes de sair desta página. Aguarde e confira novamente.');
  const snapshot = saved.stores.core.state as unknown as TemporalSnapshot;
  const done = buildTemporalEvents(snapshot).some(event => event.sourceType === ref.sourceType && event.sourceId === ref.sourceId && dateToInput(event.occurredAt) === ref.day);
  const source = buildTemporalCommitments(snapshot, day, day).find(item => item.sourceType === ref.sourceType && item.sourceId === ref.sourceId);
  if (done || !source) throw new Error('Esta ocorrência não está disponível ou já foi concluída.');
  const metadata = readProfileReminders((saved.stores.core.state.user as Record<string, unknown>).reminderState);
  return { identity: ref, before, mode, accountId: saved.stores.core.state.currentAccountId as string | null,
    userId: (saved.stores.core.state.user as {id: string}).id, revision: metadata.revision,
    existing: metadata.items.find(item => item.key === key) ?? null, title: source.title };
}
export type ActivityReminderReview = ReturnType<typeof reviewActivityReminder>;

/** Stages only tab transport, then authorizes navigation AFTER readback and fresh live checks. */
export async function prepareActivityReminder(input: ReminderPreparationContext, expected: ActivityReminderReview, draft: ActivityReminderDraft, returnTo: string, confirmed: boolean) {
  if (confirmed !== true) throw new Error('Confirme a abertura da conferência antes de sair da atividade.');
  const ctx = { ...input };
  const selected = JSON.parse(JSON.stringify(expected)) as ActivityReminderReview;
  const request = { ...draft };
  const fresh = reviewActivityReminder(ctx, selected.identity);
  if (JSON.stringify(selected) !== JSON.stringify(fresh)) changed();
  if (request.kind === 'configure' ? !!fresh.existing : !fresh.existing || fresh.existing.status === 'dismissed') throw new Error('O estado do aviso mudou. Confira novamente antes de continuar.');
  const mutation = request.kind === 'configure'
    ? { kind: 'configure' as const, ...fresh.identity, time: request.time }
    : { kind: 'command' as const, key: fresh.existing!.key, command: { id: crypto.randomUUID(), expectedRevision: fresh.existing!.revision, action: request.action, at: new Date().toISOString() } };
  const plan = planReminderWrite(fresh.before, ctx.origin, fresh.accountId, fresh.userId, fresh.revision, mutation);
  const href = reminderWorkspaceHref(returnTo);
  let raw: string;
  try { raw = await stageReminderHandoff(ctx.session, ctx.origin, plan); }
  catch { throw new Error('Não foi possível confirmar o plano nesta aba. Seu preenchimento foi preservado. Confira se há uma alteração pendente antes de tentar novamente.'); }
  try {
    // Session now contains OUR plan. Other availability checks must still hold.
    const ownSession = { setItem: (key: string, value: string) => ctx.session.setItem(key, value), removeItem: (key: string) => ctx.session.removeItem(key), getItem: (key: string) => key === REMINDER_HANDOFF_KEY && ctx.session.getItem(key) === raw ? null : ctx.session.getItem(key) };
    const current = reviewActivityReminder({ ...ctx, session: ownSession }, selected.identity);
    if (JSON.stringify(current) !== JSON.stringify(fresh) || ctx.session.getItem(REMINDER_HANDOFF_KEY) !== raw) changed();
  } catch (error) {
    try { await cancelReminderHandoff(ctx.session, ctx.storage, ctx.origin, raw); }
    catch { throw new Error('A alteração da aba permanece pendente. Preserve os dados e abra a conferência antes de continuar.'); }
    throw error;
  }
  return href;
}
