import { mergeFitnessHistory, sessionActivity } from '../../src/lib/fitness/activity-history.ts';
import { buildWeekBuckets } from '../../src/lib/fitness-kit/adapters.ts';
import { sessionClockSeconds } from '../../src/lib/workout/session-clock.ts';
import type { NativeWorkoutSession, WorkoutSession } from '../../src/types/workout.ts';
const assert = (condition: unknown, message: string) => { if (!condition) throw Error(message); };
const native = { id: 'new', nameSnapshot: 'Corrida', status: 'completed', startedAt: '2026-10-13T10:00:00', completedAt: '2026-10-13T10:30:00', durationSeconds: 1800, exerciseResults: [{ sets: [
  { completed: true, measureMode: 'duration', durationSeconds: 600, perceivedExertion: 6 },
  { completed: true, skipped: true, measureMode: 'duration', durationSeconds: 900, perceivedExertion: 8 },
  { completed: false, measureMode: 'duration', durationSeconds: 900 },
] }] } as NativeWorkoutSession;
const legacy = { id: 'old', workoutNameSnapshot: 'Antigo', status: 'completed', startedAt: '2026-10-13T08:00:00', durationSeconds: 300, totalVolume: 10, exerciseResults: [] } as unknown as WorkoutSession;
Deno.test('painéis incluem histórico antigo e novo sem duplicar nem usar planejamento', () => {
  const history = mergeFitnessHistory([legacy], [native, native]);
  assert(history.length === 2, 'duplicate ID');
  const day = buildWeekBuckets(history, 1, new Date('2026-10-13T12:00:00')).find(day => day.key === '2026-10-13')!;
  assert(day.minutes === 15 && day.sessionCount === 2, 'should add 5 legacy minutes and 10 completed native minutes');
  assert(day.activityLoad === 60, 'only performed RPE contributes');
});
Deno.test('séries sem esforço não inventam carga; repetições têm tempo estimado', () => {
  const entry = { ...native, exerciseResults: [{ sets: [{ completed: true, measureMode: 'reps', reps: 15 }] }] } as NativeWorkoutSession;
  const result = sessionActivity(entry);
  assert(result.seconds === 60 && result.load === 0 && !result.observed, 'missing effort must stay missing');
});
Deno.test('pausa permanece congelada e tempo retomado exclui pausas anteriores', () => {
  const startedAt = '2026-10-13T10:00:00Z';
  assert(sessionClockSeconds({ startedAt, pausedAt: '2026-10-13T10:01:00Z' }, Date.parse('2026-10-13T10:30:00Z')) === 60, 'paused clock advanced');
  assert(sessionClockSeconds({ startedAt, pausedSeconds: 120 }, Date.parse('2026-10-13T10:03:00Z')) === 60, 'pause not excluded');
  assert(sessionClockSeconds({ startedAt }, Date.parse('2026-10-13T09:59:00Z')) === 0, 'negative clock');
});
