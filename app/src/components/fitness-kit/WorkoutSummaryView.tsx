import React, { useState } from 'react';
import { Share2, type LucideIcon } from 'lucide-react';
import type { MetricItem } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { FitnessHeader } from './FitnessHeader';
import { FitnessIconBadge } from './FitnessIconBadge';
import { FitnessPageShell } from './FitnessPageShell';
import { HeartRateChart, type HeartRatePoint } from './HeartRateChart';
import { TreinoBarraAcao } from './treino-barra';
import { TreinoCelebracao } from './treino-celebracao';
import { TreinoCena } from './treino-cena';
import { TreinoEstatisticas } from './treino-estatisticas';
import './treino-uau.css';

interface WorkoutSummaryViewProps {
  name: string;
  icon: LucideIcon;
  /** Ex.: "07:30 - 07:58". */
  timeRange: string;
  metrics: MetricItem[];
  /** XP REAL da sessão (ou null) e se a sessão acabou de terminar; quem chama formata o XP como o recibo. */
  celebracao?: { xp: number | null; fresca: boolean; formatarXp: (valor: number) => string };
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

/** Layout puro da tela de resumo: header → celebração → atividade → métricas → gráficos → CTA. */
export const WorkoutSummaryView: React.FC<WorkoutSummaryViewProps> = ({
  name,
  icon,
  timeRange,
  metrics,
  celebracao,
  heartRate,
  routeSlot,
  onBack,
  onShare,
  onSave,
  children,
}) => {
  const [alturaBarra, setAlturaBarra] = useState<number>();
  return (
  <FitnessPageShell focused showPageMap={false} withFixedAction fixedActionHeight={alturaBarra}>
    <TreinoCena>
    <FitnessHeader
      title={FITNESS_COPY.summary}
      onBack={onBack}
      backLabel="Voltar ao histórico"
      action={
        <button type="button" onClick={onShare} aria-label={FITNESS_COPY.share} className="treino-compartilhar">
          <Share2 className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      }
    />

    {celebracao && <TreinoCelebracao xp={celebracao.xp} fresca={celebracao.fresca} formatarXp={celebracao.formatarXp} />}

    {routeSlot && <div className="mt-8 overflow-hidden rounded-fit-lg">{routeSlot}</div>}

    <div className="treino-resumo-cabeca treino-entra" style={{ '--i': 1 } as React.CSSProperties}>
      <FitnessIconBadge icon={icon} size="lg" />
      <div className="min-w-0">
        <h2 className="treino-resumo-nome">{name}</h2>
        <p className="treino-resumo-hora">{timeRange}</p>
      </div>
    </div>

    <TreinoEstatisticas metrics={metrics} />

    {heartRate && heartRate.data.length > 0 && (
      <div className="mt-6">
        <HeartRateChart data={heartRate.data} current={heartRate.current} />
      </div>
    )}

    {children && <div className="mt-6 space-y-5">{children}</div>}
    </TreinoCena>

    <TreinoBarraAcao onHeightChange={setAlturaBarra}>
      <button type="button" className="treino-acao treino-acao--principal w-full" onClick={onSave}>Concluir</button>
    </TreinoBarraAcao>
  </FitnessPageShell>
  );
};
