import type { ReminderWritePlan } from './reminder-write-plan';
import { readProfileReminders } from './profile-reminder-codec';
import { MAX_BACKUP_BYTES, STORE_KEYS } from '@/lib/backup/progress-backup';
import { RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { validateStoredProgress } from '@/lib/backup/stored-progress';
import { progressFingerprint } from '@/lib/backup/restore-comparison';
import { LOCAL_PROGRESS_MODE_KEY, validateLocalProgressMode } from '@/lib/backup/progress-mode';

import { REMINDER_HANDOFF_KEY } from './reminder-handoff-key';
export { REMINDER_HANDOFF_KEY } from './reminder-handoff-key';
type Session = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type ReadStorage = Pick<Storage, 'getItem'>;
interface Handoff { format: 'conselho-elemental-reminder-handoff'; schema: 1; id: string; origin: string; plan: ReminderWritePlan }
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const exact = (v: Record<string, unknown>, names: string[]) => Object.keys(v).length === names.length && names.every(n => Object.hasOwn(v,n));
const checkSize = (text: string) => { if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES * 3) throw new Error('O plano é grande demais para o transporte temporário. Preserve seu progresso.'); };
function fail(): never { throw new Error('O plano temporário precisa de revisão. Nenhum progresso foi alterado.'); }
async function digest(text: string) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join(''); }

function validatePlan(plan: unknown, origin: string): asserts plan is ReminderWritePlan {
  if (!record(plan) || !exact(plan, ['before','accountId','userId','expectedRevision','target']) || !record(plan.before) || !exact(plan.before,['core','fitness'])) fail();
  const snapshot = validateStoredProgress(plan.before as ReminderWritePlan['before'],origin);
  if (!snapshot) fail();
  const user = snapshot.stores.core.state.user as Record<string,unknown>;
  const before = readProfileReminders(user.reminderState), target = readProfileReminders(plan.target);
  if (plan.accountId !== snapshot.stores.core.state.currentAccountId || plan.userId !== user.id || plan.expectedRevision !== before.revision || target.revision !== before.revision + 1) fail();
}

async function inspect(raw: string, origin: string): Promise<Handoff> {
  checkSize(raw);
  let envelope: unknown; try { envelope=JSON.parse(raw); } catch { return fail(); }
  if (!record(envelope) || !exact(envelope,['payload','checksum']) || typeof envelope.payload !== 'string' || typeof envelope.checksum !== 'string' || await digest(envelope.payload) !== envelope.checksum) fail();
  let payload: unknown; try { payload=JSON.parse(envelope.payload); } catch { return fail(); }
  if (!record(payload) || !exact(payload,['format','schema','id','origin','plan']) || payload.format!=='conselho-elemental-reminder-handoff' || payload.schema!==1 || payload.origin!==origin || !origin || typeof payload.id!=='string' || !/^[a-f0-9-]{36}$/i.test(payload.id)) fail();
  validatePlan(payload.plan,origin);
  return payload as unknown as Handoff;
}

/** No navigation until this promise resolves after verified session readback. */
export async function stageReminderHandoff(session: Session, origin: string, input: ReminderWritePlan): Promise<string> {
  if (session.getItem(REMINDER_HANDOFF_KEY)!==null) throw new Error('Já existe uma passagem de aviso pendente nesta aba.');
  const plan: unknown=JSON.parse(JSON.stringify(input)); validatePlan(plan,origin);
  const payload=JSON.stringify({format:'conselho-elemental-reminder-handoff',schema:1,id:crypto.randomUUID(),origin,plan} satisfies Handoff);
  const raw=JSON.stringify({payload,checksum:await digest(payload)}); checkSize(raw);
  if (session.getItem(REMINDER_HANDOFF_KEY)!==null) throw new Error('O plano da aba mudou durante a preparação.');
  session.setItem(REMINDER_HANDOFF_KEY,raw);
  if (session.getItem(REMINDER_HANDOFF_KEY)!==raw) throw new Error('Não foi possível confirmar o plano nesta aba. Não saia da página.');
  return raw;
}

export async function reviewReminderHandoff(session: Pick<Session,'getItem'>, progress: ReadStorage, origin: string) {
  const raw=session.getItem(REMINDER_HANDOFF_KEY); if(raw===null)return null;
  const payload=await inspect(raw,origin);
  if(session.getItem(REMINDER_HANDOFF_KEY)!==raw)fail();
  const journal=progress.getItem(RESTORE_JOURNAL_KEY);
  const pair={core:progress.getItem(STORE_KEYS.core),fitness:progress.getItem(STORE_KEYS.fitness)};
  const mode=progress.getItem(LOCAL_PROGRESS_MODE_KEY);
  let status: 'prepared'|'pending-recovery'|'committed'|'changed';
  if(journal!==null) status='pending-recovery';
  else {
    const current=validateStoredProgress(pair,origin);
    const expected=validateStoredProgress(payload.plan.before,origin)!;
    (expected.stores.core.state.user as Record<string,unknown>).reminderState=payload.plan.target;
    if(current && progressFingerprint(current)===progressFingerprint(expected)) status='committed';
    else status=pair.core===payload.plan.before.core && pair.fitness===payload.plan.before.fitness ? 'prepared':'changed';
  }
  if(session.getItem(REMINDER_HANDOFF_KEY)!==raw)fail();
  return {raw,id:payload.id,status,plan:payload.plan,baseline:{pair,journal,mode}};
}


function assertFresh(progress: ReadStorage, baseline: {pair:{core:string|null;fitness:string|null};journal:string|null;mode:string|null}) {
  if(progress.getItem(STORE_KEYS.core)!==baseline.pair.core || progress.getItem(STORE_KEYS.fitness)!==baseline.pair.fitness || progress.getItem(RESTORE_JOURNAL_KEY)!==baseline.journal || progress.getItem(LOCAL_PROGRESS_MODE_KEY)!==baseline.mode)fail();
}

/** Clears a pending plan only. Existing journal/target can never be cancelled here. */
export async function cancelReminderHandoff(session: Session, progress: ReadStorage, origin: string, expectedRaw: string): Promise<void> {
  const review=await reviewReminderHandoff(session,progress,origin);
  if(!review || review.raw!==expectedRaw || !['prepared','changed'].includes(review.status)) throw new Error('Conclua a conferência da recuperação antes de cancelar.');
  if(progress.getItem(RESTORE_JOURNAL_KEY)!==null || session.getItem(REMINDER_HANDOFF_KEY)!==expectedRaw)fail();
  assertFresh(progress,review.baseline);
  session.removeItem(REMINDER_HANDOFF_KEY);
  if(session.getItem(REMINDER_HANDOFF_KEY)!==null)throw new Error('O cancelamento não foi confirmado nesta aba.');
}

/** After the existing explicit local handoff: verify target and marker, then clear only transport. */
export async function finishReminderHandoff(session: Session, progress: ReadStorage, origin: string, expectedRaw: string, confirmed: boolean): Promise<void> {
  if(confirmed!==true)throw new Error('Confirme o retorno ao progresso somente local.');
  const review=await reviewReminderHandoff(session,progress,origin);
  if(!review || review.raw!==expectedRaw || review.status!=='committed' || !validateLocalProgressMode(progress.getItem(LOCAL_PROGRESS_MODE_KEY),origin))fail();
  if(progress.getItem(RESTORE_JOURNAL_KEY)!==null || session.getItem(REMINDER_HANDOFF_KEY)!==expectedRaw)fail();
  assertFresh(progress,review.baseline);
  session.removeItem(REMINDER_HANDOFF_KEY);
  if(session.getItem(REMINDER_HANDOFF_KEY)!==null)throw new Error('O retorno não foi confirmado nesta aba.');
}

/** Read a particular tab plan, not whichever plan happens to be current after an await. */
export async function readStagedReminderPlan(session: Pick<Session,'getItem'>, origin: string, expectedRaw: string): Promise<ReminderWritePlan> {
  if(session.getItem(REMINDER_HANDOFF_KEY)!==expectedRaw)fail();
  const payload=await inspect(expectedRaw,origin);
  if(session.getItem(REMINDER_HANDOFF_KEY)!==expectedRaw)fail();
  return payload.plan;
}
