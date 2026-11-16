import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import React, { useMemo, useState, type CSSProperties } from 'react';
import { addWeeks, format } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  FitnessButton,
  FitnessTopTabs,
  FitnessPageShell,
  MiniSparkline,
  WeeklyBars,
} from '@/components/fitness-kit';
import '@/components/fitness-kit/saude-uau.css';
import { SaudeCena } from '@/components/fitness-kit/saude-cena';
import { useSaudeLuz } from '@/components/fitness-kit/saude-luz';
import { SaudeCabeca, SaudePainel } from '@/components/fitness-kit/saude-painel';
import { SaudeVazio } from '@/components/fitness-kit/saude-vazio';
import { buildWeekBuckets } from '@/lib/fitness-kit/adapters';
import { DAILY_EXERCISE_GOAL_MINUTES } from '@/lib/fitness-kit/constants';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { useWeekStartsOnPreference } from '@/lib/temporal';

const HealthWeek: React.FC = () => {
  const navigate = useNavigate();
  const sessions = useFitnessHistory();
  const { weekStartsOn } = useWeekStartsOnPreference();
  const luz = useSaudeLuz();

  const [offset, setOffset] = useState(0);
  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn, addWeeks(new Date(), offset)), [sessions, weekStartsOn, offset]);
  const hasData = week.some((day) => day.sessionCount > 0);
  const limit = Math.max(DAILY_EXERCISE_GOAL_MINUTES, Math.ceil(Math.max(...week.map((day) => day.minutes))));
  const total = week.reduce((sum, day) => sum + day.minutes, 0);
  const today = new Date();
  const visibleDays = week.filter((day) => day.date.getTime() <= today.getTime());
  /** Only the current week has a "today": the other weeks share the weekday, not the date. */
  const isToday = (day: { isToday: boolean }) => offset === 0 && day.isToday;

  return (
    <>
      <SaudeCabeca
        title={FITNESS_COPY.weeklySummary}
        subtitle={`${format(week[0].date, 'dd/MM')} – ${format(week[6].date, 'dd/MM/yyyy')}`}
        actionLabel="Ver histórico"
        onAction={() => navigate('/treinos/historico')}
      />

      <div className="saude-semana-nav saude-entra" style={{ '--ordem': 1 } as CSSProperties} role="group" aria-label="Escolher semana">
        <button type="button" aria-label="Semana anterior" className="saude-semana-passo ds-pane" onClick={() => setOffset(value => value - 1)}><ChevronLeft aria-hidden="true" /></button>
        <button type="button" className="saude-semana-atual" data-fora={offset !== 0 || undefined} onClick={() => setOffset(0)}>Esta semana</button>
        <button type="button" aria-label="Próxima semana" disabled={offset === 0} className="saude-semana-passo ds-pane" onClick={() => setOffset(value => Math.min(0, value + 1))}><ChevronRight aria-hidden="true" /></button>
      </div>
      <p className="saude-nota saude-entra" style={{ '--ordem': 1 } as CSSProperties}>Tempo ativo registrado; séries por repetição usam tempo estimado. Registros antigos sem essa informação usam a duração da sessão.</p>

      <div className="saude-pilha">
        <SaudePainel
          glass
          order={2}
          arrivalKey="semana-minutos"
          title="Minutos de exercício"
          highlight={hasData ? { value: total, format: formatMinutes } : undefined}
          empty={hasData ? undefined : (
            <SaudeVazio
              icon={CalendarDays}
              title={offset === 0 ? 'Uma semana inteira pela frente' : 'Semana sem treinos'}
              text={FITNESS_COPY.empty.weekly}
              action={offset === 0 ? <FitnessButton size="md" onClick={() => navigate('/treinos')}>Iniciar treino</FitnessButton> : undefined}
            />
          )}
        >
          {(arrived) => (
            <WeeklyBars
              data={week.map((day) => ({ label: day.initial, value: day.minutes, isToday: isToday(day), caption: `${day.fullLabel}: ${formatMinutes(day.minutes)}` }))}
              max={limit}
              limitLabel={formatMinutes(limit)}
              arrived={arrived}
              ariaLabel="Minutos de exercício por dia na semana selecionada"
            />
          )}
        </SaudePainel>

        <ul className="saude-dias" aria-label="Dias da semana">
          {visibleDays.map((day, index) => (
            <li key={day.key} className="saude-dia ds-pane saude-entra" data-hoje={isToday(day) || undefined} data-vazio={day.sessionCount === 0} data-luz="" style={{ '--ordem': Math.min(index + 3, 9) } as CSSProperties}>
              <span className="saude-dia-data" aria-hidden="true"><small>{day.shortLabel}</small><b>{format(day.date, 'dd')}</b></span>
              <div className="saude-dia-texto">
                <p>{day.fullLabel}{isToday(day) && <em>Hoje</em>}</p>
                <p>{day.sessionCount > 0 ? formatMinutes(day.minutes) : <span>Sem treino</span>}</p>
              </div>
              {day.sessionCount > 0 && day.setVolumes.length >= 2 && (
                <div className="saude-dia-linha" aria-hidden="true">
                  <MiniSparkline values={day.setVolumes} height={32} color={luz.acento} />
                </div>
              )}
              {day.sessionCount > 0 && <button type="button" aria-label={`Ver treinos de ${day.fullLabel}`} className="saude-link" onClick={() => navigate(`/treinos?tab=history&day=${day.key}`)}>Ver {day.sessionCount}</button>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export const HealthWeeklySummary: React.FC = () => (
  <FitnessPageShell focused withNav showPageMap={false}>
    <FitnessTopTabs />
    <SaudeCena chave="semana">
      <HealthWeek />
    </SaudeCena>
  </FitnessPageShell>
);
