import React, { useLayoutEffect, useRef, useState } from 'react';
import { WorkoutSetReceipt } from './WorkoutSetReceipt';
import { wasSetRecorded } from './set-command-result';
import type { ExerciseLoadMode, ExerciseMeasureMode, PerformedSet, WorkoutSession } from '@/types/workout';

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
  onComplete: (values: SetCompletionValues) => WorkoutSession | undefined;
  onSkip: () => WorkoutSession | undefined;
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
  return <label className="block min-w-0">
    <span className="treino-campo-rotulo">{label}</span>
    <input type="text" inputMode="decimal" enterKeyHint="done" value={draft ?? String(value)} disabled={disabled}
      onFocus={(event)=>event.currentTarget.select()}
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
      className="treino-campo" />
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
  const [error, setError] = useState('');
  const row = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const commandPending = useRef(false);
  useLayoutEffect(() => {
    if (isDone && pendingFocus.current === set.id) row.current?.focus({ preventScroll: true });
    pendingFocus.current = null;
    if (!isDone) commandPending.current = false;
  }, [isDone, set.id]);
  const submit = (action: 'complete' | 'skip') => {
    if (isDone || commandPending.current) return;
    commandPending.current = true;
    try {
      const result = action === 'complete'
        ? onComplete({ loadKg, reps, durationSeconds, perceivedExertion: effort || undefined, distanceMeters: distance, activityNotes: notes })
        : onSkip();
      if (!wasSetRecorded(result, set.id, action)) throw new Error('Set not recorded');
      pendingFocus.current = set.id;
      setError('');
    } catch {
      commandPending.current = false;
      pendingFocus.current = null;
      setError(action === 'complete' ? 'Não foi possível registrar. Confira os valores e tente novamente.' : 'Não foi possível pular. Confira se o treino continua em andamento e tente novamente.');
    }
  };

  const esforcoEscolha = (
    <label className="block">
      <span className="treino-campo-rotulo">Esforço percebido (1–10){!activity && ' · opcional'}</span>
      <select aria-label={`Esforço do bloco ${set.setNumber}`} value={effort} disabled={isDone} onChange={(event)=>setEffort(Number(event.target.value))} className="treino-campo"><option value={0}>Selecione o esforço</option>{Array.from({length:10},(_,index)=><option key={index+1} value={index+1}>{index+1}{index===0?' · muito leve':index===4?' · moderado':index===9?' · máximo':''}</option>)}</select>
    </label>
  );
  const detalhes = (
    <div className="treino-mais-campos">
      {measureMode === 'reps' && <NumberField label="Tempo ativo (s, opcional)" ariaLabel={`Tempo ativo da série ${set.setNumber}`} value={durationSeconds} disabled={isDone} onChange={setDurationSeconds} />}
      {esforcoEscolha}
      {distanceUnit && <NumberField label={`Distância (${distanceUnit}, opcional)`} ariaLabel={`Distância do bloco ${set.setNumber}`} value={distance/(distanceUnit==='km'?1000:1)} disabled={isDone} onChange={(value)=>setDistance(value*(distanceUnit==='km'?1000:1))} />}
      <label className="block">
        <span className="treino-campo-rotulo">O que você fez? (opcional)</span>
        <textarea aria-label={`Descrição do bloco ${set.setNumber}`} value={notes} maxLength={2000} disabled={isDone} onChange={(event)=>setNotes(event.target.value)} placeholder="Técnica, terreno, ritmo, estilo de nado…" className="treino-campo" />
      </label>
    </div>
  );

  return (
    <div ref={row} tabIndex={isDone ? -1 : undefined} role={isDone ? 'group' : undefined}
      aria-label={isDone ? `Resultado ${activity ? 'do bloco' : 'da série'} ${set.setNumber}` : undefined}>
      <WorkoutSetReceipt set={set} activity={activity} />
      {!isDone && <div className="treino-serie">
        <span className="treino-serie-nome">{activity ? 'Bloco' : 'Série'} {set.setNumber}</span>

        <div className="treino-serie-campos" data-colunas={loadMode === 'weighted' ? 3 : 2}>
          {loadMode === 'weighted' && (
            <NumberField label="Carga (kg)" ariaLabel={`Carga da série ${set.setNumber}`} value={loadKg} disabled={isDone} onChange={setLoadKg} />
          )}
          {measureMode === 'reps' ? (
            <NumberField label="Repetições" ariaLabel={`Repetições da série ${set.setNumber}`} value={reps} disabled={isDone} onChange={setReps} />
          ) : (
            <NumberField label={activity ? "Tempo ativo (min)" : "Segundos"} ariaLabel={`Duração da série ${set.setNumber}`} value={durationSeconds / (activity ? 60 : 1)} disabled={isDone} onChange={(value)=>setDurationSeconds(value*(activity ? 60 : 1))} />
          )}
          <div>
            <span className="treino-campo-rotulo">Descanso</span>
            <p className="treino-campo-leitura">{restSeconds}s</p>
          </div>
        </div>

        {/* Activities need effort and time to be recorded, so they stay in view; strength sets keep them one tap away. */}
        {activity ? <div className="space-y-3">{detalhes}</div> : <details className="treino-mais"><summary>Mais detalhes (opcional)</summary>{detalhes}</details>}
        {activity && !isDone && !effort && <p className="treino-ajuda">Informe o esforço e o tempo realmente praticado para registrar este bloco.</p>}
        {error && <p role="alert" className="treino-erro">{error}</p>}
        <div className="treino-serie-acoes">
          <button type="button" className="treino-acao treino-acao--concluir" disabled={activity && (!effort || durationSeconds <= 0)} onClick={() => submit('complete')}>{activity ? 'Concluir bloco' : 'Concluir série'}</button>
          <button type="button" className="treino-acao treino-acao--pular" onClick={() => submit('skip')}>Pular</button>
        </div>
      </div>}
    </div>
  );
};
