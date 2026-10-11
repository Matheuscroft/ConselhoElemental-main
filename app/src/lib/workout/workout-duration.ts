/** Heurística de planejamento, sem estimar a duração real de uma execução. */
interface DurationExercise {
  sets: ReadonlyArray<{ measureMode?: 'reps' | 'duration'; targetReps?: number; targetDurationSeconds?: number; restSeconds?: number }>;
}

/** Retorna minutos inteiros arredondados para cima; aceita planos nativos e legados. */
export function calculateEstimatedDuration(exercises: readonly DurationExercise[]): number {
  const positive = (value: number | undefined) => Number.isFinite(value) ? Math.max(0, value ?? 0) : 0;
  const totalSeconds = exercises.reduce((total, exercise, index) => total + (index > 0 ? 60 : 0) + exercise.sets.reduce((sum, series) => {
    const durationMode = series.measureMode === 'duration' || (series.measureMode == null && series.targetDurationSeconds != null);
    const workSeconds = durationMode ? positive(series.targetDurationSeconds) : positive(series.targetReps) * 4;
    return sum + workSeconds + positive(series.restSeconds);
  }, 0), 0);
  return Math.ceil(totalSeconds / 60);
}
