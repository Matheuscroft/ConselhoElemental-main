import { useEffect, useState, type CSSProperties } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { CycleSigil } from '@/components/cycles/CycleSigil';
import { Contagem } from '@/components/motion/Contagem';
import type { ElementId } from '@/types';
import './treino-uau.css';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * The flourish for a finished session: the element's sigil lights, a ring of
 * sparks leaves it and the XP counts up. It is only the face of the receipt
 * that already exists below it; the reward is computed elsewhere. Opening an
 * old summary from the history shows the same seal, still (`fresca` false).
 */
export function TreinoCelebracao({ elemento = 'terra', xp, fresca, formatarXp, detalhe }: {
  elemento?: ElementId;
  /** Real XP of the session, or null when there is none to show. */
  xp: number | null;
  fresca: boolean;
  /** Same formatter the receipt uses, so both read alike. */
  formatarXp: (valor: number) => string;
  detalhe?: string;
}) {
  // Counted in tenths so one decimal of XP is never rounded away.
  const final = xp === null ? 0 : Math.round(xp * 10);
  const [alvo, setAlvo] = useState(0);
  useEffect(() => {
    const quadro = requestAnimationFrame(() => setAlvo(final));
    return () => cancelAnimationFrame(quadro);
  }, [final]);
  const mostrar = fresca ? alvo : final;

  return <section className="treino-celebra ds-pane treino-entra" data-element={elemento} data-fresca={fresca} aria-label="Treino concluído">
    <span className="treino-celebra-selo" aria-hidden="true">
      {fresca && <span className="treino-celebra-anel" />}
      {fresca && FAISCAS.map((i) => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
      <CycleSigil element={elemento} size="card" filled />
    </span>
    <h2 className="treino-celebra-titulo"><ArcaneIcon name="conquista" /> Treino concluído!</h2>
    {xp !== null && xp > 0 && <p className="treino-celebra-xp">
      <span className="treino-celebra-xp-valor">+{fresca ? <Contagem valor={mostrar} beat="conjure" formatar={(valor) => formatarXp(valor / 10)} /> : formatarXp(xp)}</span>
      <span className="treino-celebra-xp-rotulo">XP de Terra</span>
    </p>}
    {detalhe && <p className="treino-celebra-nota">{detalhe}</p>}
  </section>;
}
