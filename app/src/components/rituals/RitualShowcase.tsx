import { useId, type CSSProperties, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
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
  return <article className="ritual-showcase" data-completed={completed} style={{ '--ritual-accent': `var(--element-${element})` } as CSSProperties}>
    <details>
      <summary aria-controls={`${id}-details`}>
        <span className="ritual-showcase-art" aria-hidden="true">
          <img src={`/sanctuary/elements/${element}-v1.webp`} width={128} height={128} alt="" loading="lazy" />
        </span>
        <span className="ritual-showcase-heading">
          <small><ElementIcon element={element} size={16} />{status}</small>
          <strong>{title}</strong>
          <span>{summary}</span>
        </span>
        <span className="ritual-showcase-toggle"><span>Detalhes</span><ChevronDown size={20} aria-hidden="true" /></span>
      </summary>
      <div className="ritual-showcase-content" id={`${id}-details`}>
        {description && <p className="ritual-showcase-description">{description}</p>}
        {children}
      </div>
    </details>
    <div className="ritual-showcase-actions">{actions}</div>
  </article>;
}
