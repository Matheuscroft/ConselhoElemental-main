import { useEffect, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { formatTime } from '@/constants';
import { DURATION } from '@/lib/motion/motion';
import type { ElementId } from '@/types';
import './foco.css';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
/** The count-up takes a little longer than a conjure, and the veil stays for a few beats. */
const CONTAGEM_MS = DURATION.conjure * 1.4;
const PERMANENCIA_MS = DURATION.conjure * 3 + DURATION.settle;

function reduzido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The short seal that closes a focus session: the element's seal lights inside
 * a ring that draws itself, sparks leave it, and the total time counts up. It
 * is only the face of a completion the owner already recorded; it computes and
 * stores nothing, and a tap anywhere ends it early.
 */
function FocoCelebracao({ elemento, titulo, rotulo, segundos, aoTerminar }: {
  elemento: ElementId;
  titulo: string;
  rotulo: string;
  segundos: number;
  aoTerminar: () => void;
}) {
  const parado = reduzido();
  const [mostrado, setMostrado] = useState(parado ? segundos : 0);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    if (parado) return;
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / CONTAGEM_MS);
      setMostrado(Math.round(segundos * (1 - (1 - t) ** 3)));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [parado, segundos]);

  useEffect(() => {
    const sair = window.setTimeout(() => setSaindo(true), PERMANENCIA_MS);
    const fim = window.setTimeout(aoTerminar, PERMANENCIA_MS + DURATION.settle);
    return () => { window.clearTimeout(sair); window.clearTimeout(fim); };
  }, [aoTerminar]);

  return <div className="foco-celebra" data-element={elemento} data-saindo={saindo} role="status"
    onPointerDown={() => { setSaindo(true); window.setTimeout(aoTerminar, DURATION.settle); }}
    style={{ '--foco-cor': `var(--element-${elemento})`, '--foco-aura': `var(--aura-${elemento}, var(--element-${elemento}))` } as CSSProperties}>
    <span className="foco-celebra-luz" aria-hidden="true" />
    <span className="foco-celebra-selo" aria-hidden="true">
      <svg viewBox="0 0 200 200" focusable="false">
        <circle className="foco-celebra-trilho" cx="100" cy="100" r="92" />
        <circle className="foco-celebra-anel" cx="100" cy="100" r="92" pathLength={1} />
      </svg>
      {FAISCAS.map((i) => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
      <img src={`/sanctuary/elements/${elemento}-v1.webp`} alt="" width={112} height={112} />
    </span>
    <p className="foco-celebra-titulo">{rotulo}</p>
    <p className="foco-celebra-atividade">{titulo}</p>
    <p className="foco-celebra-tempo">
      <span className="foco-celebra-numero" aria-hidden="true">{formatTime(mostrado)}</span>
      <span className="sr-only">Tempo em foco: {formatTime(segundos)}</span>
      <small aria-hidden="true">tempo em foco</small>
    </p>
  </div>;
}

/**
 * Raises the celebration in a root of its own, because the dialog that held the
 * session closes the instant the owner records the completion, and the seal
 * has to outlive it. It removes itself when it ends.
 */
export function celebrarFoco({ elemento, titulo, segundos, rotulo = 'Foco concluído' }: {
  elemento: ElementId;
  titulo: string;
  segundos: number;
  rotulo?: string;
}): void {
  if (typeof document === 'undefined') return;
  const anfitriao = document.createElement('div');
  document.body.appendChild(anfitriao);
  const raiz = createRoot(anfitriao);
  let encerrada = false;
  const encerrar = () => {
    if (encerrada) return;
    encerrada = true;
    raiz.unmount();
    anfitriao.remove();
  };
  raiz.render(<FocoCelebracao elemento={elemento} titulo={titulo} rotulo={rotulo} segundos={Math.max(0, Math.round(segundos))} aoTerminar={encerrar} />);
}
