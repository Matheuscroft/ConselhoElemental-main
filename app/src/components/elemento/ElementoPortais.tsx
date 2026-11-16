import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENT_ORDER, elementHref } from '@/components/elemental/navigation';
import { ELEMENTS, type ElementId } from '@/constants';
import { ElementoAbas } from './ElementoAbas';

/**
 * The four elements as portals: an orb of each one's own colour, and a marker
 * of light that slides to the one you are in. The links are the same links as
 * before (`aria-current` marks the page); only what surrounds them is new.
 */
export function ElementoPortais({ id }: { id: ElementId }) {
  return <ElementoAbas tag="nav" className="elemento-portais" aria-label="Trocar elemento">
    {ELEMENT_ORDER.map((item, ordem) => <Link
      key={item}
      to={elementHref(item)}
      className="elemento-portal"
      data-element={item}
      aria-current={item === id ? 'page' : undefined}
      style={{ '--ordem': ordem } as CSSProperties}
    >
      <span className="elemento-orbe" aria-hidden="true"><ElementIcon element={item} size={30} /></span>
      <span className="elemento-portal-nome">{ELEMENTS[item].name}</span>
    </Link>)}
  </ElementoAbas>;
}

export default ElementoPortais;
