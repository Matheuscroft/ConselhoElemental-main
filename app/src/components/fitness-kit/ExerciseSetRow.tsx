import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FitnessButton } from './FitnessButton';
import type { ExerciseLoadMode, ExerciseMeasureMode, PerformedSet } from '@/types/workout';

export interface SetCompletionValues {
  loadKg: number;
  reps: number;
  durationSeconds: number;
}

interface ExerciseSetRowProps {
  set: PerformedSet;
  measureMode: ExerciseMeasureMode;
  loadMode: ExerciseLoadMode;
  restSeconds: number;
  onComplete: (values: SetCompletionValues) => void;
  onSkip: () => void;
}

interface FieldProps {
  label: string;
  ariaLabel: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

const NumberField: React.FC<FieldProps> = ({ label, ariaLabel, value, disabled, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-xs text-fitness-muted">{label}</span>
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
      aria-label={ariaLabel}
      className="h-11 w-full rounded-xl bg-fitness-canvas px-3 text-base text-fitness-text outline-none transition-shadow focus:ring-2 focus:ring-fitness-primary disabled:opacity-50"
    />
  </label>
);

/** Registro de uma série (mesma lógica do card anterior, nova apresentação). */
export const ExerciseSetRow: React.FC<ExerciseSetRowProps> = ({ set, measureMode, loadMode, restSeconds, onComplete, onSkip }) => {
  const [loadKg, setLoadKg] = useState(set.loadKg);
  const [reps, setReps] = useState(set.reps);
  const [durationSeconds, setDurationSeconds] = useState(set.durationSeconds ?? 0);
  const isDone = set.completed || Boolean(set.skipped);

  return (
    <div className={cn('rounded-2xl p-4', set.completed ? 'bg-fitness-green/10' : 'bg-fitness-surface-muted', set.skipped && 'opacity-60')}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-base font-medium text-fitness-text">Série {set.setNumber}</span>
        {set.completed && (
          <span className="flex items-center gap-1 text-sm text-fitness-green">
            <Check className="h-4 w-4" aria-hidden="true" /> Concluída
          </span>
        )}
        {set.skipped && <span className="text-sm text-fitness-muted">Pulada</span>}
      </div>

      <div className={cn("mb-3 grid gap-3", loadMode === 'weighted' ? 'grid-cols-3' : 'grid-cols-2')}>
        {loadMode === 'weighted' && (
          <NumberField label="Carga (kg)" ariaLabel={`Carga da série ${set.setNumber}`} value={loadKg} disabled={isDone} onChange={setLoadKg} />
        )}
        {measureMode === 'reps' ? (
          <NumberField label="Repetições" ariaLabel={`Repetições da série ${set.setNumber}`} value={reps} disabled={isDone} onChange={setReps} />
        ) : (
          <NumberField label="Segundos" ariaLabel={`Duração da série ${set.setNumber}`} value={durationSeconds} disabled={isDone} onChange={setDurationSeconds} />
        )}
        <div>
          <span className="mb-1 block text-xs text-fitness-muted">Descanso</span>
          <p className="flex h-11 items-center text-base text-fitness-text-soft">{restSeconds}s</p>
        </div>
      </div>

      {!isDone && (
        <div className="flex gap-3">
          <FitnessButton size="md" className="flex-1" onClick={() => onComplete({ loadKg, reps, durationSeconds })}>
            Concluir série
          </FitnessButton>
          <FitnessButton size="md" variant="secondary" className="bg-fitness-canvas" onClick={onSkip}>
            Pular
          </FitnessButton>
        </div>
      )}
    </div>
  );
};
