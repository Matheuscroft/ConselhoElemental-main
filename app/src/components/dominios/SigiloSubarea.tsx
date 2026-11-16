import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';
import { marcasDoSigilo } from './entrada-dominios';

/**
 * The mark of one subarea: a ring that draws itself, twelve ticks that are
 * short or long by the subarea's own name, and the element's rune at the
 * centre. Linked subareas burn; unlinked ones rest dim. Decorative only: the
 * name and the state are said in text beside it.
 */
export function SigiloSubarea({ elemento, nome, ativo, tamanho = 56 }: { elemento: ElementId; nome: string; ativo: boolean; tamanho?: number }) {
  const marcas = marcasDoSigilo(nome);
  return <span className="dom-sigilo" data-element={elemento} data-ativo={ativo ? '' : undefined} style={{ width: tamanho, height: tamanho }} aria-hidden="true">
    <svg viewBox="0 0 64 64" focusable="false">
      <circle className="dom-sigilo-anel" cx="32" cy="32" r="29" pathLength="100" />
      <g className="dom-sigilo-marcas">
        {marcas.map((longa, indice) => <path key={indice} d={longa ? 'M32 8v7' : 'M32 8v3.5'} transform={`rotate(${indice * 30} 32 32)`} />)}
      </g>
    </svg>
    <span className="dom-sigilo-centro"><ElementIcon element={elemento} size={Math.round(tamanho * 0.42)} /></span>
  </span>;
}

/**
 * A progress ring for an area's rune. `fracao` is the area's share of the
 * strongest visible area (0 to 1), so the ring shows where the points gather,
 * never a target. The arc is drawn by the stylesheet when its group opens.
 */
export function RunaDaArea({ elemento, fracao }: { elemento: ElementId; fracao: number }) {
  const limitada = Number.isFinite(fracao) ? Math.min(1, Math.max(0, fracao)) : 0;
  return <span className="dom-runa" aria-hidden="true">
    <svg viewBox="0 0 48 48" focusable="false">
      <circle className="dom-runa-trilho" cx="24" cy="24" r="21" />
      {limitada > 0 && <circle className="dom-runa-arco" cx="24" cy="24" r="21" pathLength="100" strokeDasharray={`${(limitada * 100).toFixed(1)} 100`} />}
    </svg>
    <span className="dom-runa-centro"><ElementIcon element={elemento} size={22} /></span>
  </span>;
}
