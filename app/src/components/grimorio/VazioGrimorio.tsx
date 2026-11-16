import { useId, type CSSProperties, type ReactNode } from 'react';
import type { ElementId } from '@/types';

/** One orb of each element, resting in an arc: the four forces waiting for the first page. */
const ORBES: readonly ElementId[] = ['fogo', 'terra', 'agua', 'ar'];

/** An empty page of the Grimoire, said as an invitation and not as an error. */
export function VazioGrimorio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  const id = useId();
  return <div className="gr-vazio" role="group" aria-labelledby={id}>
    <div className="gr-vazio-orbes" aria-hidden="true">
      {ORBES.map((elemento, ordem) => <span key={elemento} className="gr-vazio-orbe" data-element={elemento} style={{ '--ordem': ordem } as CSSProperties}>
        <img src={`/sanctuary/elements/${elemento}-v1.webp`} width={128} height={128} alt="" loading="lazy" />
      </span>)}
    </div>
    <h3 id={id}>{titulo}</h3>
    <p>{texto}</p>
    {acao}
  </div>;
}
