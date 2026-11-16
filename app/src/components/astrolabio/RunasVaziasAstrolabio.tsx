import type { CSSProperties, ReactNode } from 'react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/constants';

/** One rune of each element, resting in an arc: the four forces waiting for a first record. */
const RUNAS: readonly ElementId[] = ['fogo', 'terra', 'agua', 'ar'];

/** Nothing to read yet, said as an invitation. The runes are decorative; the title and the text say what is empty. */
export function VazioAstrolabio({ titulo, children, className = '' }: { titulo?: string; children: ReactNode; className?: string }) {
  return <div className={`ast-vazio ${className}`.trim()}>
    <span className="ast-vazio-runas" aria-hidden="true">
      {RUNAS.map((elemento, ordem) => <span key={elemento} className="ast-vazio-runa" data-element={elemento} style={{ '--ordem': ordem } as CSSProperties}>
        <ElementIcon element={elemento} size={34} />
      </span>)}
    </span>
    {titulo ? <h3>{titulo}</h3> : null}
    {children}
  </div>;
}
