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
  );
};
