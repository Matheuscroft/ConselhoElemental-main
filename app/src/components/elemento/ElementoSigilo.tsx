import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/constants';
import { marcasDoSigilo } from './elemento-entrada';

/**
 * The mark of one area: twelve ticks, short or long by the area's own name, so
 * no two areas wear the same sigil; an arc inside them that draws the area's
 * share of the strongest area of the element (where the points gather, never a
 * target); and the element's rune at the centre. An active area burns, an
 * available one rests dim. Decorative only: the name and the state are said in
 * text beside it.
 */
export function ElementoSigilo({ elemento, nome, fracao, ativa }: {
  elemento: ElementId;
  nome: string;
  /** 0 to 1. */
  fracao: number;
  ativa: boolean;
}) {
  const marcas = marcasDoSigilo(nome);
  const limitada = Number.isFinite(fracao) ? Math.min(1, Math.max(0, fracao)) : 0;
  return <span className="elemento-sigilo" data-ativa={ativa ? '' : undefined} aria-hidden="true">
    <svg viewBox="0 0 64 64" focusable="false">
      <circle className="elemento-sigilo-trilho" cx="32" cy="32" r="20" />
      {limitada > 0 ? <circle className="elemento-sigilo-arco" cx="32" cy="32" r="20" pathLength={100} strokeDasharray={`${(limitada * 100).toFixed(1)} 100`} /> : null}
      <g className="elemento-sigilo-marcas">
        {marcas.map((longa, indice) => <path key={indice} d={longa ? 'M32 2.5v7' : 'M32 2.5v3.5'} transform={`rotate(${indice * 30} 32 32)`} />)}
      </g>
    </svg>
    <span className="elemento-sigilo-centro"><ElementIcon element={elemento} size={22} /></span>
  </span>;
}

export default ElementoSigilo;
