/**
 * WorkoutSummary — Fitness UI Kit re-skin.
 *
 * Shows metrics directly on the canvas (no card wrapper per reference),
 * then a HeartRateChart card (only shown when synthetic data is available as placeholder),
 * then Save Workout CTA.
 *
 * Real metrics available from session:
 *   - durationSeconds → formatted as "0:37:10"
 *   - totalVolume (kg)
 *   - earthPoints
 *   - strengthGain
 *   - staminaCost
 *   - pranaCost
 *
 * NOT available in store: heart rate, calories, distance. These sections are
 * conditionally omitted or shown only if real data exists.
 */
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, AlertCircle, Dumbbell } from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessButton,
  FitnessIconBadge,
  SummaryMetric,
  ChartWidget,
} from '@/components/fitness';
import { HeartRateChart } from '@/components/fitness/HeartRateChart';
import { TrendAreaChart, type TrendPoint } from '@/components/fitness/TrendAreaChart';
import { useWorkoutStore } from '@/stores/workoutStore';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import {
  formatSessionDuration,
  formatTimeHHMM,
} from '@/lib/fitness/fitness-format';

export const WorkoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const {
    getSessionById,
    getWorkoutById,
    getVolumeHistory,
    applyGamificationForSession,
    rateWorkout,
    getSessionRating,
  } = useWorkoutStore();

  const session = sessionId ? getSessionById(sessionId) : undefined;
  const workout = session ? getWorkoutById(session.workoutId) : undefined;

  // Volume history for trend chart (real data)
  const trendData = useMemo<TrendPoint[]>(() => {
    const history = getVolumeHistory().slice(-7);
    return history.map((point) => ({
      label: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
      value: Math.round(point.volume),
    }));
  }, [getVolumeHistory]);

  if (!sessionId || !session) {
    return (
      <FitnessPageShell className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-fitness-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-fitness-text mb-2">Resumo não encontrado</h2>
        <p className="text-sm text-fitness-muted mb-4 text-center">
          Esta sessão não existe mais.
        </p>
        <FitnessButton variant="secondary" onClick={() => navigate('/treinos')}>
          Voltar para Treinos
        </FitnessButton>
      </FitnessPageShell>
    );
  }

  if (session.status === 'in_progress') {
    return (
      <FitnessPageShell className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-fitness-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-fitness-text mb-2">Treino ainda em andamento</h2>
        <FitnessButton variant="primary" onClick={() => navigate(`/treinos/ativo/${session.id}`)}>
          Continuar treino
        </FitnessButton>
      </FitnessPageShell>
    );
  }

  const handleSave = () => {
    applyGamificationForSession(session.id);
    navigate('/treinos');
  };

  const CategoryIcon = CATEGORY_ICONS[workout?.category ?? 'mixed'] ?? Dumbbell;
  const startLabel = formatTimeHHMM(session.startedAt);
  const endLabel = session.finishedAt ? formatTimeHHMM(session.finishedAt) : '';
  const timeRange = endLabel ? `${startLabel} - ${endLabel}` : startLabel;

  // Real metrics only
  const durationLabel = formatSessionDuration(session.durationSeconds);
  const volumeLabel = `${Math.round(session.totalVolume).toLocaleString('pt-BR')} kg`;
  const earthLabel = `${Math.round(session.earthPoints)}`;
  const strengthLabel = `+${session.strengthGain.toFixed(1)}`;

  return (
    <FitnessPageShell
      ctaOffset
      className="max-w-md mx-auto w-full"
    >
      {/* Header */}
      <FitnessHeader
        title="Summary"
        onBack={() => navigate('/treinos')}
        rightAction={
          <button
            type="button"
            aria-label="Compartilhar resumo"
            className="w-10 h-10 rounded-full bg-fitness-primary flex items-center justify-center hover:bg-fitness-primary-hover transition-colors active:scale-95"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
        }
      />

      {/* Workout identification */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 my-5"
      >
        <FitnessIconBadge icon={CategoryIcon} size="lg" aria-label={session.workoutNameSnapshot} />
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold text-fitness-text truncate">
            {session.workoutNameSnapshot}
          </h2>
          <p className="text-[13px] text-fitness-muted mt-0.5">{timeRange}</p>
        </div>
      </motion.div>

      {/* Metrics — directly on canvas, no wrapping card (per reference) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="grid grid-cols-2 gap-x-6 gap-y-6 mb-8"
      >
        <SummaryMetric label="Tempo total" value={durationLabel} />
        <SummaryMetric label="Volume total" value={volumeLabel} />
        <SummaryMetric label="Terra conquistado" value={earthLabel} unit="pt" />
        <SummaryMetric label="Força ganha" value={strengthLabel} />
      </motion.div>

      {/* Volume trend chart (real data) */}
      {trendData.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-5"
        >
          <ChartWidget title="Tendência de volume">
            <TrendAreaChart data={trendData} height={150} />
          </ChartWidget>
        </motion.div>
      )}

      {/* Heart rate — only shown when real data is available */}
      {/* NOTE: The store does NOT provide heart rate data.
          This section is intentionally omitted in the integrated product.
          A routeSlot/heartRateSlot prop can be added by future backend integration. */}

      {/* Exercise count summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mb-8"
      >
        <ChartWidget title="Exercícios">
          <div className="flex flex-wrap gap-2">
            {session.exerciseResults.map((result) => (
              <div
                key={result.exerciseId}
                className="flex items-center gap-2 bg-fitness-surface-muted rounded-full px-3 py-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-fitness-primary shrink-0" aria-hidden="true" />
                <span className="text-[13px] text-fitness-text">{result.exerciseNameSnapshot}</span>
                <span className="text-[12px] text-fitness-muted ml-1">
                  {result.sets.filter((s) => s.completed).length}/{result.sets.length}
                </span>
              </div>
            ))}
          </div>
        </ChartWidget>
      </motion.div>

      {/* Sticky Save CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-fitness-canvas via-fitness-canvas/90 to-transparent pointer-events-none">
        <FitnessButton
          variant="primary"
          size="lg"
          onClick={handleSave}
          className="w-[72%] pointer-events-auto"
          aria-label="Salvar treino e retornar"
        >
          Save workout
        </FitnessButton>
      </div>
    </FitnessPageShell>
  );
};
