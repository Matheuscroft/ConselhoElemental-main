import type { ReactNode } from 'react';
import { Layers3 } from 'lucide-react';
import { FitnessCard } from '@/components/fitness-kit';

export function SequenceLibraryCard({ name, description, members, headerExtra, children, compact = false, onOpen, id, focused = false }: {
  name: string; description?: string;
  members: { id: string; name: string; current?: boolean }[];
  headerExtra?: ReactNode; children?: ReactNode;
  compact?: boolean; onOpen?: () => void; id?: string; focused?: boolean;
}) {
  const content = <>
    <div className="flex items-center gap-3"><Layers3 size={compact ? 17 : 21} className="shrink-0 text-fitness-primary" /><h3 className={`min-w-0 flex-1 break-words font-semibold ${compact ? 'text-sm' : ''}`}>{name}</h3>{headerExtra}</div>
    {description && !compact && <p className="text-sm text-fitness-muted">{description}</p>}
    <ol className={compact ? 'flex flex-wrap items-center gap-x-2 gap-y-1' : 'space-y-2'} aria-label={`Composição de ${name}`}>{members.map((member, index) => <li key={member.id} aria-current={member.current ? 'step' : undefined} className={`flex gap-2 ${compact ? 'text-xs' : 'text-sm'} ${member.current ? 'font-medium text-emerald-300' : 'text-fitness-text'}`}>{compact ? index > 0 && <span aria-hidden="true" className="text-fitness-muted">→</span> : <span className="text-fitness-primary">{index+1}</span>}<span className="min-w-0 break-words">{member.name}</span></li>)}</ol>
  </>;
  return <FitnessCard id={id} tabIndex={id ? -1 : undefined} className={`${compact ? 'space-y-3 p-3' : 'space-y-4 p-5'} ${focused ? 'ring-2 ring-fitness-primary/60' : ''}`}>
    {onOpen ? <button type="button" aria-label={`Abrir sequência ${name}`} onClick={onOpen} className="w-full space-y-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">{content}</button> : <div className={compact ? 'space-y-2' : 'space-y-4'}>{content}</div>}
    {children}
  </FitnessCard>;
}
