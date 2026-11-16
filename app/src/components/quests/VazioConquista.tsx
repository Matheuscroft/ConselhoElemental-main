import { useId, type CSSProperties, type ReactNode } from 'react';
import type { ElementId } from '@/types';
import { QuestRune } from './QuestRune';

/** One rune of each element, resting in an arc: the four forces waiting for a first conquest. */
const RUNAS: readonly ElementId[] = ['fogo', 'terra', 'agua', 'ar'];

/** Nothing to show yet, said as an invitation. Same box as the system's empty state, with the elements lit. */
export function VazioConquista({ titulo, texto, acao, compacto = false }: { titulo: string; texto?: ReactNode; acao?: ReactNode; compacto?: boolean }) {
  const id = useId();
  return <div className="ds-vazio cq-vazio" role="group" aria-labelledby={id} data-compacto={compacto ? '' : undefined}>
    <span className="cq-vazio-runas" aria-hidden="true">
      {RUNAS.map((elemento, ordem) => <span key={elemento} className="cq-vazio-runa" data-element={elemento} style={{ '--ordem': ordem } as CSSProperties}>
        <QuestRune element={elemento} size={compacto ? 32 : 44} />
      </span>)}
    </span>
    <h3 id={id}>{titulo}</h3>
    {texto ? <p>{texto}</p> : null}
    {acao ?? null}
  </div>;
}
