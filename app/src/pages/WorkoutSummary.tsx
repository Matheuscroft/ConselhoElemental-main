<<<<<<< HEAD
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
=======
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Gem, ListChecks, Sparkles, Swords, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { MuscleDistributionBars, StarRating } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import {
  CATEGORY_LABELS,
  formatTime,
  formatVolume,
  formatWorkoutDateTime,
} from '@/lib/workout';

const AXIS_TICK_STYLE = { fill: 'rgba(255,255,255,0.55)', fontSize: 11 };
const GRID_STROKE = 'rgba(255,255,255,0.08)';

const strengthChartConfig: ChartConfig = {
  estimatedOneRepMax: { label: '1RM estimado (kg)', color: '#FFD700' },
};

const volumeChartConfig: ChartConfig = {
  volume: { label: 'Volume (kg)', color: '#9D4EDD' },
};
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e

export const WorkoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const {
    getSessionById,
    getWorkoutById,
<<<<<<< HEAD
    getVolumeHistory,
    applyGamificationForSession,
    rateWorkout,
    getSessionRating,
=======
    getStrengthHistory,
    getVolumeHistory,
    getMuscleDistribution,
    getBodyMeasurementHistory,
    getSessionRating,
    getAverageRating,
    rateWorkout,
    applyGamificationForSession,
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
  } = useWorkoutStore();

  const session = sessionId ? getSessionById(sessionId) : undefined;
  const workout = session ? getWorkoutById(session.workoutId) : undefined;

<<<<<<< HEAD
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
=======
  const exerciseOptions = useMemo(() => {
    if (!session) return [];
    const seen = new Set<string>();
    return session.exerciseResults.filter((result) => {
      if (seen.has(result.exerciseId)) return false;
      seen.add(result.exerciseId);
      return true;
    });
  }, [session]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(exerciseOptions[0]?.exerciseId);
  const effectiveExerciseId = selectedExerciseId ?? exerciseOptions[0]?.exerciseId;

  const strengthHistory = useMemo(() => {
    if (!effectiveExerciseId) return [];
    return getStrengthHistory()
      .filter((point) => point.exerciseId === effectiveExerciseId)
      .map((point) => ({
        label: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        estimatedOneRepMax: Math.round(point.estimatedOneRepMax),
      }));
  }, [getStrengthHistory, effectiveExerciseId]);

  const volumeHistory = useMemo(
    () =>
      getVolumeHistory()
        .slice(-14)
        .map((point) => ({
          label: new Date(point.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          volume: Math.round(point.volume),
        })),
    [getVolumeHistory]
  );

  const muscleDistribution = sessionId ? getMuscleDistribution(sessionId) : [];
  const bodyHistory = useMemo(() => getBodyMeasurementHistory().slice(-5).reverse(), [getBodyMeasurementHistory]);
  const rating = sessionId ? getSessionRating(sessionId) : undefined;
  const averageRating = getAverageRating();

  if (!sessionId || !session) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <AlertCircle className="w-12 h-12 text-mystic-gold mb-4" aria-hidden="true" />
          <h2 className="text-xl font-mystic mb-2">Resumo não encontrado</h2>
          <p className="text-sm text-white/50 mb-4">Esta sessão não existe mais ou pertence a outra conta.</p>
          <Button onClick={() => navigate('/treinos')}>Voltar para Treinos</Button>
        </div>
      </AppLayout>
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
    );
  }

  if (session.status === 'in_progress') {
    return (
<<<<<<< HEAD
      <FitnessPageShell className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-fitness-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-fitness-text mb-2">Treino ainda em andamento</h2>
        <FitnessButton variant="primary" onClick={() => navigate(`/treinos/ativo/${session.id}`)}>
          Continuar treino
        </FitnessButton>
      </FitnessPageShell>
=======
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <AlertCircle className="w-12 h-12 text-mystic-cyan mb-4" aria-hidden="true" />
          <h2 className="text-xl font-mystic mb-2">Este treino ainda está em andamento</h2>
          <p className="text-sm text-white/50 mb-4">Finalize a sessão para ver o resumo completo.</p>
          <Button onClick={() => navigate(`/treinos/ativo/${session.id}`)}>Continuar treino</Button>
        </div>
      </AppLayout>
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
    );
  }

  const handleSave = () => {
    applyGamificationForSession(session.id);
    navigate('/treinos');
  };

<<<<<<< HEAD
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
=======
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" className="border-white/20" aria-label="Voltar para Treinos" onClick={() => navigate('/treinos')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-mystic text-lg">Resumo</h2>
        <div className="w-9" aria-hidden="true" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
          <Swords className="w-6 h-6 text-mystic-arcane" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h3 className="font-mystic text-lg text-white truncate">{session.workoutNameSnapshot}</h3>
          <p className="text-xs text-white/50">
            {CATEGORY_LABELS[workout?.category ?? 'mixed']} · {formatWorkoutDateTime(session.startedAt)} · {formatTime(session.durationSeconds)} · {session.exerciseResults.length} exercícios
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
        <GlassCard className="p-3">
          <p className="text-base font-mono font-bold text-white">{formatVolume(session.totalVolume)}</p>
          <p className="text-[10px] text-white/45 mt-0.5">Volume total</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-base font-mono font-bold text-mystic-gold flex items-center gap-1">
            <Gem className="w-3.5 h-3.5" aria-hidden="true" /> {Math.round(session.earthPoints)}
          </p>
          <p className="text-[10px] text-white/45 mt-0.5">Terra conquistado</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-base font-mono font-bold text-emerald-300">+{Math.round(session.strengthGain)}</p>
          <p className="text-[10px] text-white/45 mt-0.5">Força ganha</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-base font-mono font-bold text-amber-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" /> {Math.round(session.staminaCost)}
          </p>
          <p className="text-[10px] text-white/45 mt-0.5">Stamina consumida</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-base font-mono font-bold text-mystic-cyan flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> {Math.round(session.pranaCost)}
          </p>
          <p className="text-[10px] text-white/45 mt-0.5">Prana consumido</p>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h3 className="font-mystic text-sm">Progressão de força</h3>
            {exerciseOptions.length > 1 && (
              <Select value={effectiveExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger size="sm" className="bg-white/5 border-white/15 max-w-[55%]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exerciseOptions.map((option) => (
                    <SelectItem key={option.exerciseId} value={option.exerciseId}>
                      {option.exerciseNameSnapshot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {strengthHistory.length >= 2 ? (
            <ChartContainer config={strengthChartConfig} className="h-52 w-full">
              <LineChart data={strengthHistory} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="estimatedOneRepMax"
                  stroke="var(--color-estimatedOneRepMax)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-estimatedOneRepMax)' }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-xs text-white/50 py-6 text-center">
              {strengthHistory.length === 0
                ? 'Nenhum registro de força para este exercício ainda.'
                : 'Ainda não há histórico suficiente para mostrar a evolução (mínimo de 2 sessões).'}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Histórico de volume</h3>
          {volumeHistory.length > 0 ? (
            <ChartContainer config={volumeChartConfig} className="h-52 w-full">
              <BarChart data={volumeHistory} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-xs text-white/50 py-6 text-center">Ainda não há histórico de volume suficiente.</p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Distribuição muscular da sessão</h3>
          <MuscleDistributionBars distribution={muscleDistribution} />
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-mystic-gold" aria-hidden="true" />
            <h3 className="font-mystic text-sm">Histórico corporal</h3>
          </div>
          {bodyHistory.length === 0 ? (
            <p className="text-xs text-white/50">Nenhuma avaliação registrada.</p>
          ) : (
            <div className="space-y-2">
              {bodyHistory.map((measurement) => (
                <div key={measurement.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <span className="text-[11px] text-white/45 shrink-0">{formatWorkoutDateTime(measurement.measuredAt)}</span>
                  {measurement.weightKg != null && <Badge variant="outline" className="text-[10px] bg-white/5">Peso {measurement.weightKg}kg</Badge>}
                  {measurement.muscleMassKg != null && (
                    <Badge variant="outline" className="text-[10px] bg-white/5">Massa muscular {measurement.muscleMassKg}kg</Badge>
                  )}
                  {measurement.waterPercent != null && <Badge variant="outline" className="text-[10px] bg-white/5">Água {measurement.waterPercent}%</Badge>}
                  {measurement.bodyFatPercent != null && (
                    <Badge variant="outline" className="text-[10px] bg-white/5">Gordura {measurement.bodyFatPercent}%</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="mb-6">
        <GlassCard className="p-4 flex flex-col items-center text-center">
          <h3 className="font-mystic text-sm mb-3">Como foi este treino?</h3>
          <StarRating value={rating?.stars ?? 0} onRate={(stars) => rateWorkout(session.id, stars)} />
          <p className="text-xs text-white/50 mt-3">
            Média das suas sessões: {averageRating > 0 ? averageRating.toFixed(1) : 'Ainda não avaliado'}
          </p>
        </GlassCard>
      </motion.div>

      <div className="pb-6">
        <Button className="w-full h-12 bg-mystic-arcane hover:bg-mystic-arcane/80" onClick={handleSave}>
          Salvar treino
        </Button>
      </div>
    </AppLayout>
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
  );
};
