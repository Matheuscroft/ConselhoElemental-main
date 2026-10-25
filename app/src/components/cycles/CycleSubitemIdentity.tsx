import { Layers3, ListChecks, StickyNote } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import type { SubitemKind } from './subitem-semantics';

export function CycleSubitemIdentity({ name, kind, childCount, path, completed }: {
  name: string; kind: SubitemKind; childCount: number; path: string; completed: boolean;
}) {
  const group = childCount > 0;
  return <div className="cycle-subitem-identity">
    <div className="cycle-subitem-kind">
      <span className="cycle-subitem-path" aria-label={`Posição ${path}`}>{path}</span>
      {kind === 'text' ? <StickyNote size={14} aria-hidden="true" /> : group ? <Layers3 size={14} aria-hidden="true" /> : kind === 'structural' ? <ListChecks size={14} aria-hidden="true" /> : <ArcaneIcon name="ritual" size={14} />}
      <span>{kind === 'text' ? 'Nota' : group ? 'Etapa' : kind === 'structural' ? 'Checklist' : 'Ação'}</span>
      {completed && kind !== 'text' && <span className="cycle-subitem-done">Feito</span>}
    </div>
    <p className={completed && kind !== 'text' ? 'cycle-subitem-name is-completed' : 'cycle-subitem-name'}>{name}</p>
    <small>{kind === 'text' ? 'Referência para a execução' : group ? `${childCount} subitens nesta etapa` : kind === 'structural' ? 'Marque ao terminar · sem pontuação' : 'Conclua quando realizar esta ação'}</small>
  </div>;
}
