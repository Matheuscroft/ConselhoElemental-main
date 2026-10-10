import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RunningReferenceIcon, CoreReferenceIcon, SwimmingReferenceIcon, MartialArtsReferenceIcon, YogaReferenceIcon, CyclingReferenceIcon } from '@/components/fitness-kit/WorkoutReferenceIcons';
import { Play } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import {
  FitnessButton,
  FitnessCategoryGrid,
  FitnessEmptyState,
  FitnessHeader,
  FitnessListRow,
  FitnessPageShell,
  SectionHeader,
  type CategoryOption,
} from '@/components/fitness-kit';
import { CreateWorkoutDialog, ExerciseDetailSheet } from '@/components/workout';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Workout, WorkoutExercise, WorkoutExerciseCategory } from '@/types/workout';

const EXERCISE_PREVIEW_LIMIT = 6;

/** Compatibilidade com os antigos módulos de Yoga/Calistenia (?source=yoga|calistenia). */
const SOURCE_TO_CATEGORY: Record<string, WorkoutExerciseCategory> = {
  yoga: 'yoga',
  calistenia: 'calisthenics',
};

const byNextScheduled = (left: Workout, right: Workout): number => {
  const leftTime = left.scheduledAt ? new Date(left.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
  const rightTime = right.scheduledAt ? new Date(right.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
  if (leftTime !== rightTime) return leftTime - rightTime;
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
};

export const WorkoutSelect: React.FC = () => {
  const navigate = useNavigate();
  const createdWorkout = useRef<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const catalog = useWorkoutStore(useShallow((state) => state.getExerciseCatalog()));
  const plannedWorkouts = useWorkoutStore(useShallow((state) => state.getPlannedWorkouts()));
  const strength = useWorkoutStore((state) => state.getStrengthStat());
  const earth = useWorkoutStore((state) => state.getEarthPoints());
  const averageRating = useWorkoutStore((state) => state.getAverageRating());
  const completedCount = useWorkoutStore((state) => state.getCompletedWorkouts().length);
  const activeSession = useWorkoutStore((state) => state.getActiveSession());

  const sourceParam = searchParams.get('source');
  const exerciseParam = searchParams.get('exercise');
  const createParam = searchParams.get('novo') === '1';

  // Seleção do usuário sobrepõe o filtro vindo da URL (?source=). `undefined` = ainda não escolheu.
  const [userCategory, setUserCategory] = useState<WorkoutExerciseCategory | null | undefined>(undefined);
  const selectedCategory: WorkoutExerciseCategory | null =
    userCategory !== undefined ? userCategory : sourceParam ? SOURCE_TO_CATEGORY[sourceParam] ?? null : 'running';
  const [createRequested, setCreateRequested] = useState(false);
  const [createPresetExerciseId, setCreatePresetExerciseId] = useState<string | undefined>(undefined);
  const [showAllExercises, setShowAllExercises] = useState(false);
  const createOpen = createRequested || createParam;

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const counts = new Map<WorkoutExerciseCategory, number>();
    catalog.forEach((exercise) => counts.set(exercise.category, (counts.get(exercise.category) ?? 0) + 1));
    const reference: CategoryOption[] = [
      { id: 'running', label: 'Corrida', icon: RunningReferenceIcon },
      { id: 'calisthenics', label: 'Calistenia', icon: CoreReferenceIcon },
      { id: 'swimming', label: 'Natação', icon: SwimmingReferenceIcon },
      { id: 'martial_arts', label: 'Artes marciais', icon: MartialArtsReferenceIcon },
      { id: 'yoga', label: 'Yoga', icon: YogaReferenceIcon },
      { id: 'cycling', label: 'Ciclismo', icon: CyclingReferenceIcon },
    ];
    const shown = new Set(reference.map((option) => option.id));
    return [...reference, ...Array.from(counts.keys()).filter((category) => !shown.has(category)).map((category) => ({ id: category, label: CATEGORY_LABELS[category], icon: CATEGORY_ICONS[category] }))];
  }, [catalog]);

  const visibleWorkouts = useMemo(
    () => plannedWorkouts.filter((workout) => !selectedCategory || workout.category === selectedCategory).sort(byNextScheduled),
    [plannedWorkouts, selectedCategory]
  );

  const visibleExercises = useMemo(
    () => catalog.filter((exercise) => !selectedCategory || exercise.category === selectedCategory),
    [catalog, selectedCategory]
  );
  const shownExercises = showAllExercises ? visibleExercises : visibleExercises.slice(0, EXERCISE_PREVIEW_LIMIT);

  const detailExercise = useMemo<WorkoutExercise | null>(() => {
    if (!exerciseParam) return null;
    return catalog.find((item) => item.legacyId === exerciseParam || item.id === exerciseParam) ?? null;
  }, [catalog, exerciseParam]);

  const updateParams = (mutate: (next: URLSearchParams) => void) =>
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        mutate(next);
        return next;
      },
      { replace: true }
    );

  const handleCreateOpenChange = (open: boolean) => {
    setCreateRequested(open);
    if (!open && createdWorkout.current) {
      const id = createdWorkout.current;
      createdWorkout.current = null;
      navigate(`/treinos/preview/${id}`);
      return;
    }
    if (!open) {
      setCreatePresetExerciseId(undefined);
      if (createParam) updateParams((next) => next.delete('novo'));
    }
  };

  const handleStart = () => {
    if (!selectedCategory) return;
    const next = visibleWorkouts[0];
    if (next) {
      navigate(`/treinos/preview/${next.id}`);
      return;
    }
    setCreateRequested(true);
  };

  const handleOpenExercise = (exercise: WorkoutExercise) =>
    updateParams((next) => next.set('exercise', exercise.legacyId ?? exercise.id));

  const handleExerciseDetailOpenChange = (open: boolean) => {
    if (!open) updateParams((next) => next.delete('exercise'));
  };

  const handleAddToWorkout = (exercise: WorkoutExercise) => {
    handleExerciseDetailOpenChange(false);
    setCreatePresetExerciseId(exercise.id);
    setUserCategory(exercise.category);
    setCreateRequested(true);
  };

  return (
    <FitnessPageShell focused>
      <FitnessHeader className="[&_h1]:text-2xl min-[390px]:[&_h1]:text-[28px]" title={FITNESS_COPY.selectTitle} onBack={() => navigate('/santuario')} backLabel="Voltar para o Santuário" />

      <div className="mt-12">
        {categoryOptions.length === 0 ? (
          <FitnessEmptyState message="Nenhum exercício disponível no catálogo." />
        ) : (
          <FitnessCategoryGrid
            options={categoryOptions}
            selectedId={selectedCategory}
            onSelect={(id) => { setUserCategory(selectedCategory === id ? null : (id as WorkoutExerciseCategory)); setShowAllExercises(false); }}
            ariaLabel="Categorias de treino"
          />
        )}
      </div>

      {/* Sessão ativa - continuar treino - sempre visível quando existe */}
      {activeSession && (
        <div className="mt-8">
          <FitnessListRow
            icon={Play}
            title={activeSession.workoutNameSnapshot}
            subtitle="Sessão em andamento · continuar"
            onClick={() => navigate(`/treinos/ativo/${activeSession.id}`)}
            ariaLabel={`Continuar treino ${activeSession.workoutNameSnapshot}`}
          />
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 px-4">
        <p id="workout-selection-hint" className="text-center text-sm text-fitness-muted" aria-live="polite">
          {selectedCategory ? visibleExercises.length > 0 ? `${CATEGORY_LABELS[selectedCategory]} · ${visibleExercises.length} exercícios disponíveis` : `${CATEGORY_LABELS[selectedCategory]} · Monte um treino escolhendo exercícios do catálogo.` : 'Escolha uma categoria para montar seu treino.'}
        </p>
        <FitnessButton className="w-full max-w-[24rem]" aria-describedby="workout-selection-hint" disabled={!selectedCategory} onClick={handleStart}>
          {selectedCategory && visibleWorkouts.length === 0 ? 'Montar treino' : selectedCategory ? 'Ver treino' : FITNESS_COPY.start}
        </FitnessButton>
      </div>

      {/* Meus treinos planejados - compacto */}
      {visibleWorkouts.length > 0 && (
        <section className="mt-14" aria-label={FITNESS_COPY.myWorkouts}>
          <SectionHeader title={FITNESS_COPY.myWorkouts} />
          <div className="mt-5 space-y-4">
            {visibleWorkouts.map((workout) => {
              const Icon = CATEGORY_ICONS[workout.category] ?? CATEGORY_ICONS.mixed;
              return (
                <FitnessListRow
                  key={workout.id}
                  icon={Icon}
                  title={workout.name}
                  subtitle={`${formatMinutes(workout.estimatedDurationMinutes)} · ${workout.exercises.length} ${workout.exercises.length === 1 ? 'exercício' : 'exercícios'}`}
                  onClick={() => navigate(`/treinos/preview/${workout.id}`)}
                  ariaLabel={`Abrir treino ${workout.name}`}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Acesso a progresso, exercícios e criação - compactado no rodapé */}
      <details className="mt-14 rounded-fit bg-fitness-surface-alt p-5">
        <summary className="cursor-pointer rounded-lg font-medium text-fitness-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-fitness-primary">
          Mais opções
        </summary>

        <div className="mt-5 space-y-6">
          {/* Progresso compacto */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-fitness-muted">Meu progresso</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm" aria-label="Progresso de treinos">
              {[['Força', strength], ['Terra', earth], ['Avaliação', averageRating > 0 ? averageRating.toFixed(1) : '—'], ['Concluídos', completedCount]].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-fitness-muted">{label}</dt>
                  <dd className="text-base font-semibold text-fitness-text">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Ações rápidas */}
          <div className="space-y-2">
            <FitnessButton
              size="md"
              variant="secondary"
              onClick={() => setCreateRequested(true)}
              className="w-full"
            >
              {FITNESS_COPY.newWorkout}
            </FitnessButton>

            <FitnessButton
              size="md"
              variant="secondary"
              onClick={() => setShowAllExercises(!showAllExercises)}
              className="w-full"
            >
              {showAllExercises ? 'Ocultar exercícios' : 'Ver catálogo de exercícios'}
            </FitnessButton>
          </div>

          {/* Catálogo de exercícios - condicional */}
          {showAllExercises && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-fitness-muted">
                {FITNESS_COPY.exercises}
                {selectedCategory && ` · ${CATEGORY_LABELS[selectedCategory]}`}
              </h3>
              <div className="space-y-2">
                {shownExercises.length === 0 ? (
                  <p className="text-sm text-fitness-muted">Nenhum exercício disponível nesta categoria.</p>
                ) : (
                  shownExercises.map((exercise) => {
                    const Icon = CATEGORY_ICONS[exercise.category] ?? CATEGORY_ICONS.mixed;
                    return (
                      <FitnessListRow
                        key={exercise.id}
                        icon={Icon}
                        title={exercise.name}
                        subtitle={exercise.focus ?? CATEGORY_LABELS[exercise.category]}
                        onClick={() => handleOpenExercise(exercise)}
                        ariaLabel={`Ver detalhes de ${exercise.name}`}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </details>


      <CreateWorkoutDialog
        open={createOpen}
        onOpenChange={handleCreateOpenChange}
        defaultCategory={selectedCategory ?? undefined}
        presetExerciseId={createPresetExerciseId}
        onCreated={(workout) => { createdWorkout.current = workout.id; }}
      />

      <ExerciseDetailSheet
        variant="fitness"
        exercise={detailExercise}
        open={Boolean(detailExercise)}
        onOpenChange={handleExerciseDetailOpenChange}
        onAddToWorkout={handleAddToWorkout}
      />
    </FitnessPageShell>
  );
};
