import { useEffect, useState, type CSSProperties } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { Contagem } from '@/components/motion/Contagem';
import { CycleSigil } from '@/components/cycles/CycleSigil';
import type { ElementId } from '@/types';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * The short flourish when a ritual is sealed: the element's sigil lights, a
 * ring of sparks leaves it and the points count up. It is only the face of
 * the notice that already existed; the reward itself is computed elsewhere.
 */
export function CelebracaoRitual({ elemento, pontos }: { elemento: ElementId; pontos: number }) {
  // The count starts at zero and moves on the next frame, so it is seen counting.
  const [alvo, setAlvo] = useState(0);
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setAlvo(pontos));
    return () => cancelAnimationFrame(quadro);
  }, [pontos]);

  return <div className="ds-altar rit-celebra" data-element={elemento} role="status">
    <span className="rit-celebra-selo" aria-hidden="true">
      <span className="rit-celebra-anel" />
      {FAISCAS.map((i) => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
      <CycleSigil element={elemento} size="card" filled />
    </span>
    <div className="rit-celebra-texto">
      <p className="font-mystic rit-celebra-titulo"><ArcaneIcon name="conquista" /> Ritual completado!</p>
      <p className="ds-nota">+{Number.isInteger(pontos) ? <Contagem valor={alvo} beat="settle" /> : pontos} pontos ganhos</p>
    </div>
  </div>;
}
