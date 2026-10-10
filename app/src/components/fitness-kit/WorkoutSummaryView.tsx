import React from 'react';
import { Share2, type LucideIcon } from 'lucide-react';
import type { MetricItem } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { FitnessButton } from './FitnessButton';
import { FitnessHeader } from './FitnessHeader';
import { FitnessIconBadge } from './FitnessIconBadge';
import { FitnessPageShell } from './FitnessPageShell';
import { FitnessStickyAction } from './FitnessStickyAction';
import { HeartRateChart, type HeartRatePoint } from './HeartRateChart';
import { WorkoutStatsGrid } from './WorkoutStatsGrid';

interface WorkoutSummaryViewProps {
  name: string;
  icon: LucideIcon;
  /** Ex.: "07:30 - 07:58". */
  timeRange: string;
  metrics: MetricItem[];
  /** Somente quando houver dados REAIS de frequência cardíaca. */
  heartRate?: { data: HeartRatePoint[]; current?: number };
  /** Slot para mapa/rota real (integração futura). Sem rota, nada é renderizado. */
  routeSlot?: React.ReactNode;
  onBack: () => void;
  onShare: () => void;
  onSave: () => void;
  /** Cards adicionais (gráficos reais, avaliação...). */
  children?: React.ReactNode;
}

/** Layout puro da tela de resumo: header → atividade → métricas sobre o canvas → gráficos → CTA. */
export const WorkoutSummaryView: React.FC<WorkoutSummaryViewProps> = ({
  name,
  icon,
  timeRange,
  metrics,
  heartRate,
  routeSlot,
  onBack,
  onShare,
  onSave,
  children,
}) => (
  <FitnessPageShell focused showPageMap={false} withFixedAction>
    <FitnessHeader
      title={FITNESS_COPY.summary}
      onBack={onBack}
      backLabel="Voltar para Treinos"
      action={
        <button
          type="button"
          onClick={onShare}
          aria-label={FITNESS_COPY.share}
          className="grid h-11 w-11 place-items-center rounded-full bg-fitness-primary text-white outline-none transition-[filter,transform] hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas"
        >
          <Share2 className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      }
    />

    {routeSlot && <div className="mt-8 overflow-hidden rounded-fit-lg">{routeSlot}</div>}

    <div className="mt-10 flex items-center gap-5">
      <FitnessIconBadge icon={icon} size="lg" />
      <div className="min-w-0">
        <h2 className="break-words font-sans text-2xl font-semibold text-fitness-text">{name}</h2>
        <p className="text-lg text-fitness-muted">{timeRange}</p>
      </div>
    </div>

    <WorkoutStatsGrid metrics={metrics} className="mt-12" />

    {heartRate && heartRate.data.length > 0 && (
      <div className="mt-12">
        <HeartRateChart data={heartRate.data} current={heartRate.current} />
      </div>
    )}

    {children && <div className="mt-8 space-y-5">{children}</div>}

    <FitnessStickyAction focused>
      <FitnessButton className="w-full !shadow-none" onClick={onSave}>
        Voltar aos treinos
      </FitnessButton>
    </FitnessStickyAction>
  </FitnessPageShell>
);
