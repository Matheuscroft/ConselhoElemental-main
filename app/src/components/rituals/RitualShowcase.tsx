import { useId, type CSSProperties, type ReactNode } from 'react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';

interface RitualShowcaseProps {
  title: string;
  description?: string;
  element: ElementId;
  completed: boolean;
  status: string;
  summary: string;
  actions: ReactNode;
  children: ReactNode;
}

/** Disclosure is presentation-only. Execution actions stay outside its toggle. */
export function RitualShowcase({ title, description, element, completed, status, summary, actions, children }: RitualShowcaseProps) {
  const id = useId();
  return <article className="ds-runa ritual-showcase" data-forma="vitrine" data-element={element} data-completed={completed} data-luz style={{ '--ritual-accent': `var(--element-${element})` } as CSSProperties}>
    <span className="rit-borda" aria-hidden="true" />
    <span className="rit-brilho" aria-hidden="true" />
    <details>
      <summary aria-controls={`${id}-details`} className="ds-runa-cabeca">
        <span className="ritual-showcase-art" aria-hidden="true">
          <img className="ds-runa-arte" src={`/sanctuary/elements/${element}-v1.webp`} width={128} height={128} alt="" loading="lazy" />
        </span>
        <span className="ritual-showcase-heading">
          <small className="ds-meta"><span><ElementIcon element={element} size={12} />{status}</span></small>
          <strong className="ds-runa-titulo">{title}</strong>
          <span className="ds-nota">{summary}</span>
        </span>
        <span className="ritual-showcase-toggle"><span>Detalhes</span><ArcaneIcon name="chevron" size={16} className="ds-runa-chevron" /></span>
      </summary>
      <div className="ds-runa-conteudo ritual-showcase-content" id={`${id}-details`}>
        {description && <p className="ds-nota ritual-showcase-description">{description}</p>}
        {children}
      </div>
    </details>
    <div className="ritual-showcase-actions">{actions}</div>
  </article>;
}
