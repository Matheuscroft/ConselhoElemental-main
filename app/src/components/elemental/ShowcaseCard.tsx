import { ArcaneIcon, ElementIcon } from './ArcaneIcon';
import { Medidor } from './blocos';
import type { ElementId } from '@/types';
import './showcase-card.css';

interface ShowcaseCardProps {
  title: string;
  description?: string;
  element: ElementId;
  status: string;
  progress: number;
  chips: string[];
  reward?: string;
  onOpen?: () => void;
}

/** Vitrine do sistema de blocos: uma runa que abre localmente; o botao mantem o fluxo de detalhes. */
export function ShowcaseCard({ title, description, element, status, progress, chips, reward, onOpen }: ShowcaseCardProps) {
  const valor = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) / 100 : 0;
  return <details className="ds-runa vitrine" data-forma="vitrine" data-element={element}>
    <summary>
      <span className="ds-runa-arte vitrine-art" aria-hidden="true"><ElementIcon element={element} size={36} /></span>
      <span className="vitrine-heading">
        <strong className="ds-runa-titulo">{title}</strong>
        <span className="ds-meta"><span>{status}</span><span>{progress}% concluído</span></span>
        <Medidor valor={valor} rotulo={`Progresso de ${title}`} />
      </span>
      <ArcaneIcon name="chevron" className="ds-runa-chevron" size={16} />
    </summary>
    <div className="ds-runa-conteudo vitrine-content">
      <p className="ds-nota">{description || 'Abra os detalhes para acompanhar os próximos passos.'}</p>
      <ul className="ds-meta vitrine-chips" aria-label="Resumo">{chips.map((chip, index) => <li key={`${index}-${chip}`}>{chip}</li>)}</ul>
      {reward && <p className="ds-nota vitrine-reward">Recompensa: {reward}</p>}
      <button type="button" className="ds-botao" data-tipo="secundario" onClick={onOpen}>Abrir detalhes</button>
    </div>
  </details>;
}
