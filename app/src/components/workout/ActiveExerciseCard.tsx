import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/workout';
import type {
  ExerciseLoadMode,
  ExerciseMeasureMode,
  PerformedSet,
  WorkoutExercise,
  WorkoutExercisePlan,
  WorkoutExerciseResult,
} from '@/types/workout';

interface SetRowProps {
  set: PerformedSet;
  measureMode: ExerciseMeasureMode;
  loadMode: ExerciseLoadMode;
  restSeconds: number;
  onComplete: (values: { loadKg: number; reps: number; durationSeconds: number }) => void;
  onSkip: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({ set, measureMode, loadMode, restSeconds, onComplete, onSkip }) => {
  const [loadKg, setLoadKg] = useState(set.loadKg);
  const [reps, setReps] = useState(set.reps);
  const [durationSeconds, setDurationSeconds] = useState(set.durationSeconds ?? 0);
  const isDone = set.completed || Boolean(set.skipped);

  return (
    <div
      className={cn(
        'rounded-2xl p-3',
        set.completed && 'bg-fitness-green/10',
        set.skipped && 'bg-fitness-surface-muted opacity-60',
        !isDone && 'bg-fitness-surface-muted'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-fitness-muted">Série {set.setNumber}</span>
        {set.completed && (
          <span className="flex items-center gap-1 text-[11px] text-fitness-green">
            <Check className="w-3.5 h-3.5" aria-hidden="true" /> Concluída
          </span>
        )}
        {set.skipped && <span className="text-[11px] text-fitness-muted">Pulada</span>}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2">
        {loadMode === 'weighted' && (
          <label className="block">
            <span className="text-[10px] text-white/50 block mb-0.5">Carga (kg)</span>
            <Input
              type="number"
              inputMode="decimal"
              value={loadKg}
              disabled={isDone}
              onChange={(event) => setLoadKg(Math.max(0, Number(event.target.value) || 0))}
              aria-label={`Carga da série ${set.setNumber}`}
              className="h-8 bg-white/5 border-white/15 font-mono text-xs px-2"
            />
          </label>
        )}
        {measureMode === 'reps' ? (
          <label className="block">
            <span className="text-[10px] text-white/50 block mb-0.5">Repetições</span>
            <Input
              type="number"
              inputMode="numeric"
              value={reps}
              disabled={isDone}
              onChange={(event) => setReps(Math.max(0, Number(event.target.value) || 0))}
              aria-label={`Repetições da série ${set.setNumber}`}
              className="h-8 bg-white/5 border-white/15 font-mono text-xs px-2"
            />
          </label>
        ) : (
          <label className="block">
            <span className="text-[10px] text-white/50 block mb-0.5">Segundos</span>
            <Input
              type="number"
              inputMode="numeric"
              value={durationSeconds}
              disabled={isDone}
              onChange={(event) => setDurationSeconds(Math.max(0, Number(event.target.value) || 0))}
              aria-label={`Duração da série ${set.setNumber}`}
              className="h-8 bg-white/5 border-white/15 font-mono text-xs px-2"
            />
          </label>
        )}
        <div>
          <span className="text-[10px] text-white/50 block mb-0.5">Descanso</span>
          <p className="h-8 flex items-center font-mono text-xs text-white/70">{restSeconds}s</p>
        </div>
      </div>

      {!isDone && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-full bg-fitness-green text-fitness-black hover:bg-fitness-green/80"
            onClick={() => onComplete({ loadKg, reps, durationSeconds })}
          >
            Concluir série
          </Button>
          <Button type="button" size="sm" variant="outline" className="rounded-full border-fitness-surface-hover bg-transparent text-fitness-text hover:bg-fitness-surface-hover" onClick={onSkip}>
            Pular
          </Button>
        </div>
      )}
    </div>
  );
};

interface ActiveExerciseCardProps {
  result: WorkoutExerciseResult;
  exercise?: WorkoutExercise;
  plan?: WorkoutExercisePlan;
  expanded: boolean;
  onToggleExpand: () => void;
  onCompleteSet: (performedSetId: string, values: { loadKg: number; reps: number; durationSeconds: number }) => void;
  onSkipSet: (performedSetId: string) => void;
}

export const ActiveExerciseCard: React.FC<ActiveExerciseCardProps> = ({
  result,
  exercise,
  plan,
  expanded,
  onToggleExpand,
  onCompleteSet,
  onSkipSet,
}) => {
  const Icon = exercise ? CATEGORY_ICONS[exercise.category] ?? CATEGORY_ICONS.mixed : CATEGORY_ICONS.mixed;
  const totalSets = result.sets.length;
  const doneSets = result.sets.filter((set) => set.completed || set.skipped).length;
  const isComplete = totalSets > 0 && doneSets === totalSets;
  const currentSet = result.sets.find((set) => !set.completed && !set.skipped);
  const progressPercent = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;
  const measureMode: ExerciseMeasureMode = exercise?.measureMode ?? 'reps';
  const loadMode: ExerciseLoadMode = exercise?.loadMode ?? 'weighted';

  const getRestSeconds = (setNumber: number): number =>
    plan?.sets.find((setPlan) => setPlan.setNumber === setNumber)?.restSeconds ?? 60;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border',
            isComplete ? 'bg-terra-light/15 border-terra-light/40' : 'bg-mystic-arcane/15 border-mystic-arcane/30'
          )}
        >
          {isComplete ? (
            <Check className="w-5 h-5 text-terra-light" aria-hidden="true" />
          ) : (
            <Icon className="w-5 h-5 text-mystic-arcane" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{result.exerciseNameSnapshot}</p>
          <p className="text-[11px] text-white/50">
            {isComplete ? 'Concluído' : currentSet ? `Série ${currentSet.setNumber} de ${totalSets}` : `${totalSets} séries`}
          </p>
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div
              className={cn('h-full rounded-full transition-all', isComplete ? 'bg-terra-light' : 'bg-mystic-arcane')}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/40 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40 shrink-0" aria-hidden="true" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {result.sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  measureMode={measureMode}
                  loadMode={loadMode}
                  restSeconds={getRestSeconds(set.setNumber)}
                  onComplete={(values) => onCompleteSet(set.id, values)}
                  onSkip={() => onSkipSet(set.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
