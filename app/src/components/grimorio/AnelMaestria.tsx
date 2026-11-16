import type { CSSProperties } from 'react';
import { Contagem } from '@/components/motion/Contagem';

const RAIO = 29;

/**
 * The ring around an element's emblem: the arc of the level being climbed,
 * drawn in the element's own colour, with a spark that keeps going around. The
 * level sits in a small seal. Without any XP the ring is a promise: a faint arc
 * that breathes. It is decoration; the numbers are also written as text next to it.
 */
export function AnelMaestria({ fracao, nivel, chegou = true }: { fracao: number; nivel: number; chegou?: boolean }) {
  const limite = Number.isFinite(fracao) ? Math.min(1, Math.max(0, fracao)) : 0;
  const vazio = limite <= 0;
  const estilo = { '--arco': (limite * 100).toFixed(2) } as CSSProperties;
  return <>
    <svg className="gr-anel" viewBox="0 0 64 64" aria-hidden="true" focusable="false" style={estilo}>
      <circle className="gr-anel-trilha" cx="32" cy="32" r={RAIO} />
      {vazio
        ? <circle className="gr-anel-promessa" cx="32" cy="32" r={RAIO} pathLength={100} />
        : <>
          <circle className="gr-anel-halo" cx="32" cy="32" r={RAIO} pathLength={100} />
          <circle className="gr-anel-arco" cx="32" cy="32" r={RAIO} pathLength={100} />
          <circle className="gr-anel-cometa" cx="32" cy="32" r={RAIO} pathLength={100} />
        </>}
    </svg>
    <span className="gr-anel-selo" aria-hidden="true"><Contagem valor={chegou ? nivel : 0} /></span>
  </>;
}
