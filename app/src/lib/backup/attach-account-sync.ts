import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { ACCOUNT_BINDING_KEY } from './account-binding';
import { ACCOUNT_INTENT_KEY } from './account-intent';
import { STORE_KEYS } from './progress-backup';
import { LOCAL_PROGRESS_MODE_KEY } from './progress-mode';
import { RESTORE_JOURNAL_KEY } from './restore-journal';
import type { LiveAccountSync } from './account-live-sync';

/** Each save sends the whole archive and the server rechecks it, so changes are batched: one save per quiet 20 s, never one per edit. */
const SAVE_DELAY_MS = 20_000;

/** Loaded only after the exclusive pre-bootstrap handoff has accepted the document. */
export function attachAccountSync(sync: LiveAccountSync, surface: Window = window) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const clear = () => { if (timer !== undefined) { clearTimeout(timer); timer = undefined; } };
  const schedule = () => {
    if (disposed || ['pending','blocked','stopped'].includes(sync.getSnapshot().status)) return;
    clear(); timer = setTimeout(() => { timer = undefined; void sync.flush(); },SAVE_DELAY_MS);
  };
  const uncore = useAppStore.subscribe((next, before) => {
    // Runtime ticks are excluded from the archive: do not debounce/recheck the
    // whole account every second while a user is concentrating.
    if (Object.entries(next).some(([key, value]) => key !== 'timer' && value !== before[key as keyof typeof before])) schedule();
  }), unfitness = useWorkoutStore.subscribe(schedule);
  const unstatus = sync.subscribe(() => {
    const status = sync.getSnapshot().status;
    if (['pending','blocked','stopped'].includes(status)) clear();
    else if (status === 'idle') schedule();
  });
  const external = (event: StorageEvent) => {
    if (event.key === null || [STORE_KEYS.core,STORE_KEYS.fitness,ACCOUNT_BINDING_KEY,ACCOUNT_INTENT_KEY,ACCOUNT_RESOLUTION_KEY,LOCAL_PROGRESS_MODE_KEY,RESTORE_JOURNAL_KEY].includes(event.key)) {
      clear(); sync.invalidate();
    }
  };
  // Coming back to the app is not a reason to hit the server at once: it joins the same quiet window.
  const focus = () => { schedule(); };
  const visibility = () => { if (surface.document.visibilityState === 'visible') focus(); };
  const pagehide = () => { dispose(); };
  surface.addEventListener('storage',external); surface.addEventListener('focus',focus); surface.addEventListener('online',focus); surface.addEventListener('pagehide',pagehide);
  surface.document.addEventListener('visibilitychange',visibility);
  // Store persist wrappers may notify before writing; the debounce reads only later.
  schedule();
  function dispose() {
    if (disposed) return; disposed = true; clear(); uncore(); unfitness(); unstatus();
    surface.removeEventListener('storage',external); surface.removeEventListener('focus',focus); surface.removeEventListener('online',focus); surface.removeEventListener('pagehide',pagehide);
    surface.document.removeEventListener('visibilitychange',visibility); sync.stop();
  }
  return dispose;
}
