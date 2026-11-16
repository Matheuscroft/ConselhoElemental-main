import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';

const FAISCAS = Array.from({ length: 16 }, (_, indice) => indice);

/**
 * The flourish when the wheel names an activity: two rings and a circle of
 * sparks leave the centre of the wheel in the colour of the chosen element.
 * Purely decorative; the result card says what was chosen.
 */
export function FaiscasSorteio({ elemento }: { elemento: ElementId }) {
  return <span className="cas-faiscas" data-element={elemento} aria-hidden="true">
    <span className="cas-faiscas-anel" />
    <span className="cas-faiscas-anel" data-eco="" />
    {FAISCAS.map((indice) => <i key={indice} style={{ '--giro': `${indice * 22.5}deg`, '--alcance': indice % 2 === 0 ? 1 : 0.72 } as CSSProperties} />)}
  </span>;
}
