import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Pencil, Play } from 'lucide-react';
import { toast } from 'sonner';
import { FitnessButton, FitnessPageShell, WorkoutPreviewHero, MuscleBars } from '@/components/fitness-kit';
import { MidiaDoExercicio } from '@/components/fitness-kit/midia-exercicio';
import { TreinoBarraAcao } from '@/components/fitness-kit/treino-barra';
import { TreinoCena } from '@/components/fitness-kit/treino-cena';
import { NumeroQueConta } from '@/components/fitness-kit/treino-numero';
import '@/components/fitness-kit/treino-uau.css';
import { NativeTemplateDialog } from '@/components/workout/NativeTemplateDialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import { resolveExerciseMedia } from '@/lib/workout/exercise-media';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { CATEGORY_LABELS } from '@/lib/workout';
import type { WorkoutTemplate } from '@/types/workout';

const indice = (valor: number) => ({ '--i': valor } as CSSProperties);

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
  const totalSets = rows.reduce((sum, row) => sum + row.exercise.sets.length, 0);
  return <FitnessPageShell focused withFixedAction fixedActionHeight={actionHeight} showPageMap={false} flushTop bleed>
    <TreinoCena>
    <WorkoutPreviewHero
      title={template.name}
      heroImage={rows.find(row => row.media.poster)?.media.poster}
      onBack={() => navigate(back)}
      action={<button type="button" aria-label="Editar treino" onClick={() => setEditing(true)} className="treino-voltar"><Pencil size={20} aria-hidden="true" /></button>}
    >
      <li className="treino-chip">{CATEGORY_LABELS[template.modality ?? 'mixed']}</li>
      <li className="treino-chip treino-chip--xp">{template.estimatedDurationMinutes} min planejados</li>
      <li className="treino-chip">{rows.length} {rows.length === 1 ? 'exercício' : 'exercícios'} · {totalSets} {totalSets === 1 ? 'série' : 'séries'}</li>
      {reward && <li className="treino-chip treino-chip--xp" aria-label={`Cerca de ${formatEarthXp(reward.earthXp)} XP de Terra previstos`}><span aria-hidden="true">≈ <NumeroQueConta texto={formatEarthXp(reward.earthXp)} atraso={240} /> XP de Terra</span></li>}
    </WorkoutPreviewHero>
    <div className="treino-corpo">
      {template.scheduledAt && <p className="treino-corpo-nota treino-entra" style={indice(2)}>Planejado para {new Date(template.scheduledAt).toLocaleDateString('pt-BR')}</p>}
      {reward && <p className="treino-corpo-nota treino-entra" style={indice(2)}>Estimativa das séries planejadas. Sua recompensa usa apenas o que você concluir.</p>}
      <h2 className="treino-secao treino-entra" style={indice(3)}>Seu programa</h2>
      <p className="treino-corpo-nota treino-entra" style={indice(3)}>Abra um exercício para ver os detalhes.</p>
      <div className="treino-lista">{rows.map(({ exercise, definition, media }, index) => <details key={exercise.id} className="treino-runa ds-pane treino-entra" style={indice(index + 3)} open={rows.length === 1}>
          <summary>
            <span className="treino-runa-num" aria-hidden="true">{index + 1}</span>
            <span className="treino-runa-texto">
              <span className="treino-runa-titulo">{exercise.exerciseNameSnapshot}</span>
              <span className="treino-runa-sub">{exercise.sets.length} séries ou blocos</span>
            </span>
            <ChevronDown className="treino-runa-seta" size={22} aria-hidden="true" />
          </summary>
          <div className="treino-runa-detalhe"><MidiaDoExercicio title={exercise.exerciseNameSnapshot} {...media} exercicio={definition ?? { name: exercise.exerciseNameSnapshot, category: template.modality }} />
            <ol className="divide-y divide-white/10">{exercise.sets.map(set => <li key={set.id} className="py-3 text-base text-fitness-text-soft">{set.setNumber}. {set.measureMode === 'reps' ? `${set.targetReps ?? 0} repetições` : `${((set.targetDurationSeconds ?? 0) / 60).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} min`}{set.targetLoadKg ? ` · ${set.targetLoadKg} kg` : ''}<span className="block text-sm text-fitness-muted">{set.restSeconds ?? 0}s de descanso</span></li>)}</ol>
            {!!definition?.instructions.length && <div><h4 className="font-sans text-base font-semibold">Como executar</h4><ol className="mt-2 list-inside list-decimal space-y-2 text-sm leading-relaxed text-fitness-muted">{definition.instructions.map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}</ol></div>}
            {exercise.notes && <p className="whitespace-pre-wrap break-words text-sm text-fitness-muted">{exercise.notes}</p>}
            <MuscleBars distribution={exercise.muscleDistributionOverride ?? exercise.muscleDistribution ?? []} emptyMessage="Perfil muscular não informado." />
          </div>
        </details>)}</div>
      {active && !sameSession && <FitnessButton variant="secondary" className="mt-5 w-full" onClick={() => navigate(`/fitness/ativo/${active.id}`)}>Retomar treino em andamento</FitnessButton>}
    </div>
    </TreinoCena>
    <TreinoBarraAcao onHeightChange={setActionHeight}><button type="button" className="treino-acao treino-acao--principal w-full" disabled={!rows.length || (!!active && !sameSession)} onClick={() => {
      if (active && sameSession) { navigate(`/fitness/ativo/${active.id}`); return; }
      const session = start(template.id);
      if (session) navigate(`/fitness/ativo/${session.id}`); else toast.error('Não foi possível iniciar. Confira a sessão em andamento.');
    }}><Play size={22} aria-hidden="true" />{sameSession ? 'Continuar treino' : 'Iniciar treino'}</button></TreinoBarraAcao>
    {editing && <NativeTemplateDialog template={template} catalog={catalog.filter(item => item.modality === template.modality)} modality={template.modality} onClose={() => setEditing(false)} />}
  </FitnessPageShell>;
}
