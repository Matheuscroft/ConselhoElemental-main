import { lazy, Suspense } from 'react';
import type { TemporalCommitment } from '@/lib/temporal/selectors';
import { dateToInput } from '@/lib/temporal/recurrence';
import { REMINDER_WRITES_RELEASED } from '@/lib/reminders/reminder-release';
const ActivityReminderControl = lazy(() => import('./ActivityReminderControl'));

/** No store capture or code for preparing writes is loaded while release is closed. */
export function TemporalReminderControl({ item, returnTo }: { item: TemporalCommitment; returnTo: string }) {
  if (!REMINDER_WRITES_RELEASED || (item.sourceType !== 'task' && item.sourceType !== 'habit' && item.sourceType !== 'commitment')) return null;
  const identity = { sourceType: item.sourceType, sourceId: item.sourceId, day: dateToInput(item.date) };
  return <Suspense fallback={<p role="status">Carregando controle do aviso…</p>}><ActivityReminderControl key={JSON.stringify(identity)} identity={identity} returnTo={returnTo} /></Suspense>;
}
