import type { ReactNode } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

/** Sequence operations stay with Ciclos; this component only discloses their context. */
export function CycleSequenceShowcase({ name, description, members, headerExtra, children, onOpen, active }: {
  name: string; description?: string; active: boolean;
  members: { id: string; name: string; current?: boolean }[];
  headerExtra?: ReactNode; children?: ReactNode; onOpen?: () => void;
}) {
  const current = members.find(member => member.current);
  return <details className="cycle-sequence-showcase">
    <summary><span className="cycle-sequence-seal"><ArcaneIcon name="ciclo" size={30} /></span><span className="cycle-sequence-title"><small>{active ? 'Sequência ativa' : 'Sequência pausada'}</small><strong>{name}</strong><span>{current ? `Na vez: ${current.name}` : 'Sem ciclo atual'}</span></span><ChevronDown size={20} aria-hidden="true" /></summary>
    <div className="cycle-sequence-body">{headerExtra}{description && <p>{description}</p>}
      {members.length ? <ol aria-label={`Composição de ${name}`}>{members.map((member, index) => <li key={member.id} aria-current={member.current ? 'step' : undefined}><span className="cycle-sequence-step">{index + 1}</span><span>{member.name}{member.current && <small>Na vez</small>}</span></li>)}</ol> : <p>Adicione ciclos pelos detalhes da sequência para organizar a ordem de execução.</p>}
      {onOpen && <button type="button" className="cycle-sequence-open" onClick={onOpen}>Abrir sequência<ArrowUpRight size={18} aria-hidden="true" /></button>}
      <div className="cycle-sequence-actions">{children}</div>
    </div>
  </details>;
}
