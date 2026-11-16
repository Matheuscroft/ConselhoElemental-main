import type { CSSProperties } from 'react';
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
  /**
   * Optional light and depth, off by default so the card at rest is unchanged:
   * a ring of progress around the element's seal, the finger's light on the
   * card, and `ordem` as the place in the cascade of an arrival.
   */
  viva?: boolean;
  ordem?: number;
  conquistada?: boolean;
}

/** Vitrine do sistema de blocos: uma runa que abre localmente; o botao mantem o fluxo de detalhes. */
export function ShowcaseCard({ title, description, element, status, progress, chips, reward, onOpen, viva = false, ordem, conquistada = false }: ShowcaseCardProps) {
  const valor = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) / 100 : 0;
  const estilo = viva && ordem !== undefined ? ({ '--i': Math.min(ordem, 7) } as CSSProperties) : undefined;
  return <details className="ds-runa vitrine" data-forma="vitrine" data-element={element} data-luz={viva ? '' : undefined} data-viva={viva ? '' : undefined} data-conquistada={viva && conquistada ? '' : undefined} style={estilo}>
    <summary>
      <span className="ds-runa-arte vitrine-art" aria-hidden="true">
        {viva && <svg className="vitrine-anel" viewBox="0 0 56 56" focusable="false">
          <circle className="vitrine-anel-trilho" cx="28" cy="28" r="25" pathLength={100} />
          <circle className="vitrine-anel-arco" cx="28" cy="28" r="25" pathLength={100} strokeDasharray={`${+(valor * 100).toFixed(2)} 100`} strokeLinecap="round" transform="rotate(-90 28 28)" />
        </svg>}
        <ElementIcon element={element} size={36} />
      </span>
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
