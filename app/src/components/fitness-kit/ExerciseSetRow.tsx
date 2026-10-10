import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FitnessButton } from './FitnessButton';
import type { ExerciseLoadMode, ExerciseMeasureMode, PerformedSet } from '@/types/workout';

export interface SetCompletionValues {
  loadKg: number;
  reps: number;
  durationSeconds: number;
  perceivedExertion?: number;
  distanceMeters?: number;
  activityNotes?: string;
}

interface ExerciseSetRowProps {
  set: PerformedSet;
  measureMode: ExerciseMeasureMode;
  loadMode: ExerciseLoadMode;
  restSeconds: number;
  activity?: boolean;
  distanceUnit?: 'm' | 'km';
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

const NumberField: React.FC<FieldProps> = ({ label, ariaLabel, value, disabled, onChange }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return <label className="block">
    <span className="mb-1 block text-xs text-fitness-muted">{label}</span>
    <input type="text" inputMode="decimal" value={draft ?? String(value)} disabled={disabled}
      onChange={(event)=>{
        const next=event.target.value;
        if (!/^[0-9]*[.,]?[0-9]*$/.test(next)) return;
        setDraft(next);
        const parsed=Number(next.replace(',','.'));
        if(next!=='' && Number.isFinite(parsed)) onChange(Math.max(0,parsed));
      }}
      onBlur={()=>{
        const parsed=Number((draft ?? String(value)).replace(',','.'));
        onChange(Number.isFinite(parsed) ? Math.max(0,parsed) : value);
        setDraft(null);
      }}
      aria-label={ariaLabel}
      className="h-11 w-full rounded-xl bg-fitness-canvas px-3 text-base text-fitness-text outline-none transition-shadow focus:ring-2 focus:ring-fitness-primary disabled:opacity-50" />
  </label>;
};

/** Registro de uma série (mesma lógica do card anterior, nova apresentação). */
export const ExerciseSetRow: React.FC<ExerciseSetRowProps> = ({ set, measureMode, loadMode, restSeconds, activity = false, distanceUnit, onComplete, onSkip }) => {
  const [loadKg, setLoadKg] = useState(set.loadKg);
  const [reps, setReps] = useState(set.reps);
  const [durationSeconds, setDurationSeconds] = useState(set.durationSeconds ?? 0);
  const [effort, setEffort] = useState(set.perceivedExertion ?? 0);
  const [distance, setDistance] = useState(set.distanceMeters ?? 0);
  const [notes, setNotes] = useState(set.activityNotes ?? '');
  const isDone = set.completed || Boolean(set.skipped);

  if (isDone) return <div className="rounded-xl bg-fitness-canvas/50 px-4 py-3 text-sm text-fitness-muted">{activity ? 'Bloco' : 'Série'} {set.setNumber} · {set.skipped ? 'Pulado' : 'Concluído'}{set.completed && (set.durationSeconds ?? 0) > 0 ? ` · ${((set.durationSeconds ?? 0)/60).toFixed(1)} min` : ''}{set.perceivedExertion ? ` · esforço ${set.perceivedExertion}/10` : ''}</div>;

  return (
    <div className={cn('rounded-2xl p-4', set.completed ? 'bg-fitness-green/10' : 'bg-fitness-surface-muted', set.skipped && 'opacity-60')}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-base font-medium text-fitness-text">{activity ? 'Bloco' : 'Série'} {set.setNumber}</span>
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
          <NumberField label={activity ? "Tempo ativo (min)" : "Segundos"} ariaLabel={`Duração da série ${set.setNumber}`} value={durationSeconds / (activity ? 60 : 1)} disabled={isDone} onChange={(value)=>setDurationSeconds(value*(activity ? 60 : 1))} />
        )}
        <div>
          <span className="mb-1 block text-xs text-fitness-muted">Descanso</span>
          <p className="flex h-11 items-center text-base text-fitness-text-soft">{restSeconds}s</p>
        </div>
      </div>

      <div className="mb-3 space-y-3">
        {measureMode === 'reps' && <NumberField label="Tempo ativo (s, opcional)" ariaLabel={`Tempo ativo da série ${set.setNumber}`} value={durationSeconds} disabled={isDone} onChange={setDurationSeconds} />}
        <label className="block text-xs text-fitness-muted">Esforço percebido (1–10){!activity && ' · opcional'}<select aria-label={`Esforço do bloco ${set.setNumber}`} value={effort} disabled={isDone} onChange={(event)=>setEffort(Number(event.target.value))} className="mt-1 h-11 w-full rounded-xl bg-fitness-canvas px-3 text-base text-fitness-text"><option value={0}>Selecione o esforço</option>{Array.from({length:10},(_,index)=><option key={index+1} value={index+1}>{index+1}{index===0?' · muito leve':index===4?' · moderado':index===9?' · máximo':''}</option>)}</select></label>
        {distanceUnit && <NumberField label={`Distância (${distanceUnit}, opcional)`} ariaLabel={`Distância do bloco ${set.setNumber}`} value={distance/(distanceUnit==='km'?1000:1)} disabled={isDone} onChange={(value)=>setDistance(value*(distanceUnit==='km'?1000:1))} />}
        <label className="block text-xs text-fitness-muted">O que você fez? (opcional)<textarea aria-label={`Descrição do bloco ${set.setNumber}`} value={notes} maxLength={2000} disabled={isDone} onChange={(event)=>setNotes(event.target.value)} placeholder="Técnica, terreno, ritmo, estilo de nado…" className="mt-1 min-h-20 w-full rounded-xl bg-fitness-canvas p-3 text-sm text-fitness-text focus-visible:outline-fitness-primary" /></label>
        {activity && !isDone && !effort && <p className="text-xs text-fitness-muted">Informe o esforço e o tempo realmente praticado para registrar este bloco.</p>}
      </div>
      {!isDone && (
        <div className="flex gap-3">
          <FitnessButton size="md" className="flex-1 !h-12 !px-3 !text-sm !shadow-none" disabled={activity && (!effort || durationSeconds <= 0)} onClick={() => onComplete({ loadKg, reps, durationSeconds, perceivedExertion: effort || undefined, distanceMeters: distance, activityNotes: notes })}>
            {activity ? 'Concluir bloco' : 'Concluir série'}
          </FitnessButton>
          <FitnessButton size="md" variant="secondary" className="bg-fitness-canvas !h-12 !px-4 !text-sm" onClick={onSkip}>
            Pular
          </FitnessButton>
        </div>
      )}
    </div>
  );
};
