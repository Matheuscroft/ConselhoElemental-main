import { ExperienceIcon } from '@/components/rewards/ExperienceIcon';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { FitnessGlyph } from '@/components/fitness-kit/FitnessGlyph';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEventHandler, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Check, ChevronDown, Film, Grid2X2, ImageOff, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Exercise, PlannedExercise, UUIDv4, WorkoutExerciseCategory, WorkoutSet, WorkoutTemplate, Workout } from '@/types/workout';
import { calculateEstimatedDuration } from '@/lib/workout/workout-duration';
import { formatEarthXp, projectTemplateReward } from '@/lib/workout/native-reward-preview';
import { FitnessDurationField } from './FitnessDurationField';
import { FitnessIntegerField } from './FitnessIntegerField';
import { MUSCLE_REGIONS } from '@/constants/muscle-regions';
import { getExercisePresentation } from '@/lib/workout/workout-focus';
import './create-workout.css';
import { Contagem } from '@/components/motion/Contagem';
import { DialogoCabeca } from '@/components/fitness-kit/dialogo-cabeca';
import { useLuzDoDialogo } from '@/components/fitness-kit/dialogo-luz';
import { elementoDaModalidade } from '@/components/fitness-kit/treinos-elementos';
import '@/components/fitness-kit/dialogo-uau.css';
import './dialogo-criar-uau.css';
import { DURATION } from '@/lib/motion/motion';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import { CustomExerciseFields } from './CustomExerciseFields';
import { resolveExerciseMedia, validExerciseMediaUrl } from '@/lib/workout/exercise-media';

const newId = () => crypto.randomUUID() as UUIDv4;
const field = 'workout-builder-input';

function plannedExercise(exercise: Exercise, order: number): PlannedExercise {
  return {
    id: newId(), exerciseId: exercise.id, exerciseNameSnapshot: exercise.name,
    imageUrl: exercise.imageUrl, videoUrl: exercise.videoUrl, modality: exercise.modality, order, instanceMode: 'planned',
    muscleDistribution: structuredClone(exercise.muscleDistribution),
    sets: Array.from({ length: Math.max(1, exercise.defaultSets) }, (_, index): WorkoutSet => ({
      id: newId(), setNumber: index + 1, targetLoadKg: exercise.defaultLoadKg,
      completed: false, loadFactor: 1, restSeconds: 60,
      ...(exercise.measureMode === 'reps'
        ? { measureMode: 'reps', targetReps: Math.max(1, exercise.defaultReps) }
        : { measureMode: 'duration', targetDurationSeconds: Math.max(1, exercise.defaultDurationSeconds) }),
    })),
  };
}

/** An animated disclosure: the row grows from 0fr to 1fr and stays out of the tab order while shut. */
function Colapso({ id, aberto, children, onInvalidCapture }: { id: string; aberto: boolean; children: ReactNode; onInvalidCapture?: FormEventHandler<HTMLDivElement> }) {
  return <div id={id} className="dg-colapso" data-aberto={aberto || undefined} inert={!aberto} onInvalidCapture={onInvalidCapture}><div className="dg-colapso-miolo">{children}</div></div>;
}

const NIVEIS = ['Muito leve', 'Leve', 'Moderado', 'Intenso', 'Muito intenso'] as const;

/** Effort of the whole workout as a living ruler: the chosen bar grows and glows, the caption swaps with a fade. */
function ReguaDeEsforco({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const nome = useId();
  const rotulo = useId();
  return <div className="dg-regua">
    <span id={rotulo} className="dg-rotulo">Esforço do treino</span>
    <div role="radiogroup" aria-labelledby={rotulo} aria-describedby={`${nome}-nota`} className="dg-regua-escala">
      {NIVEIS.map((descricao, indice) => {
        const nivel = indice + 1;
        return <label key={nivel} className="dg-regua-marca" data-aceso={nivel <= value || undefined} data-atual={nivel === value || undefined} style={{ '--n': nivel } as CSSProperties}>
          <input type="radio" name={nome} value={nivel} checked={value === nivel} aria-label={`${nivel}, ${descricao}`} onChange={() => onChange(nivel)} />
          <span className="dg-regua-barra" aria-hidden="true">{nivel}</span>
        </label>;
      })}
    </div>
    <p className="dg-regua-legenda" aria-live="polite"><span key={value} className="dg-regua-nome">{NIVEIS[value - 1] ?? 'Sem esforço definido'}</span></p>
    <p id={`${nome}-nota`} className="dg-nota">Esforço do treino inteiro; não é o esforço de cada série. Ele influencia o custo de Prana.</p>
  </div>;
}

type MidiaPatch = Partial<Pick<PlannedExercise, 'imageUrl' | 'videoUrl' | 'notes'>>;
const AVISO_URL = 'Use um link que comece com http:// ou https://, ou um caminho de arquivo do app, como /imagens/treino.jpg.';

/** Same fields, same validation, same saved data: only presented as a media card with a live preview. */
function MidiaDoExercicio({ plan, herdada, sigilo, onChange }: { plan: PlannedExercise; herdada?: string; sigilo: ReactNode; onChange: (patch: MidiaPatch) => void }) {
  const id = useId();
  const [aberta, setAberta] = useState(false);
  const [imagem, setImagem] = useState(plan.imageUrl ?? '');
  const [video, setVideo] = useState(plan.videoUrl ?? '');
  const [prevista, setPrevista] = useState((plan.imageUrl ?? '').trim());
  const [falhou, setFalhou] = useState<string | null>(null);
  useEffect(() => {
    const espera = window.setTimeout(() => setPrevista(imagem.trim()), DURATION.reveal);
    return () => window.clearTimeout(espera);
  }, [imagem]);
  const imagemLimpa = imagem.trim();
  const videoLimpo = video.trim();
  const imagemErro = !validExerciseMediaUrl(imagemLimpa);
  const videoErro = !validExerciseMediaUrl(videoLimpo);
  const url = prevista && validExerciseMediaUrl(prevista) && !imagemErro ? prevista : '';
  const mostra = url && falhou !== url ? url : !imagemLimpa ? herdada : undefined;
  const estado = imagemErro ? 'erro' : url && falhou === url ? 'falha' : mostra ? 'imagem' : 'vazio';
  const notas = plan.notes ?? '';
  const resumo = [imagemLimpa && 'imagem', videoLimpo && 'vídeo', notas.trim() && 'observações'].filter(Boolean).join(' · ') || 'Opcional';
  const confirmar = (campo: 'imageUrl' | 'videoUrl', valor: string) => onChange({ [campo]: valor.trim() || undefined });
  return <section className="dg-midia" aria-labelledby={`${id}-t`}>
    <h5 id={`${id}-t`} className="dg-midia-titulo"><button type="button" aria-expanded={aberta} aria-controls={`${id}-c`} className="dg-midia-alterna" onClick={() => setAberta((atual) => !atual)}>
      <span className="dg-midia-nome">Mídia do exercício<small>{resumo}</small></span>
      <ChevronDown size={16} aria-hidden="true" className="dg-seta" data-aberto={aberta || undefined} />
    </button></h5>
    <Colapso id={`${id}-c`} aberto={aberta}>
      <div className="dg-midia-corpo">
        <div className="dg-midia-palco" data-estado={estado} role="img" aria-label={estado === 'imagem' ? `Pré-visualização da imagem de ${plan.exerciseNameSnapshot}` : estado === 'erro' ? 'Link da imagem inválido' : estado === 'falha' ? 'A imagem não carregou' : 'Sem mídia personalizada'}>
          {mostra && estado === 'imagem'
            ? <img key={mostra} src={mostra} alt="" className="dg-midia-img" loading="lazy" onError={() => setFalhou(mostra)} />
            : <span className="dg-midia-sigilo" aria-hidden="true">{estado === 'erro' || estado === 'falha' ? <ImageOff size={24} strokeWidth={1.55} /> : sigilo}</span>}
          <span className="dg-midia-legenda" aria-hidden="true">
            {estado === 'imagem' ? (imagemLimpa ? 'Sua imagem' : 'Imagem do app') : estado === 'erro' ? 'Link inválido' : estado === 'falha' ? 'Não consegui carregar esta imagem' : 'A mídia do app aparece sozinha quando você não preenche'}
          </span>
          {videoLimpo && !videoErro && <span className="dg-midia-selo"><Film size={14} aria-hidden="true" />Vídeo</span>}
        </div>
        <label className="dg-campo"><span className="dg-rotulo">Link da imagem <small>(opcional)</small></span>
          <input className={field} value={imagem} placeholder="https://.../imagem.jpg" inputMode="url" autoComplete="off" aria-invalid={imagemErro || undefined} aria-describedby={imagemErro ? `${id}-ei` : undefined}
            onChange={(event) => setImagem(event.target.value)} onBlur={(event) => confirmar('imageUrl', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') confirmar('imageUrl', event.currentTarget.value); }} />
          {imagemErro && <span id={`${id}-ei`} className="dg-ajuda" data-tipo="erro">{AVISO_URL}</span>}
        </label>
        <label className="dg-campo"><span className="dg-rotulo">Link direto do vídeo <small>(opcional)</small></span>
          <input className={field} value={video} placeholder="https://.../video.mp4" inputMode="url" autoComplete="off" aria-invalid={videoErro || undefined} aria-describedby={videoErro ? `${id}-ev` : videoLimpo ? `${id}-ov` : undefined}
            onChange={(event) => setVideo(event.target.value)} onBlur={(event) => confirmar('videoUrl', event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') confirmar('videoUrl', event.currentTarget.value); }} />
          {videoErro && <span id={`${id}-ev`} className="dg-ajuda" data-tipo="erro">{AVISO_URL}</span>}
          {!videoErro && videoLimpo && <span id={`${id}-ov`} className="dg-ajuda" data-tipo="ok">Link válido. O vídeo aparece com botão de reprodução.</span>}
        </label>
        <label className="dg-campo"><span className="dg-rotulo">Observações</span>
          <textarea className={field} rows={3} value={notas} placeholder="Ritmo, pegada, o que lembrar na hora…" onChange={(event) => onChange({ notes: event.target.value })} />
          <span className="dg-contador" aria-hidden="true">{notas.length} {notas.length === 1 ? 'caractere' : 'caracteres'}</span>
        </label>
      </div>
    </Colapso>
  </section>;
}

export function NativeTemplateDialog({ catalog, modality, presetId, template, legacyWorkout, onClose }: {
  catalog: Exercise[]; modality: WorkoutExerciseCategory; presetId?: string; template?: WorkoutTemplate; legacyWorkout?: Workout; onClose: () => void;
}) {
  const timedActivity = ['running', 'swimming', 'cycling', 'martial_arts'].includes(modality);
  const formId = useId();
  const saveTemplate = useWorkoutStore((state) => state.saveTemplate);
  const updateWorkout = useWorkoutStore((state) => state.updateWorkout);
  const [name, setName] = useState(template?.name ?? legacyWorkout?.name ?? '');
  const [manualMinutes, setManualMinutes] = useState<string | null>(() => legacyWorkout ? String(legacyWorkout.estimatedDurationMinutes) : template && (template.durationEstimateMode === 'manual' || (!template.durationEstimateMode && (template.estimatedDurationMinutes ?? 0) > 0)) ? String(template.estimatedDurationMinutes ?? 0) : null);
  const [effortLevel, setEffortLevel] = useState(template ? template.effortLevel ?? 1 : legacyWorkout ? legacyWorkout.effortLevel ?? 1 : 3);
  const [search, setSearch] = useState('');
  const [scheduledDate, setScheduledDate] = useState((template?.scheduledAt ?? legacyWorkout?.scheduledAt)?.slice(0, 10) ?? '');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(() => new Set((template?.exercises ?? legacyWorkout?.exercises ?? []).map((exercise) => exercise.id)));
  const [collapsedSeries, setCollapsedSeries] = useState<Set<string>>(() => new Set((template?.exercises ?? legacyWorkout?.exercises ?? []).flatMap((exercise) => exercise.sets.map((series) => series.id))));
  const [plans, setPlans] = useState<PlannedExercise[]>(() => {
    if (template) return structuredClone(template.exercises).sort((a, b) => a.order - b.order);
    if (legacyWorkout) return legacyWorkout.exercises.map((plan) => {
      const exercise = catalog.find((item) => item.legacyId === plan.exerciseId);
      return { ...structuredClone(plan), id: plan.id as UUIDv4, exerciseId: exercise?.id ?? plan.exerciseId as UUIDv4,
        exerciseNameSnapshot: exercise?.name ?? plan.exerciseId, modality, instanceMode: 'planned' as const,
        muscleDistribution: exercise?.muscleDistribution,
        sets: plan.sets.map((series): WorkoutSet => {
          const { targetReps, targetDurationSeconds, ...values } = series;
          const base = { ...values, id: series.id as UUIDv4, completed: false };
          return (exercise?.measureMode ?? (targetReps != null ? 'reps' : 'duration')) === 'reps'
            ? { ...base, measureMode: 'reps', targetReps }
            : { ...base, measureMode: 'duration', targetDurationSeconds };
        }) };
    });
    const preset = catalog.find((exercise) => exercise.id === presetId);
    return preset ? [plannedExercise(preset, 0)] : [];
  });
  const matches = useMemo(() => catalog.filter((exercise) => exercise.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) &&
    (!muscleFilter || MUSCLE_REGIONS.find((region) => region.id === muscleFilter)?.muscles.some((muscle) => exercise.primaryMuscles?.includes(muscle)))), [catalog, search, muscleFilter]);
  const automaticMinutes = calculateEstimatedDuration(plans);
  const estimatedMinutes = manualMinutes ?? String(automaticMinutes);
  const safeMinutes = Math.max(0, Number(estimatedMinutes) || 0);
  const reward = projectTemplateReward({ exercises: plans, estimatedDurationMinutes: safeMinutes,
    durationEstimateMode: manualMinutes === null ? 'auto' : 'manual', effortLevel });
  const updateSeries = (exerciseId: string, setId: string, update: (series: WorkoutSet) => WorkoutSet) =>
    setPlans((current) => current.map((plan) => plan.id !== exerciseId ? plan : { ...plan, sets: plan.sets.map((series) => series.id === setId ? update(series) : series) }));
  const addExercise = (exercise: Exercise) => {
    const plan = plannedExercise(exercise, plans.length);
    setPlans((current) => [...current, { ...plan, order: current.length }]);
    setCollapsedExercises((current) => new Set(current).add(plan.id));
    setCollapsedSeries((current) => new Set([...current, ...plan.sets.map((series) => series.id)]));
  };


  const titleId = useId();
  const catalogRef = useRef<HTMLElement>(null);
  const ligarLuz = useLuzDoDialogo();
  const elemento = elementoDaModalidade(modality);
  const SigiloModalidade = CATEGORY_ICONS[modality] ?? CATEGORY_ICONS.mixed;
  const editing = Boolean(template || legacyWorkout);
  const dicaSalvar = !plans.length ? 'Adicione pelo menos um exercício para salvar.' : !name.trim() ? 'Dê um nome ao treino para salvar.' : '';
  const totalSeries = plans.reduce((sum, plan) => sum + plan.sets.length, 0);
  const toggle = (set: Set<string>, id: string) => { const next = new Set(set); if (next.has(id)) next.delete(id); else next.add(id); return next; };
  const irAoCatalogo = () => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    catalogRef.current?.scrollIntoView({ block: 'start', behavior: reduzido ? 'auto' : 'smooth' });
  };

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent ref={ligarLuz} data-luz="" data-element={elemento} aria-labelledby={titleId} showCloseButton={false} overlayClassName="dialogo-veu" className="dialogo-treino dg-montador ds-glass-float">
      <DialogoCabeca icone={SigiloModalidade} fechar="Fechar criação de treino" sobretitulo={<><span className="sr-only">Modalidade: </span>{CATEGORY_LABELS[modality]}</>}>
        <DialogTitle id={titleId} className="dg-titulo">{editing ? 'Editar treino' : 'Criar treino'}</DialogTitle>
        <DialogDescription className="dg-descricao">Escolha os exercícios e configure cada série. O treino fica salvo na sua biblioteca.</DialogDescription>
      </DialogoCabeca>
      <form id={formId} className="dg-corpo" onSubmit={(event) => {
        event.preventDefault();
        if (!plans.length) { setError('Adicione pelo menos um exercício.'); return; }
        if (plans.some((plan) => !validExerciseMediaUrl(plan.imageUrl) || !validExerciseMediaUrl(plan.videoUrl))) { setError('Use uma URL http/https ou um caminho de arquivo do app para a mídia.'); return; }
        if (legacyWorkout) {
          if (plans.some((plan) => !catalog.find((exercise) => exercise.id === plan.exerciseId)?.legacyId)) { setError('O catálogo deste treino está incompleto. Nenhum dado foi alterado.'); return; }
          const updated = updateWorkout(legacyWorkout.id, { name, effortLevel, scheduledAt: scheduledDate === (legacyWorkout.scheduledAt?.slice(0, 10) ?? '') ? legacyWorkout.scheduledAt : scheduledDate ? new Date(`${scheduledDate}T12:00:00`).toISOString() : '', estimatedDurationMinutes: Number(estimatedMinutes),
            exercises: plans.map((plan, order) => ({ id: plan.id, exerciseId: catalog.find((exercise) => exercise.id === plan.exerciseId)!.legacyId!, order,
              notes: plan.notes, imageUrl: plan.imageUrl, videoUrl: plan.videoUrl, muscleDistributionOverride: plan.muscleDistributionOverride,
              sets: plan.sets.map((series) => ({ id: series.id, setNumber: series.setNumber, targetLoadKg: series.targetLoadKg ?? 0,
                targetReps: series.targetReps, targetDurationSeconds: series.targetDurationSeconds, restSeconds: series.restSeconds ?? 0, loadFactor: series.loadFactor })) })) });
          if (!updated) { setError('Não foi possível salvar este treino. Confira os valores.'); return; }
          onClose(); return;
        }
        const saved = saveTemplate({ ...template, name, scheduledAt: scheduledDate === (template?.scheduledAt?.slice(0, 10) ?? '') ? template?.scheduledAt : scheduledDate ? new Date(`${scheduledDate}T12:00:00`).toISOString() : undefined, modality, source: template?.source ?? 'custom', effortLevel,
          durationEstimateMode: manualMinutes === null ? 'auto' : 'manual', estimatedDurationMinutes: Number(estimatedMinutes),
          exercises: plans.map((plan, order) => ({ ...plan, order })) });
        if (!saved) { setError('Confira o nome e use valores inteiros positivos nas repetições e nos segundos.'); return; }
        onClose();
      }}>
        <section className="dg-secao dg-dados" aria-label="Dados do treino">
          <label className="dg-campo"><span className="dg-rotulo">Nome do treino</span><input required value={name} onChange={(event) => setName(event.target.value)} className={field} placeholder="Ex.: Força e equilíbrio" maxLength={100} autoComplete="off" enterKeyHint="done" /></label>
          <label className="dg-campo"><span className="dg-rotulo">Data (opcional)</span><input type="date" className={field} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></label>
        </section>

        <section className="dg-secao" aria-labelledby={`${formId}-treino`}>
          <div className="dg-secao-cab"><h3 id={`${formId}-treino`} className="dg-secao-titulo">Seu treino</h3><span className="dg-secao-meta">{plans.length} {plans.length === 1 ? 'exercício' : 'exercícios'} · {totalSeries} {totalSeries === 1 ? 'série' : 'séries'}</span></div>
          {plans.length === 0 && <div className="dg-vazio">
            <span className="dg-vazio-sigilo" aria-hidden="true"><SigiloModalidade size={28} strokeWidth={1.55} /></span>
            <p className="dg-vazio-titulo">Seu treino começa aqui</p>
            <p className="dg-vazio-texto">Escolha um exercício no catálogo ou crie um exercício próprio. Cada um entra como uma runa, na ordem em que você o adiciona.</p>
            <button type="button" className="dg-btn" data-tipo="secundario" onClick={irAoCatalogo}><Plus size={16} aria-hidden="true" />Ver o catálogo</button>
          </div>}
          <ol className="dg-lista" aria-label="Exercícios do treino">
            {plans.map((plan, index) => {
              const aberto = !collapsedExercises.has(plan.id);
              const exercicioCatalogo = catalog.find((exercise) => exercise.id === plan.exerciseId);
              const herdada = resolveExerciseMedia({}, exercicioCatalogo, useWorkoutStore.getState().getExerciseById(exercicioCatalogo?.legacyId ?? '')).poster;
              const minutos = calculateEstimatedDuration([plan]);
              const mover = (delta: -1 | 1) => setPlans((current) => { const next = [...current]; [next[index + delta], next[index]] = [next[index], next[index + delta]]; return next; });
              return <li key={plan.id} className="dg-exercicio ds-pane" style={{ '--i': Math.min(index, 8) } as CSSProperties}>
              <div className="dg-exercicio-cab">
                <span className="dg-ordem" aria-hidden="true">{index + 1}</span>
                <h4 className="dg-exercicio-titulo"><button type="button" aria-expanded={aberto} aria-controls={`exercise-series-${plan.id}`} className="dg-exercicio-alterna" onClick={() => setCollapsedExercises((current) => toggle(current, plan.id))}>
                  <span className="dg-exercicio-nome">{plan.exerciseNameSnapshot}<small>{plan.sets.length} {plan.sets.length === 1 ? 'série' : 'séries'} · {minutos} min</small></span>
                  <ChevronDown size={18} aria-hidden="true" className="dg-seta" data-aberto={aberto || undefined} />
                </button></h4>
              </div>
              <Colapso id={`exercise-series-${plan.id}`} aberto={aberto} onInvalidCapture={(event) => { if (aberto) return; event.preventDefault(); const input = event.target as HTMLInputElement; setCollapsedExercises((current) => { const next = new Set(current); next.delete(plan.id); return next; }); requestAnimationFrame(() => input.focus()); }}>
                <div className="dg-exercicio-corpo">
                  <div className="dg-acoes" role="group" aria-label={`Ações de ${plan.exerciseNameSnapshot}`}>
                    <button type="button" disabled={index === 0} className="dg-acao" aria-label={`Mover ${plan.exerciseNameSnapshot} para cima`} onClick={() => mover(-1)}><ArrowUp size={16} aria-hidden="true" />Subir</button>
                    <button type="button" disabled={index === plans.length - 1} className="dg-acao" aria-label={`Mover ${plan.exerciseNameSnapshot} para baixo`} onClick={() => mover(1)}><ArrowDown size={16} aria-hidden="true" />Descer</button>
                    <button type="button" className="dg-acao" data-tipo="perigo" aria-label={`Remover ${plan.exerciseNameSnapshot}`} onClick={() => setPlans((current) => current.filter((item) => item.id !== plan.id))}><Trash2 size={16} aria-hidden="true" />Excluir</button>
                  </div>
                  <div className="dg-series">
                    {plan.sets.map((series) => {
                      const serieAberta = !collapsedSeries.has(series.id);
                      return <div key={series.id} className="dg-serie">
                      <div className="dg-serie-cab">
                        <button type="button" aria-expanded={serieAberta} aria-controls={`series-fields-${series.id}`} className="dg-serie-alterna" onClick={() => setCollapsedSeries((current) => toggle(current, series.id))}>
                          <span className="dg-serie-selo" aria-hidden="true">{series.setNumber}</span>
                          <span className="dg-serie-texto"><span className="dg-serie-nome">Série {series.setNumber}</span><span className="dg-serie-chips"><span className="dg-chip-valor">{series.measureMode === 'reps' ? `${series.targetReps ?? '—'} reps` : `${series.targetDurationSeconds ?? '—'}s`}</span>{(series.targetLoadKg ?? 0) > 0 && <span>{series.targetLoadKg?.toLocaleString('pt-BR')} kg</span>}<span>{series.restSeconds ?? 0}s de pausa</span>{series.loadFactor === 1.5 && <span className="dg-chip-pr">PR</span>}{series.loadFactor === 0.8 && <span>Leve</span>}</span></span>
                          <ChevronDown size={16} aria-hidden="true" className="dg-seta" data-aberto={serieAberta || undefined} />
                        </button>
                        <button type="button" disabled={plan.sets.length === 1} aria-label={`Remover série ${series.setNumber} de ${plan.exerciseNameSnapshot}`} className="dg-icone" data-tipo="perigo" onClick={() => setPlans((current) => current.map((item) => item.id !== plan.id ? item : { ...item, sets: item.sets.filter((set) => set.id !== series.id).map((set, i) => ({ ...set, setNumber: i + 1 })) }))}><Trash2 size={16} aria-hidden="true" /></button>
                      </div>
                      <Colapso id={`series-fields-${series.id}`} aberto={serieAberta} onInvalidCapture={(event) => { if (serieAberta) return; event.preventDefault(); const input = event.target as HTMLInputElement; setCollapsedSeries((current) => { const next = new Set(current); next.delete(series.id); return next; }); requestAnimationFrame(() => input.focus()); }}><div className="dg-serie-campos">
                        {series.measureMode === 'reps' ? <FitnessIntegerField label="Repetições" value={series.targetReps} onChange={(value) => updateSeries(plan.id, series.id, (set) => set.measureMode === 'reps' ? { ...set, targetReps: value } : set)} /> : <FitnessDurationField seconds={series.targetDurationSeconds} minutes={timedActivity} onChange={(value) => updateSeries(plan.id, series.id, (set) => set.measureMode === 'duration' ? { ...set, targetDurationSeconds: value } : set)} />}
                        {!timedActivity && <label className="dg-campo"><span className="dg-rotulo">Carga (kg)</span><input type="number" inputMode="decimal" min="0" step="0.1" required className={field} value={series.targetLoadKg ?? 0} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, targetLoadKg: Number(event.target.value) }))} /></label>}
                        <label className="dg-campo" data-larga={timedActivity ? undefined : ''}><span className="dg-rotulo">Descanso (segundos)</span><input type="number" inputMode="numeric" min="0" step="1" required className={field} value={series.restSeconds ?? 0} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, restSeconds: Number(event.target.value) }))} /></label>
                        <label className="dg-campo" data-larga=""><span className="dg-rotulo">Fator de carga da série</span><select className={field} value={series.loadFactor ?? 1} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 }))}><option value="0.8">Leve (×0,8)</option><option value="1">Manutenção (×1,0)</option><option value="1.5">Progressão / PR (×1,5)</option></select></label>
                      </div></Colapso>
                    </div>; })}
                    <button type="button" className="dg-btn" data-tipo="secundario" onClick={() => setPlans((current) => current.map((item) => item.id !== plan.id ? item : { ...item, sets: [...item.sets, { ...structuredClone(item.sets[item.sets.length - 1]), id: newId(), setNumber: item.sets.length + 1 }] }))}><Plus size={16} aria-hidden="true" />Adicionar série</button>
                  </div>
                  <MidiaDoExercicio key={plan.id} plan={plan} herdada={herdada} sigilo={<SigiloModalidade size={24} strokeWidth={1.55} />}
                    onChange={(patch) => setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, ...patch } : item))} />
                </div>
              </Colapso>
            </li>; })}
          </ol>
        </section>

        <details className="dg-painel" onInvalidCapture={(event) => { event.currentTarget.open = true; }}>
          <summary><SlidersHorizontal size={18} aria-hidden="true" /><span className="dg-painel-titulo">Esforço e estimativa</span><span className="dg-painel-valor">{estimatedMinutes} min</span><ChevronDown size={18} aria-hidden="true" className="dg-seta" /></summary>
          <div className="dg-painel-corpo">
            <ReguaDeEsforco value={effortLevel} onChange={setEffortLevel} />
            <label className="dg-campo"><span className="dg-rotulo">Duração estimada</span>
              <span className="dg-caixa"><input type="number" inputMode="numeric" min="0" step="1" value={estimatedMinutes} onChange={(event) => setManualMinutes(event.target.value === '' ? null : event.target.value)} className={field} /><span className="dg-unidade" aria-hidden="true">min</span></span>
              <span className="dg-nota">{manualMinutes === null ? 'Calculada pelas séries, descansos e transições.' : `Ajuste manual ativo. Estimativa automática: ${automaticMinutes} min.`} A recompensa final usa o tempo real.</span>
            </label>
            {manualMinutes !== null && <button type="button" className="dg-btn" data-tipo="secundario" onClick={() => setManualMinutes(null)}>Usar estimativa automática</button>}
            {!legacyWorkout && <div className="dg-recompensa ds-pane">
              <span className="dg-recompensa-selo" aria-hidden="true"><ElementIcon element="terra" size={40} /></span>
              <div className="dg-recompensa-leitura">
                <span className="dg-recompensa-rotulo">Prévia de recompensa · Terra</span>
                <span className="dg-recompensa-valor" aria-hidden="true"><ExperienceIcon size={24} /><Contagem valor={reward.earthXp} formatar={formatEarthXp} className="dg-recompensa-numero" /><small>XP</small></span>
                <span className="sr-only" aria-live="polite">{formatEarthXp(reward.earthXp)} XP de Terra</span>
              </div>
              <p className="dg-nota">Estimativa · {(reward.activeDurationSeconds / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min ativos nas séries · esforço {effortLevel}. A projeção usa {reward.estimatedDurationMinutes} min planejados; o ganho é consolidado por sessão.</p>
            </div>}
            {legacyWorkout && <p className="dg-projecao dg-nota">{plans.length} exercícios · {totalSeries} séries · {estimatedMinutes} min planejados. A recompensa será apresentada ao concluir a sessão.</p>}
          </div>
        </details>

        <section ref={catalogRef} className="dg-secao dg-catalogo-secao" aria-labelledby={`${formId}-catalogo`}>
          <div className="dg-secao-cab"><h3 id={`${formId}-catalogo`} className="dg-secao-titulo">Adicionar do catálogo</h3><span className="dg-secao-meta">{matches.length} {matches.length === 1 ? 'opção' : 'opções'}</span></div>
          {catalog.some((exercise) => exercise.primaryMuscles?.length) && <div role="group" aria-label="Filtrar exercícios por região muscular" className="dg-chips">
            <button type="button" title="Todos os exercícios" aria-label="Todos os exercícios" aria-pressed={!muscleFilter} onClick={() => setMuscleFilter(null)} className="dg-chip"><Grid2X2 size={18} aria-hidden="true" /><span>Todos</span></button>
            {MUSCLE_REGIONS.map((region) => <button key={region.id} type="button" title={region.label} aria-label={`Filtrar por ${region.label}`} aria-pressed={muscleFilter === region.id} onClick={() => setMuscleFilter((current) => current === region.id ? null : region.id)} className="dg-chip"><FitnessGlyph name={region.icon} size={24} /><span>{region.label}</span></button>)}
          </div>}
          <label className="dg-campo" data-tipo="busca"><span className="sr-only">Buscar exercícios</span><Search size={18} aria-hidden="true" /><input className={field} placeholder="Buscar exercício" value={search} onChange={(event) => setSearch(event.target.value)} enterKeyHint="search" autoComplete="off" /></label>
          <div className="dg-catalogo">{matches.map((exercise) => { const focus = getExercisePresentation(exercise.id, catalog); const added = plans.some((plan) => plan.exerciseId === exercise.id); return <button type="button" key={exercise.id} disabled={added} className="dg-item" data-adicionado={added || undefined} onClick={() => addExercise(exercise)}>
            <span className="dg-item-icone">{focus && <FitnessGlyph name={focus.icon} size={24} label={focus.label} />}</span>
            <span className="dg-item-nome">{exercise.name}</span>
            <span className="dg-item-acao" aria-hidden="true">{added ? <Check size={16} /> : <Plus size={16} />}</span>
          </button>; })}{matches.length === 0 && <p className="dg-sem-resultado">Nenhum exercício encontrado nesta modalidade.</p>}</div>
          {customOpen ? <CustomExerciseFields modality={modality} proposedName={search} onCancel={() => setCustomOpen(false)} onAdded={(exercise) => { addExercise(exercise); setSearch(''); setCustomOpen(false); }} /> : <button type="button" className="dg-btn" data-tipo="secundario" onClick={() => setCustomOpen(true)}><Plus size={16} aria-hidden="true" />Criar exercício</button>}
        </section>
      </form>
      <footer className="dg-pe">
        {error && <p role="alert" className="dg-erro">{error}</p>}
        <p className="dg-resumo"><span className="sr-only">{plans.length} {plans.length === 1 ? 'exercício' : 'exercícios'} · {safeMinutes} min planejados</span>
          <span aria-hidden="true"><Contagem valor={plans.length} formatar={(valor) => String(Math.round(valor))} className="dg-resumo-numero" /> {plans.length === 1 ? 'exercício' : 'exercícios'} · <Contagem valor={safeMinutes} formatar={(valor) => String(Math.round(valor))} className="dg-resumo-numero" /> min planejados</span></p>
        {dicaSalvar && <p id={`${formId}-dica`} className="dg-dica">{dicaSalvar}</p>}
        <div className="dg-pe-acoes"><button type="button" className="dg-btn" data-tipo="fantasma" onClick={onClose}>Cancelar</button><button type="submit" form={formId} className="dg-btn" data-tipo="primario" disabled={!plans.length || !name.trim()} aria-describedby={dicaSalvar ? `${formId}-dica` : undefined}>Salvar treino</button></div>
      </footer>
    </DialogContent>
  </Dialog>;
}
