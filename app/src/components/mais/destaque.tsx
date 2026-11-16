import type { ReactNode } from 'react';
import { trechoAchado } from './trecho';

/** The text with the part that answered the search marked; the text itself when nothing matches. */
export function Destacado({ texto, busca }: { texto: string; busca?: string }): ReactNode {
  const trecho = busca ? trechoAchado(texto, busca) : null;
  if (!trecho) return texto;
  return (
    <>
      {texto.slice(0, trecho[0])}
      <mark className="destaque">{texto.slice(trecho[0], trecho[1])}</mark>
      {texto.slice(trecho[1])}
    </>
  );
}
