import { captureProgress } from '@/lib/backup/capture-progress';
import { isLiveAccountDocument, isRestoredLocalDocument } from '@/lib/backup/progress-mode';
import { prepareActivityReminder, reviewActivityReminder, type ReminderPreparationContext, type ActivityReminderIdentity, type ActivityReminderReview, type ActivityReminderDraft } from './reminder-preparation';

/** Imported on interaction, after the normal App is already hydrated. No new store or sync. */
function context(isCurrent?: () => boolean): ReminderPreparationContext {
  return { storage: window.localStorage, session: window.sessionStorage, origin: window.location.origin,
    readProgress: () => captureProgress(window.location.origin), localDocument: isRestoredLocalDocument(), liveAccountDocument: isLiveAccountDocument(), isCurrent };
}
export function reviewLiveActivityReminder(identity: ActivityReminderIdentity, isCurrent: () => boolean) {
  return reviewActivityReminder(context(isCurrent), identity);
}
export function prepareLiveActivityReminder(review: ActivityReminderReview, draft: ActivityReminderDraft, returnTo: string, confirmed: boolean, isCurrent: () => boolean) {
  return prepareActivityReminder(context(isCurrent), review, draft, returnTo, confirmed);
}
