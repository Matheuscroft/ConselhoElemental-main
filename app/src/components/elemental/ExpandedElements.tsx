import { useId, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { ElementIcon } from './ArcaneIcon';
import { elementHref } from './navigation';
import type { ElementId } from '@/types';

export interface ElementPanel {
  id: ElementId;
  name: string;
  description: string;
  scoreLabel: string;
}

export function ExpandedElements({ elements }: { elements: ElementPanel[] }) {
  const instance = useId();
  const [selected, setSelected] = useState<ElementId | undefined>();
  return <div className="pillar-element-cards" aria-label="Explorar elementos">
    {elements.map(element => {
      const open = selected === element.id;
      return <section key={element.id} className="pillar-element-card" data-open={open} style={{ '--pillar-accent': `var(--element-${element.id})` } as CSSProperties}>
        <button type="button" className="pillar-element-trigger" aria-expanded={open} aria-controls={`expanded-${instance}-${element.id}`} onClick={() => setSelected(open ? undefined : element.id)}>
          <img src={`/sanctuary/elements/${element.id}-v1.webp`} alt="" width={120} height={120} loading="lazy" />
          <span><strong><ElementIcon element={element.id} size={20} />{element.name}</strong><small>{element.scoreLabel}</small></span><ChevronDown size={20} aria-hidden="true" />
        </button>
        <div className="discovery-reveal" id={`expanded-${instance}-${element.id}`} data-open={open} inert={!open} aria-hidden={!open}><div><div className="pillar-element-content">
          <p>{element.description}</p><Link to={elementHref(element.id)}>Explorar {element.name}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        </div></div></div>
      </section>;
    })}
  </div>;
}
