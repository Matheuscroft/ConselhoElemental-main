import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import React, { useMemo, useState } from 'react';
import { addWeeks, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ChartWidget,
  FitnessTopTabs,
  FitnessCard,
  FitnessPageShell,
  MiniSparkline,
  SectionHeader,
  WeeklyBars,
} from '@/components/fitness-kit';
import { buildWeekBuckets } from '@/lib/fitness-kit/adapters';
import { DAILY_EXERCISE_GOAL_MINUTES } from '@/lib/fitness-kit/constants';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { useWeekStartsOnPreference } from '@/lib/temporal';

export const HealthWeeklySummary: React.FC = () => {
  const navigate = useNavigate();
  const sessions = useFitnessHistory();
  const { weekStartsOn } = useWeekStartsOnPreference();

  const [offset, setOffset] = useState(0);
  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn, addWeeks(new Date(), offset)), [sessions, weekStartsOn, offset]);
  const hasData = week.some((day) => day.sessionCount > 0);
  const limit = Math.max(DAILY_EXERCISE_GOAL_MINUTES, Math.ceil(Math.max(...week.map((day) => day.minutes))));
  const today = new Date();
  const visibleDays = week.filter((day) => day.date.getTime() <= today.getTime());

  return (
    <FitnessPageShell focused withNav showPageMap={false}>
      <FitnessTopTabs />
      <SectionHeader
        level="section"
        title={FITNESS_COPY.weeklySummary}
        subtitle={`${format(week[0].date, 'dd/MM')} – ${format(week[6].date, 'dd/MM/yyyy')}`}
        actionLabel="Ver histórico"
        onAction={() => navigate('/treinos/historico')}
      />

      <div className="mt-5 flex items-center justify-between gap-3" aria-label="Escolher semana">
        <button type="button" aria-label="Semana anterior" className="grid h-11 w-11 place-items-center rounded-full bg-fitness-surface focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => setOffset(value => value - 1)}><ChevronLeft size={20} /></button>
        <button type="button" className="min-h-11 text-sm text-fitness-primary" onClick={() => setOffset(0)}>Esta semana</button>
        <button type="button" aria-label="Próxima semana" disabled={offset === 0} className="grid h-11 w-11 place-items-center rounded-full bg-fitness-surface disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => setOffset(value => Math.min(0, value + 1))}><ChevronRight size={20} /></button>
      </div>
      <p className="mt-3 text-xs text-fitness-muted">Tempo ativo registrado; séries por repetição usam tempo estimado. Registros antigos sem essa informação usam a duração da sessão.</p>
      <div className="mt-5 space-y-5">
        <ChartWidget
          title="Minutos de exercício"
          radius="lg"
          className="p-6"
          emptyMessage={hasData ? undefined : FITNESS_COPY.empty.weekly}
        >
          <WeeklyBars
            data={week.map((day) => ({ label: day.initial, value: day.minutes, caption: `${day.fullLabel}: ${formatMinutes(day.minutes)}` }))}
            max={limit}
            limitLabel={formatMinutes(limit)}
            ariaLabel="Minutos de exercício por dia na semana selecionada"
          />
        </ChartWidget>

        <div className="space-y-3" role="list" aria-label="Dias da semana">
          {visibleDays.map((day) => (
            <FitnessCard key={day.key} radius="md" className="flex items-start gap-4 px-4 py-4" role="listitem">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fitness-text">{day.fullLabel}</p>
                <p className="text-sm text-fitness-text-soft">
                  {day.sessionCount > 0 ? formatMinutes(day.minutes) : <span className="text-fitness-muted">Sem treino</span>}
                </p>
              </div>
              {day.sessionCount > 0 && <button type="button" aria-label={`Ver treinos de ${day.fullLabel}`} className="min-h-11 shrink-0 px-2 text-sm text-fitness-primary focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => navigate(`/treinos?tab=history&day=${day.key}`)}>Ver {day.sessionCount}</button>}
              {day.sessionCount > 0 && day.setVolumes.length >= 2 && (
                <div className="hidden w-20 shrink-0 sm:block self-center" aria-hidden="true">
                  <MiniSparkline values={day.setVolumes} height={32} />
                </div>
              )}
            </FitnessCard>
          ))}
        </div>
      </div>

    </FitnessPageShell>
  );
};
