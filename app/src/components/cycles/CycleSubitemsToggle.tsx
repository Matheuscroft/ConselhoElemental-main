import { ChevronDown } from 'lucide-react';

interface Props {
  name: string;
  expanded: boolean;
  completed: number;
  total: number;
  notes?: number;
  onToggle: () => void;
}

export function CycleSubitemsToggle({ name, expanded, completed, total, notes = 0, onToggle }: Props) {
  return (
    <button type="button" className="cycle-subitems-toggle" aria-expanded={expanded}
      aria-label={`${expanded ? 'Recolher' : 'Mostrar'} subitens de ${name}, ${completed} de ${total} concluídos${notes ? `, ${notes} notas` : ''}`} onClick={onToggle}>
      <span>{total ? <>Ações <strong>{completed}/{total}</strong></> : 'Notas'}{notes > 0 && <small>{notes} {notes === 1 ? 'nota' : 'notas'}</small>}</span>
      {total > 0 && <span className="cycle-subitems-track" aria-hidden="true"><span style={{ width: `${completed / total * 100}%` }} /></span>}
      <ChevronDown size={18} aria-hidden="true" />
    </button>
  );
}
