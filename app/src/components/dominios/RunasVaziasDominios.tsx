import type { CSSProperties } from 'react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';

/** One rune of each element, resting in an arc: the four forces waiting for an area. */
const RUNAS: readonly ElementId[] = ['fogo', 'terra', 'agua', 'ar'];

/** Decorative only; the title and the text beside it say what is empty. */
export function RunasVaziasDominios() {
  return <span className="dom-vazio-runas" aria-hidden="true">
    {RUNAS.map((elemento, ordem) => <span key={elemento} className="dom-vazio-runa" data-element={elemento} style={{ '--ordem': ordem } as CSSProperties}>
      <ElementIcon element={elemento} size={34} />
    </span>)}
  </span>;
}
