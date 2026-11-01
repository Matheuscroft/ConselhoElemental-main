import { ChevronDown } from 'lucide-react';
import type { SubitemKind } from './subitem-semantics';

export function CycleSubitemIdentity({ name, kind, completed, expanded, onToggle }: {
  name: string; kind: SubitemKind; completed: boolean; expanded?: boolean; onToggle?: () => void;
}) {
  return <div className="cycle-subitem-identity">
    <div className="cycle-subitem-title-row">
      <p className={completed && kind !== 'text' ? 'cycle-subitem-name is-completed' : 'cycle-subitem-name'}>{name}</p>
      {onToggle && <button type="button" className="cycle-children-disclosure" aria-expanded={!!expanded}
        aria-label={`${expanded ? 'Recolher' : 'Mostrar'} subitens de ${name}`} onClick={onToggle}>
        <ChevronDown size={16} className={`transition-transform ${expanded ? '' : '-rotate-90'}`} aria-hidden="true" />
      </button>}
    </div>
    <div className="cycle-subitem-kind">
      {completed && kind !== 'text' && <span className="cycle-subitem-done">Feito</span>}
    </div>
  </div>;
}
