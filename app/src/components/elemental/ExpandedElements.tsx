import { useId, useState, type CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ElementId } from '@/types';

export interface ElementPanel {
  id: ElementId;
  name: string;
  description: string;
  scoreLabel: string;
}

export function ExpandedElements({ elements, onExplore }: { elements: ElementPanel[]; onExplore: (id: ElementId) => void }) {
  const instance = useId();
  const [selected, setSelected] = useState<ElementId | undefined>(elements[0]?.id);
  return <div className="expanded-elements" aria-label="Explorar elementos">
    {elements.map((element) => {
      const open = selected === element.id;
      return <section key={element.id} className="expanded-element" data-open={open} style={{ '--expanded-accent': `var(--element-${element.id})` } as CSSProperties}>
        <button type="button" className="expanded-element-trigger" aria-expanded={open} aria-controls={`expanded-${instance}-${element.id}`} onClick={() => setSelected(element.id)}>
          <span>{element.name}</span><span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        <div className="expanded-element-content" id={`expanded-${instance}-${element.id}`} hidden={!open}>
          <img src={`/sanctuary/elements/${element.id}-v1.webp`} alt="" width={160} height={160} loading="lazy" />
          <p>{element.description}</p><strong>{element.scoreLabel}</strong>
          <button type="button" onClick={() => onExplore(element.id)}>Explorar {element.name}<ArrowRight size={16} aria-hidden="true" /></button>
        </div>
      </section>;
    })}
  </div>;
}
