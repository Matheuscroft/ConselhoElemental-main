/**
 * WorkoutHub — Fitness UI Kit "Select Workout" + hub page.
 *
 * Replaces the old visual layer while reusing EXACTLY the same store calls
 * from useWorkoutStore (no logic changes, no new stores).
 *
 * Flow:
 *   1. User sees planned workouts as category cards in a 2-col grid.
 *   2. Selects one → Start button activates.
 *   3. Tap Start → WorkoutPreview → startWorkout() → navigate to active session.
 *   4. If active session exists → banner to resume.
 *   5. Exercise catalog (?source=yoga|calistenia, ?exercise=<id>) and history sheet.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Flame,
  Flower2,
  PersonStanding,
  Waves,
  HeartPulse,
  Shapes,
  Sparkles,
  Plus,
  History,
  Activity,
  LayoutGrid,
  Gem,
  Star,
  Swords,
  Trophy,
} from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessButton,
  WorkoutCategoryCard,
  FitnessCard,
  FitnessIconBadge,
  FitnessBottomNav,
} from '@/components/fitness';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CreateWorkoutDialog, ExerciseDetailSheet } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  formatVolume,
  formatWorkoutDateTime,
} from '@/lib/workout';
import type { WorkoutExercise, WorkoutExerciseCategory } from '@/types/workout';
import type { LucideIcon } from 'lucide-react';
import { formatDurationCompact } from '@/lib/fitness/fitness-format';

const CATEGORY_ICON_MAP: Record<WorkoutExerciseCategory, LucideIcon> = {
  strength: Dumbbell,
  hypertrophy: Flame,
  calisthenics: PersonStanding,
  yoga: Flower2,
  mobility: Waves,
  conditioning: HeartPulse,
  mixed: Shapes,
  custom: Sparkles,
};

/** Alternate card heights for staggered masonry feel */
const TALL_CATEGORIES: WorkoutExerciseCategory[] = ['strength', 'yoga', 'custom'];

export const WorkoutHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    getExerciseCatalog,
    getPlannedWorkouts,
    getCompletedWorkouts,
    getActiveSession,
    getWorkoutHistory,
    getWorkoutStats,
    getStrengthStat,
    getEarthPoints,
    getAverageRating,
  } = useWorkoutStore();

  const catalog = getExerciseCatalog();
  const plannedWorkouts = getPlannedWorkouts();
  const activeSession = getActiveSession();
  const stats = getWorkoutStats();
  const strengthStat = getStrengthStat();
  const earthPoints = getEarthPoints();
  const averageRating = getAverageRating();
  const historySessions = useMemo(() => getWorkoutHistory(), [getWorkoutHistory]);

  const [createOpen, setCreateOpen] = useState(false);
  const [createPresetExerciseId, setCreatePresetExerciseId] = useState<string | undefined>(undefined);
  const [createDefaultCategory, setCreateDefaultCategory] = useState<WorkoutExerciseCategory | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pickedCategory, setPickedCategory] = useState<WorkoutExerciseCategory | null | undefined>(undefined);

  const sourceParam = searchParams.get('source');
  const exerciseParam = searchParams.get('exercise');
  const createRequestedByNav = searchParams.get('novo') === '1';

  // Compatibilidade com as rotas antigas de Yoga/Calistenia (?source=yoga|calistenia).
  const sourceCategory: WorkoutExerciseCategory | null =
    sourceParam === 'yoga' ? 'yoga' : sourceParam === 'calistenia' ? 'calisthenics' : null;
  const selectedCategory = pickedCategory === undefined ? sourceCategory : pickedCategory;
  const setSelectedCategory = setPickedCategory;

  const detailExercise = useMemo<WorkoutExercise | null>(() => {
    if (!exerciseParam) return null;
    return catalog.find((item) => item.legacyId === exerciseParam || item.id === exerciseParam) ?? null;
  }, [catalog, exerciseParam]);

  const availableCategories = useMemo(
    () => ALL_CATEGORIES.filter((category) => catalog.some((item) => item.category === category)),
    [catalog]
  );

  const filteredCatalog = useMemo(
    () => (selectedCategory ? catalog.filter((item) => item.category === selectedCategory) : catalog),
    [catalog, selectedCategory]
  );

  const handleOpenExercise = (exercise: WorkoutExercise) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('exercise', exercise.legacyId ?? exercise.id);
      return next;
    });
  };

  const handleExerciseDetailOpenChange = (open: boolean) => {
    if (open) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('exercise');
        return next;
      },
      { replace: true }
    );
  };

  const handleAddToWorkout = (exercise: WorkoutExercise) => {
    handleExerciseDetailOpenChange(false);
    setCreatePresetExerciseId(exercise.id);
    setCreateDefaultCategory(exercise.category);
    setCreateOpen(true);
  };

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open);
    if (open || !createRequestedByNav) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('novo');
        return next;
      },
      { replace: true }
    );
  };

  const openCreateDialog = () => {
    setCreatePresetExerciseId(undefined);
    setCreateDefaultCategory(selectedCategory ?? undefined);
    setCreateOpen(true);
  };

  const handleSelectCategory = (workoutId: string) => {
    navigate(`/treinos/preview/${workoutId}`);
  };

  return (
    <FitnessPageShell navOffset className="max-w-md mx-auto w-full">
      <FitnessHeader
        title="Select Workout"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/mapa')}
              aria-label="Mapa de páginas do app"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-fitness-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            >
              <LayoutGrid className="w-5 h-5 text-fitness-muted" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/treinos/corpo')}
              aria-label="Dashboard corporal"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-fitness-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            >
              <Activity className="w-5 h-5 text-fitness-muted" />
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              aria-label="Histórico de treinos"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-fitness-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            >
              <History className="w-5 h-5 text-fitness-muted" />
            </button>
            <button
              type="button"
              onClick={openCreateDialog}
              aria-label="Criar novo treino"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-fitness-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            >
              <Plus className="w-5 h-5 text-fitness-muted" />
            </button>
          </div>
        }
      />

      {/* Resume active session banner */}
      {activeSession && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/treinos/ativo/${activeSession.id}`)}
          className="w-full flex items-center gap-3 rounded-[18px] bg-fitness-primary/15 border border-fitness-primary/40 px-4 py-3 mb-4 text-left hover:bg-fitness-primary/20 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-fitness-primary/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-fitness-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-fitness-text truncate">
              {activeSession.workoutNameSnapshot}
            </p>
            <p className="text-[12px] text-fitness-primary">Sessão em andamento · toque para continuar</p>
          </div>
        </motion.button>
      )}

      {/* Stats */}
      <FitnessCard className="grid grid-cols-2 gap-4 py-4 px-5 mb-4">
        {[
          { key: 'strength', icon: Swords, value: strengthStat, label: 'Força' },
          { key: 'earth', icon: Gem, value: Math.round(earthPoints), label: 'Terra acumulado' },
          { key: 'rating', icon: Star, value: averageRating > 0 ? averageRating.toFixed(1) : '—', label: 'Avaliação média' },
          { key: 'done', icon: Trophy, value: stats.completedWorkouts, label: 'Treinos concluídos' },
        ].map(({ key, icon: StatIcon, value, label }) => (
          <div key={key} className="flex items-center gap-2.5">
            <StatIcon className="w-4 h-4 text-fitness-primary shrink-0" aria-hidden="true" />
            <div>
              <p className="text-[15px] font-semibold text-fitness-text leading-tight">{value}</p>
              <p className="text-[11px] text-fitness-muted">{label}</p>
            </div>
          </div>
        ))}
      </FitnessCard>

      {/* Workout grid */}
      <div className="mt-6 mb-8">
        {plannedWorkouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Dumbbell className="w-12 h-12 text-fitness-disabled" aria-hidden="true" />
            <p className="text-fitness-muted text-center text-[15px]">
              Nenhum treino planejado ainda.
            </p>
            <FitnessButton variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              Criar meu primeiro treino
            </FitnessButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {plannedWorkouts.map((workout) => {
              const Icon = CATEGORY_ICON_MAP[workout.category] ?? Dumbbell;
              const isTall = TALL_CATEGORIES.includes(workout.category);
              return (
                <WorkoutCategoryCard
                  key={workout.id}
                  icon={Icon}
                  label={workout.name}
                  onClick={() => handleSelectCategory(workout.id)}
                  tall={isTall}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Recently completed - compact list */}
      {getCompletedWorkouts().length > 0 && (
        <div className="mb-6">
          <p className="text-[13px] text-fitness-muted mb-3">Concluídos recentemente</p>
          <div className="space-y-2">
            {getCompletedWorkouts()
              .slice(0, 3)
              .map((w) => {
                const Icon = CATEGORY_ICON_MAP[w.category] ?? Dumbbell;
                return (
                  <button
                    key={w.id}
                    type="button"
                    disabled={!w.lastSessionId}
                    onClick={() => w.lastSessionId && navigate(`/treinos/resumo/${w.lastSessionId}`)}
                    className="w-full text-left rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
                  >
                    <FitnessCard className="flex items-center gap-3 py-3 px-4">
                      <FitnessIconBadge icon={Icon} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-fitness-text truncate">{w.name}</p>
                        <p className="text-[12px] text-fitness-muted">
                          {formatDurationCompact(w.estimatedDurationMinutes)}
                        </p>
                      </div>
                      <span className="text-[12px] text-fitness-primary font-medium">Concluído</span>
                    </FitnessCard>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Exercise catalog */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] text-fitness-muted">
            {selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'Catálogo de exercícios'}
          </p>
          <span className="text-[12px] text-fitness-muted">{filteredCatalog.length}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {[null, ...availableCategories].map((category) => (
            <button
              key={category ?? 'all'}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-fitness-primary/20 text-fitness-primary border border-fitness-primary/50'
                  : 'bg-fitness-surface-hover text-fitness-muted border border-transparent hover:text-fitness-text'
              }`}
            >
              {category ? CATEGORY_LABELS[category] : 'Todos'}
            </button>
          ))}
        </div>
        {filteredCatalog.length === 0 ? (
          <p className="text-[13px] text-fitness-muted text-center py-4">
            Nenhum exercício disponível nesta categoria.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredCatalog.map((exercise) => {
              const Icon = CATEGORY_ICON_MAP[exercise.category] ?? Dumbbell;
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => handleOpenExercise(exercise)}
                  className="w-full text-left rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
                >
                  <FitnessCard className="flex items-center gap-3 py-3 px-4">
                    <FitnessIconBadge icon={Icon} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-fitness-text truncate">{exercise.name}</p>
                      <p className="text-[12px] text-fitness-muted truncate">
                        {exercise.focus ?? CATEGORY_LABELS[exercise.category]}
                      </p>
                    </div>
                  </FitnessCard>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <CreateWorkoutDialog
        open={createOpen || createRequestedByNav}
        onOpenChange={handleCreateOpenChange}
        defaultCategory={createDefaultCategory}
        presetExerciseId={createPresetExerciseId}
      />

      <ExerciseDetailSheet
        exercise={detailExercise}
        open={Boolean(detailExercise)}
        onOpenChange={handleExerciseDetailOpenChange}
        onAddToWorkout={handleAddToWorkout}
      />

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="bg-fitness-canvas border-fitness-surface-hover w-full sm:max-w-md overflow-y-auto text-fitness-text">
          <SheetHeader>
            <SheetTitle className="text-fitness-text">Histórico de treinos</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-2">
            {historySessions.length === 0 ? (
              <p className="text-sm text-fitness-muted">Nenhuma sessão registrada ainda.</p>
            ) : (
              historySessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    navigate(session.status === 'in_progress' ? `/treinos/ativo/${session.id}` : `/treinos/resumo/${session.id}`);
                  }}
                  className="w-full flex items-center justify-between gap-2 rounded-2xl bg-fitness-surface px-3 py-2.5 text-left hover:bg-fitness-surface-hover transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] text-fitness-text truncate">{session.workoutNameSnapshot}</p>
                    <p className="text-[12px] text-fitness-muted">{formatWorkoutDateTime(session.startedAt)}</p>
                  </div>
                  {session.status === 'completed' && (
                    <span className="text-[12px] text-fitness-primary font-mono shrink-0">{formatVolume(session.totalVolume)}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
