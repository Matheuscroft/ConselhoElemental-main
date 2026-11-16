import type { ReactNode } from 'react';
import './modalidade-uau.css';

/**
 * The ring of a muscle group: the arc is the group's share of the biggest group
 * in the catalogue (never a target), drawn by the stylesheet when the rune
 * arrives. The number it holds is also said in text beside it.
 */
export function ModalidadeAnel({ fracao, children }: { fracao: number; children: ReactNode }) {
  const limitada = Number.isFinite(fracao) ? Math.min(1, Math.max(0, fracao)) : 0;
  return <span className="mo-anel" aria-hidden="true">
    <svg viewBox="0 0 44 44" focusable="false">
      <circle className="mo-anel-trilho" cx="22" cy="22" r="19" />
      {limitada > 0 && <circle className="mo-anel-arco" cx="22" cy="22" r="19" pathLength="100" strokeDasharray={`${(limitada * 100).toFixed(1)} 100`} />}
    </svg>
    <span className="mo-anel-valor">{children}</span>
  </span>;
}
