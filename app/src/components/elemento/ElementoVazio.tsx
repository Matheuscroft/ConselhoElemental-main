import { useId, type ReactNode } from 'react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/constants';

/**
 * Nothing to show, said as an invitation: the element's own rune inside a ring
 * of light that breathes, a title, a line and the way out. Decorative parts
 * are hidden from assistive technology; the words carry the meaning.
 */
export function ElementoVazio({ elemento, titulo, texto, acoes }: {
  elemento: ElementId;
  titulo: string;
  texto: ReactNode;
  acoes: ReactNode;
}) {
  const id = useId();
  return <div className="elemento-vazio ds-pane" role="group" aria-labelledby={id} data-element={elemento}>
    <span className="elemento-vazio-orbe" aria-hidden="true"><ElementIcon element={elemento} size={34} /></span>
    <h3 id={id}>{titulo}</h3>
    <p>{texto}</p>
    <div className="elemento-vazio-acoes">{acoes}</div>
  </div>;
}

export default ElementoVazio;
