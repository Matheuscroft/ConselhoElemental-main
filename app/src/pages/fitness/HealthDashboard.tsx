import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import React, { useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, CalendarDays, UserRound } from 'lucide-react';
import { FITNESS_ICONS } from '@/components/fitness-kit/FitnessGlyph';
import {
  FitnessTopTabs,
  FitnessButton,
  FitnessPageShell,
  MiniBars,
  MiniSparkline,
  NEW_WORKOUT_PATH,
  RingsOverview,
  type RingMetric,
} from '@/components/fitness-kit';
import '@/components/fitness-kit/saude-uau.css';
import { SaudeCena } from '@/components/fitness-kit/saude-cena';
import { useSaudeLuz } from '@/components/fitness-kit/saude-luz';
import { SaudeMetrica } from '@/components/fitness-kit/saude-metrica';
import { SaudeCabeca } from '@/components/fitness-kit/saude-painel';
import { buildWeekBuckets, getTodayExerciseMinutes } from '@/lib/fitness-kit/adapters';
import { DAILY_EXERCISE_GOAL_MINUTES } from '@/lib/fitness-kit/constants';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { useWeekStartsOnPreference } from '@/lib/temporal';
import { useAppStore } from '@/stores/appStore';

const WEEKLY_SESSIONS_GOAL = 3;
const whole = (value: number) => String(Math.round(value));
const ordem = (valor: number) => ({ '--ordem': valor }) as CSSProperties;

const HealthToday: React.FC = () => {
  const navigate = useNavigate();
  const userName = useAppStore((state) => state.user?.name);
  const sessions = useFitnessHistory();
  const prana = useAppStore(state => state.user?.pranaLevel);
  const { weekStartsOn } = useWeekStartsOnPreference();
  const luz = useSaudeLuz();

  const todayMinutes = useMemo(() => getTodayExerciseMinutes(sessions), [sessions]);
  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn), [sessions, weekStartsOn]);
  const weekSessions = week.reduce((sum, day) => sum + day.sessionCount, 0);

  const rings = useMemo<RingMetric[]>(
    () => [
      {
        id: 'sessions',
        label: 'Treinos na semana',
        value: weekSessions,
        max: WEEKLY_SESSIONS_GOAL,
        display: `${weekSessions}/${WEEKLY_SESSIONS_GOAL}`,
        count: { value: weekSessions, format: (value) => `${Math.round(value)}/${WEEKLY_SESSIONS_GOAL}` },
        color: '#00C99A',
        trackColor: 'rgba(22, 91, 80, 0.55)',
      },
      {
        id: 'exercise',
        label: 'Exercício',
        value: todayMinutes,
        max: DAILY_EXERCISE_GOAL_MINUTES,
        display: formatMinutes(todayMinutes),
        count: { value: todayMinutes, format: formatMinutes },
        color: '#FF9B52',
        trackColor: 'rgba(255, 155, 82, 0.2)',
      },
      {
        id: 'prana',
        label: 'Prana',
        value: (prana ?? 0),
        max: 100,
        display: prana == null ? 'Não informado' : `${prana.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/100`,
        count: prana == null ? undefined : { value: prana, format: (value) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/100` },
        color: '#6697F2',
        trackColor: 'rgba(102, 151, 242, 0.2)',
      },
    ],
    [prana, todayMinutes, weekSessions]
  );

  const weekHasData = week.some((day) => day.sessionCount > 0);
  const measuredLoad = week.some((day)=>day.observedSessions>0);
  const volumeValues = week.map((day) => measuredLoad ? day.activityLoad : day.minutes);
  const maxMinutes = Math.max(DAILY_EXERCISE_GOAL_MINUTES, ...week.map((day) => day.minutes));
  const activeDays = week.filter((day) => day.sessionCount > 0).length;
  const volumeTotal = volumeValues.reduce((sum, value) => sum + value, 0);
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <SaudeCabeca title={`Olá${userName ? `, ${userName}` : ''}`} subtitle={`${FITNESS_COPY.today} · ${today}`} />

      <RingsOverview
        metrics={rings}
        ariaLabel="Recursos e exercício de hoje"
        center={{ value: weekSessions, max: WEEKLY_SESSIONS_GOAL }}
        arrivalKey="hoje-aneis"
      />

      <h2 className="saude-secao saude-entra" style={ordem(2)}>Nesta semana</h2>
      <div className="saude-metricas">
        <SaudeMetrica
          title={measuredLoad ? 'Carga percebida' : 'Tempo ativo'}
          icon={FITNESS_ICONS.strength}
          order={3}
          arrivalKey="hoje-volume"
          value={measuredLoad ? { value: volumeTotal, format: whole, unit: 'u.a.' } : { value: volumeTotal, format: formatMinutes }}
          emptyText={weekHasData ? undefined : 'Sem treinos esta semana. O primeiro risco da linha nasce aqui.'}
          summary={`Volume por dia nesta semana: ${volumeValues.map((value) => Math.round(value)).join(', ')} ${measuredLoad ? 'u.a.' : 'min'}`}
        >
          {(arrived) => <MiniSparkline values={volumeValues} color={luz.acento} height={72} arrived={arrived} />}
        </SaudeMetrica>

        <SaudeMetrica
          title="Atividade"
          icon={Activity}
          order={4}
          arrivalKey="hoje-atividade"
          value={{ value: activeDays, format: whole, unit: activeDays === 1 ? 'dia' : 'dias' }}
          emptyText={weekHasData ? undefined : 'Sem treinos esta semana. Cada dia de treino acende uma barra.'}
        >
          {(arrived) => (
            <MiniBars
              data={week.map((day) => ({ label: day.initial, value: day.minutes, isToday: day.isToday, caption: `${day.fullLabel}: ${formatMinutes(day.minutes)}` }))}
              max={maxMinutes}
              arrived={arrived}
              ariaLabel="Minutos de exercício por dia nesta semana"
            />
          )}
        </SaudeMetrica>
      </div>

      <nav aria-label="Explorar saúde e tempo" className="saude-atalhos saude-entra" style={ordem(5)}>
        <button type="button" className="saude-atalho ds-pane" onClick={() => navigate('/treinos/corpo')}>
          <UserRound aria-hidden="true" />Meu corpo
        </button>
        <button type="button" className="saude-atalho ds-pane" onClick={() => navigate('/treinos/semana')}>
          <CalendarDays aria-hidden="true" />Esta semana
        </button>
      </nav>

      <p className="saude-nota saude-entra" style={ordem(5)}>
        Prana é um recurso do jogo. A referência semanal é de 3 treinos. O anel de exercício usa 30 minutos como referência visual diária. Minutos ativos incluem estimativas das séries por repetição.
      </p>

      <div className="saude-acao-final saude-entra" style={ordem(6)}>
        <FitnessButton className="w-full max-w-[19rem]" onClick={() => navigate(NEW_WORKOUT_PATH)}>
          {FITNESS_COPY.newWorkout}
        </FitnessButton>
      </div>
    </>
  );
};

export const HealthDashboard: React.FC = () => (
  <FitnessPageShell focused withNav showPageMap={false}>
    <FitnessTopTabs />
    <SaudeCena chave="hoje">
      <HealthToday />
    </SaudeCena>
  </FitnessPageShell>
);
