import { ElementIcon } from './ArcaneIcon';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';

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

/** A short overview opens locally; the primary action keeps the existing detail flow. */
export function ShowcaseCard({ title, description, element, status, progress, chips, reward, onOpen }: ShowcaseCardProps) {
  return <details className="elemental-showcase" style={{ '--showcase-accent': `var(--element-${element})` } as CSSProperties}>
    <summary>
      <span className="elemental-showcase-art" aria-hidden="true"><ElementIcon element={element} size={36} /></span>
      <span className="elemental-showcase-heading"><small>{status}</small><strong>{title}</strong><span>{progress}% concluído</span></span>
      <ChevronDown className="elemental-showcase-chevron" size={20} aria-hidden="true" />
    </summary>
    <div className="elemental-showcase-content">
      <p>{description || 'Abra os detalhes para acompanhar os próximos passos.'}</p>
      <ul className="elemental-showcase-chips" aria-label="Resumo">{chips.map((chip, index) => <li key={`${index}-${chip}`}>{chip}</li>)}</ul>
      <progress max={100} value={progress} aria-label={`Progresso de ${title}`} />
      {reward && <p className="elemental-showcase-reward">Recompensa: {reward}</p>}
      <button type="button" onClick={onOpen}>Abrir detalhes<ArrowUpRight size={18} aria-hidden="true" /></button>
    </div>
  </details>;
}
