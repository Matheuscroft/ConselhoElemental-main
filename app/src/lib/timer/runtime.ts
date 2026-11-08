import type { Habit, TimerState } from '@/types';
import type { useAppStore } from '@/stores/appStore';
import { elapsedTimerSeconds } from './clock';
import { dailyDateKey } from '@/lib/cycles/daily-tracking';

export const TIMER_SESSION_KEY = 'conselho-elemental-timer-session-v1';
type State = ReturnType<typeof useAppStore.getState>;
type Store = Pick<typeof useAppStore, 'getState' | 'setState' | 'subscribe'>;
const find = (items: Habit[], id: string): Habit | undefined => {
  for (const item of items) { if (item.id === id) return item; const child = find(item.childHabits, id); if (child) return child; }
};
export function timerActivity(state: Pick<State, 'timer' | 'tasks' | 'habits'>) {
  return state.timer.entityType === 'TASK' ? state.tasks.find(t => t.id === state.timer.entityId && !t.isCompleted)
    : state.timer.entityId ? (() => {
      const habit = find(state.habits, state.timer.entityId!);
      const day = state.timer.activityDate;
      return day && habit?.completions.some(c => dailyDateKey(new Date(c.completionDate)) === day) ? undefined : habit;
    })() : undefined;
}

/** Per-tab operational recovery only. Never imported, uploaded or used to grant
 * rewards; restoration only resumes the existing timer after owner/entity checks. */
export function attachTimerRuntime(store: Store, surface: Window = window, unavailable: () => void = () => {}) {
  let stopped = false;
  const owner = (s: State) => `${s.currentAccountId ?? 'local'}:${s.user.id}`;
  const save = () => {
    if (stopped) return;
    try {
      const state = store.getState(), timer = state.timer;
      if (!timer.entityId) surface.sessionStorage.removeItem(TIMER_SESSION_KEY);
      else surface.sessionStorage.setItem(TIMER_SESSION_KEY, JSON.stringify({ format: 'elemental-timer', version: 1, owner: owner(state), timer }));
    } catch { if (store.getState().timer.entityId) unavailable(); }
  };
  try {
    const raw = surface.sessionStorage.getItem(TIMER_SESSION_KEY), state = store.getState();
    if (raw && !state.timer.entityId) {
      if (raw.length > 4096) throw Error('Invalid timer');
      const data = JSON.parse(raw), t = data?.timer;
      if (data?.format !== 'elemental-timer' || data.version !== 1 || data.owner !== owner(state)
        || !t || typeof t.entityId !== 'string' || !['TASK', 'HABIT'].includes(t.entityType)
        || typeof t.isRunning !== 'boolean' || !Number.isSafeInteger(t.elapsedSeconds) || t.elapsedSeconds < 0
        || typeof t.startedAt !== 'string' || !Number.isFinite(Date.parse(t.startedAt))
        || (t.activityDate !== undefined && (typeof t.activityDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(t.activityDate)))) throw Error('Invalid timer');
      const timer: TimerState = { entityId: t.entityId, entityType: t.entityType, isRunning: t.isRunning, elapsedSeconds: t.elapsedSeconds, startedAt: new Date(t.startedAt), activityDate: t.activityDate };
      const activity = timerActivity({ ...state, timer });
      if (!activity?.isInProgress) throw Error('Unavailable timer');
      store.setState({ timer: { ...timer, elapsedSeconds: elapsedTimerSeconds(timer) } });
    }
  } catch { try { surface.sessionStorage.removeItem(TIMER_SESSION_KEY); } catch { /* Recovery storage is optional; domain storage remains untouched. */ } }
  let signature = '';
  const off = store.subscribe((state) => {
    const timer = state.timer;
    if (timer.entityId && !timerActivity(state)) { store.getState().stopTimer(); return; }
    const next = JSON.stringify([owner(state), timer.entityId, timer.entityType, timer.isRunning, timer.startedAt, timer.activityDate, timer.isRunning ? null : timer.elapsedSeconds]);
    if (next !== signature) { signature = next; save(); }
  });
  const tick = () => { if (!stopped && store.getState().timer.isRunning) store.getState().tickTimer(); };
  const visible = () => { tick(); save(); };
  const interval = surface.setInterval(() => { if (surface.document.visibilityState !== 'hidden') tick(); }, 1000);
  surface.addEventListener('focus', visible); surface.addEventListener('pageshow', visible); surface.addEventListener('pagehide', visible);
  surface.document.addEventListener('visibilitychange', visible);
  save(); tick();
  return () => { save(); stopped = true; off(); surface.clearInterval(interval); surface.removeEventListener('focus', visible); surface.removeEventListener('pageshow', visible); surface.removeEventListener('pagehide', visible); surface.document.removeEventListener('visibilitychange', visible); };
}
