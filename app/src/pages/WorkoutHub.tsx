<<<<<<< HEAD
/**
 * WorkoutHub — Fitness UI Kit "Select Workout" + hub page.
 *
 * Replaces the old visual layer while reusing EXACTLY the same store calls
 * from useWorkoutStore (no logic changes, no new stores).
 *
 * Flow:
 *   1. User sees planned workouts as category cards in a 2-col grid.
 *   2. Selects one → Start button activates.
 *   3. Tap Start → startWorkout() → navigate to active session.
 *   4. If active session exists → banner to resume.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessButton,
  WorkoutCategoryCard,
  FitnessCard,
  FitnessIconBadge,
} from '@/components/fitness';
import { CreateWorkoutDialog } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { CATEGORY_LABELS } from '@/lib/workout';
import type { WorkoutExerciseCategory } from '@/types/workout';
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

  const {
    getPlannedWorkouts,
    getCompletedWorkouts,
    getActiveSession,
    getWorkoutHistory,
    startWorkout,
  } = useWorkoutStore();

  const plannedWorkouts = getPlannedWorkouts();
  const activeSession = getActiveSession();
  const history = useMemo(() => getWorkoutHistory().slice(0, 5), [getWorkoutHistory]);

  const [createOpen, setCreateOpen] = useState(false);

  const handleSelectCategory = (workoutId: string) => {
    navigate(`/treinos/preview/${workoutId}`);
  };

  return (
    <FitnessPageShell ctaOffset className="max-w-md mx-auto w-full">
      <FitnessHeader
        title="Select Workout"
        onBack={() => navigate(-1)}
        rightAction={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/treinos/corpo')}
              aria-label="Dashboard de saúde e histórico"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-fitness-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            >
              <History className="w-5 h-5 text-fitness-muted" />
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
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
=======
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Gem, History, Play, Plus, Star, Swords, Trophy } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  BodyTrackingCard,
  CreateWorkoutDialog,
  ExerciseDetailSheet,
  WorkoutCategoryGrid,
  WorkoutListCard,
} from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatVolume, formatWorkoutDateTime } from '@/lib/workout';
import type { Workout, WorkoutExercise, WorkoutExerciseCategory } from '@/types/workout';

export const WorkoutHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    getExerciseCatalog,
    getPlannedWorkouts,
    getCompletedWorkouts,
    getWorkoutHistory,
    getWorkoutStats,
    getActiveSession,
    getStrengthStat,
    getEarthPoints,
    getAverageRating,
    getSessionById,
    getSessionRating,
    startWorkout,
  } = useWorkoutStore();

  const catalog = getExerciseCatalog();
  const plannedWorkouts = getPlannedWorkouts();
  const stats = getWorkoutStats();
  const activeSession = getActiveSession();
  const strengthStat = getStrengthStat();
  const earthPoints = getEarthPoints();
  const averageRating = getAverageRating();

  const recentCompleted = useMemo(
    () =>
      getCompletedWorkouts()
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getCompletedWorkouts, stats.completedWorkouts]
  );

  const [selectedCategory, setSelectedCategory] = useState<WorkoutExerciseCategory | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createPresetExerciseId, setCreatePresetExerciseId] = useState<string | undefined>(undefined);
  const [createDefaultCategory, setCreateDefaultCategory] = useState<WorkoutExerciseCategory | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);

  const sourceParam = searchParams.get('source');
  const exerciseParam = searchParams.get('exercise');

  // Compatibilidade com os antigos módulos de Yoga/Calistenia (?source=yoga|calistenia).
  useEffect(() => {
    if (sourceParam === 'yoga') setSelectedCategory('yoga');
    if (sourceParam === 'calistenia') setSelectedCategory('calisthenics');
  }, [sourceParam]);

  const detailExercise = useMemo<WorkoutExercise | null>(() => {
    if (!exerciseParam) return null;
    return catalog.find((item) => item.legacyId === exerciseParam || item.id === exerciseParam) ?? null;
  }, [catalog, exerciseParam]);

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

  const handleWorkoutAction = (workout: Workout) => {
    if (workout.status === 'completed') {
      if (workout.lastSessionId) navigate(`/treinos/resumo/${workout.lastSessionId}`);
      return;
    }
    const session = startWorkout(workout.id);
    if (session) navigate(`/treinos/ativo/${session.id}`);
  };

  const historySessions = useMemo(() => getWorkoutHistory(), [getWorkoutHistory]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-mystic text-xl">Treinos</h2>
          <p className="text-sm text-white/50">Centro de treino do Domínio do Mago</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-white/20" aria-label="Histórico de treinos" onClick={() => setHistoryOpen(true)}>
            <History className="w-4 h-4" />
          </Button>
          <Button
            className="bg-mystic-arcane hover:bg-mystic-arcane/80"
            onClick={() => {
              setCreatePresetExerciseId(undefined);
              setCreateDefaultCategory(selectedCategory ?? undefined);
              setCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
            Novo treino
          </Button>
        </div>
      </motion.div>

      {activeSession && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/treinos/ativo/${activeSession.id}`)}
          className="w-full flex items-center justify-between gap-3 rounded-2xl border border-mystic-cyan/40 bg-mystic-cyan/10 px-4 py-3 mb-4 text-left hover:bg-mystic-cyan/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mystic-cyan/20 flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-mystic-cyan" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{activeSession.workoutNameSnapshot}</p>
              <p className="text-[11px] text-mystic-cyan">Sessão em andamento · continuar treino</p>
            </div>
          </div>
          <Badge variant="outline" className="border-mystic-cyan/40 text-mystic-cyan bg-mystic-cyan/10 shrink-0">
            Continuar
          </Badge>
        </motion.button>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
        <GlassCard className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-mystic-arcane shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-mono font-bold text-white">{strengthStat}</p>
                <p className="text-[10px] text-white/45">Força</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-mystic-gold shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-mono font-bold text-white">{Math.round(earthPoints)}</p>
                <p className="text-[10px] text-white/45">Terra acumulado</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-mystic-gold shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-mono font-bold text-white">{averageRating > 0 ? averageRating.toFixed(1) : '—'}</p>
                <p className="text-[10px] text-white/45">Avaliação média</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-terra-light shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-mono font-bold text-white">{stats.completedWorkouts}</p>
                <p className="text-[10px] text-white/45">Treinos concluídos</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <h3 className="font-mystic text-sm mb-2.5">Categorias</h3>
        <WorkoutCategoryGrid catalog={catalog} selected={selectedCategory} onSelect={setSelectedCategory} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-mystic text-sm">
            {selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'Catálogo de exercícios'}
          </h3>
          <Badge variant="outline" className="bg-white/5">
            {filteredCatalog.length} {filteredCatalog.length === 1 ? 'exercício' : 'exercícios'}
          </Badge>
        </div>
        {filteredCatalog.length === 0 ? (
          <p className="text-xs text-white/50">Nenhum exercício disponível nesta categoria.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {filteredCatalog.map((exercise) => {
              const Icon = CATEGORY_ICONS[exercise.category] ?? CATEGORY_ICONS.mixed;
              return (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => handleOpenExercise(exercise)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:border-mystic-gold/40 hover:bg-white/8 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-mystic-arcane" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white font-medium truncate">{exercise.name}</p>
                    <p className="text-[11px] text-white/50 truncate">{exercise.focus ?? CATEGORY_LABELS[exercise.category]}</p>
                  </div>
                </button>
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
              );
            })}
          </div>
        )}
<<<<<<< HEAD
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
                  <FitnessCard key={w.id} className="flex items-center gap-3 py-3 px-4">
                    <FitnessIconBadge icon={Icon} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-fitness-text truncate">{w.name}</p>
                      <p className="text-[12px] text-fitness-muted">
                        {formatDurationCompact(w.estimatedDurationMinutes)}
                      </p>
                    </div>
                    <span className="text-[12px] text-fitness-primary font-medium">Concluído</span>
                  </FitnessCard>
                );
              })}
          </div>
        </div>
      )}



      <CreateWorkoutDialog open={createOpen} onOpenChange={setCreateOpen} />
    </FitnessPageShell>
=======
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-mystic text-sm flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-mystic-gold" aria-hidden="true" />
            Meus treinos
          </h3>
          <Badge variant="outline" className="bg-white/5">
            {plannedWorkouts.length} ativos/planejados
          </Badge>
        </div>
        {plannedWorkouts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-5 text-center">
            <p className="text-sm text-white/60 mb-3">Nenhum treino planejado ainda.</p>
            <Button size="sm" variant="outline" className="border-white/20" onClick={() => setCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Criar meu primeiro treino
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {plannedWorkouts.map((workout) => (
              <WorkoutListCard
                key={workout.id}
                workout={workout}
                session={workout.lastSessionId ? getSessionById(workout.lastSessionId) : undefined}
                rating={workout.lastSessionId ? getSessionRating(workout.lastSessionId) : undefined}
                onAction={() => handleWorkoutAction(workout)}
              />
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-mystic text-sm">Concluídos recentemente</h3>
        </div>
        {recentCompleted.length === 0 ? (
          <p className="text-xs text-white/50">Nenhum treino concluído ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentCompleted.map((workout) => (
              <WorkoutListCard
                key={workout.id}
                workout={workout}
                session={workout.lastSessionId ? getSessionById(workout.lastSessionId) : undefined}
                rating={workout.lastSessionId ? getSessionRating(workout.lastSessionId) : undefined}
                onAction={() => handleWorkoutAction(workout)}
              />
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
        <BodyTrackingCard />
      </motion.div>

      <CreateWorkoutDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
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
        <SheetContent side="right" className="bg-void border-white/10 w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-mystic">Histórico de treinos</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-2">
            {historySessions.length === 0 ? (
              <p className="text-sm text-white/50">Nenhuma sessão registrada ainda.</p>
            ) : (
              historySessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setHistoryOpen(false);
                    navigate(session.status === 'in_progress' ? `/treinos/ativo/${session.id}` : `/treinos/resumo/${session.id}`);
                  }}
                  className="w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left hover:bg-white/10 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{session.workoutNameSnapshot}</p>
                    <p className="text-[11px] text-white/50">{formatWorkoutDateTime(session.startedAt)}</p>
                  </div>
                  {session.status === 'completed' && (
                    <span className="text-[11px] text-mystic-gold font-mono shrink-0">{formatVolume(session.totalVolume)}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
  );
};
