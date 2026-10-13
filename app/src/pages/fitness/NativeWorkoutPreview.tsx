import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Play } from 'lucide-react';
import { toast } from 'sonner';
import { FitnessButton, FitnessCard, FitnessPageShell, FitnessStickyAction, VideoExercisePlayer, WorkoutPreviewHero, MuscleBars } from '@/components/fitness-kit';
import { NativeTemplateDialog } from '@/components/workout/NativeTemplateDialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import { resolveExerciseMedia } from '@/lib/workout/exercise-media';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { CATEGORY_LABELS } from '@/lib/workout';
import type { WorkoutTemplate } from '@/types/workout';

export function NativeWorkoutPreview({ template }: { template: WorkoutTemplate }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [actionHeight, setActionHeight] = useState<number>();
  const catalog = useWorkoutStore(state => state.nativeCatalog);
  const getLegacy = useWorkoutStore(state => state.getExerciseById);
  const active = useWorkoutStore(state => state.activeNativeSession);
  const start = useWorkoutStore(state => state.startSession);
  const reward = useWorkoutStore(state => state.previewTemplateReward)(template.id);
  const rows = [...template.exercises].sort((a, b) => a.order - b.order).map(exercise => {
    const definition = catalog.find(item => item.id === exercise.exerciseId);
    return { exercise, definition, media: resolveExerciseMedia(exercise, definition, definition?.legacyId ? getLegacy(definition.legacyId) : undefined) };
  });
  const back = `/treinos?modalidade=${template.modality ?? 'running'}`;
  const sameSession = active?.templateId === template.id;
  return <FitnessPageShell focused withFixedAction fixedActionHeight={actionHeight} showPageMap={false} flushTop bleed>
    <WorkoutPreviewHero title={template.name} heroImage={rows.find(row => row.media.poster)?.media.poster} onBack={() => navigate(back)} />
    <div className="relative -mt-8 rounded-t-[2rem] bg-fitness-canvas px-6 pt-7">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-sans text-2xl font-semibold">{template.name}</h2><p className="mt-2 text-sm text-fitness-muted">{CATEGORY_LABELS[template.modality ?? 'mixed']} · {template.estimatedDurationMinutes} min planejados</p></div><button type="button" aria-label="Editar treino" onClick={() => setEditing(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fitness-surface text-fitness-primary focus-visible:ring-2 focus-visible:ring-fitness-primary"><Pencil size={19} /></button></div>
      {template.scheduledAt && <p className="mt-3 text-sm text-fitness-muted">Planejado para {new Date(template.scheduledAt).toLocaleDateString('pt-BR')}</p>}
      {reward && <p className="mt-5 rounded-2xl bg-fitness-surface p-4 text-sm leading-relaxed"><span className="font-semibold text-fitness-green">{formatEarthXp(reward.earthXp)} XP Terra</span><span className="mt-1 block text-fitness-muted">Estimativa das séries planejadas. Sua recompensa usa apenas o que você concluir.</span></p>}
      <h3 className="mt-7 font-sans text-xl font-semibold">Seu programa</h3><p className="mt-2 text-sm text-fitness-muted">{rows.length} exercícios · {rows.reduce((sum, row) => sum + row.exercise.sets.length, 0)} séries ou blocos. Abra para ver os detalhes.</p>
      <div className="mt-5 space-y-4">{rows.map(({ exercise, definition, media }, index) => <FitnessCard key={exercise.id} className="overflow-hidden p-4">
        <details open={rows.length === 1}>
          <summary className="min-h-11 cursor-pointer rounded-lg text-base font-medium focus-visible:ring-2 focus-visible:ring-fitness-primary"><span className="break-words">{index + 1}. {exercise.exerciseNameSnapshot}</span><span className="mt-1 block text-sm font-normal text-fitness-muted">{exercise.sets.length} séries ou blocos</span></summary>
          <div className="mt-4 space-y-4"><VideoExercisePlayer title={exercise.exerciseNameSnapshot} {...media} />
            <ol className="divide-y divide-white/10">{exercise.sets.map(set => <li key={set.id} className="py-3 text-sm text-fitness-text-soft">{set.setNumber}. {set.measureMode === 'reps' ? `${set.targetReps ?? 0} repetições` : `${((set.targetDurationSeconds ?? 0) / 60).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} min`}{set.targetLoadKg ? ` · ${set.targetLoadKg} kg` : ''}<span className="block text-fitness-muted">{set.restSeconds ?? 0}s de descanso</span></li>)}</ol>
            {!!definition?.instructions.length && <div><h4 className="font-sans text-sm font-semibold">Como executar</h4><ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-fitness-muted">{definition.instructions.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol></div>}
            {exercise.notes && <p className="whitespace-pre-wrap break-words text-sm text-fitness-muted">{exercise.notes}</p>}
            <MuscleBars distribution={exercise.muscleDistributionOverride ?? exercise.muscleDistribution ?? []} emptyMessage="Perfil muscular não informado." />
          </div>
        </details>
      </FitnessCard>)}</div>
      {active && !sameSession && <FitnessButton variant="secondary" className="mt-5 w-full" onClick={() => navigate(`/fitness/ativo/${active.id}`)}>Retomar treino em andamento</FitnessButton>}
    </div>
    <FitnessStickyAction focused onHeightChange={setActionHeight}><FitnessButton className="w-full" disabled={!rows.length || (!!active && !sameSession)} onClick={() => {
      if (active && sameSession) { navigate(`/fitness/ativo/${active.id}`); return; }
      const session = start(template.id);
      if (session) navigate(`/fitness/ativo/${session.id}`); else toast.error('Não foi possível iniciar. Confira a sessão em andamento.');
    }}><Play size={19} />{sameSession ? 'Continuar treino' : 'Iniciar treino'}</FitnessButton></FitnessStickyAction>
    {editing && <NativeTemplateDialog template={template} catalog={catalog.filter(item => item.modality === template.modality)} modality={template.modality} onClose={() => setEditing(false)} />}
  </FitnessPageShell>;
}
