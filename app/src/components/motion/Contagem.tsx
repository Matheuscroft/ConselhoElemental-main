import { useEffect, useState } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { contagemValor } from '@/lib/motion/contagem';
import { DURATION, type DurationName } from '@/lib/motion/motion';

export interface ContagemProps {
  readonly valor: number;
  /** Which beat the tally runs over. Earning something is a conjure. */
  readonly beat?: DurationName;
  readonly formatar?: (valor: number) => string;
  readonly className?: string;
}

/**
 * A number that counts to its new value instead of swapping to it, so a
 * person sees that they earned something rather than finding it already
 * there.
 *
 * It never runs on first render: arriving on a page is not an achievement,
 * and counting up from zero every time someone opens the app would cheapen
 * the moment this exists for. Interrupting it is safe — a new target starts
 * from wherever the number currently reads, not from where the last run began.
 */
export function Contagem({ valor, beat = 'conjure', formatar, className }: ContagemProps) {
  const reduced = useMotionPreference();
  const [mostrado, setMostrado] = useState(valor);
  /** Where the current run starts, and the target it was started for. */
  const [partida, setPartida] = useState(valor);
  const [alvo, setAlvo] = useState(valor);

  // Adjusted during render, which is React's own answer to state that has to
  // follow a prop: it re-renders before painting, so the final value is never
  // flashed for a frame, and it is not an effect, so nothing cascades. State
  // rather than refs, because a ref may not be read while rendering.
  if (alvo !== valor) {
    setAlvo(valor);
    setPartida(mostrado);
    if (reduced) setMostrado(valor);
  }

  useEffect(() => {
    if (reduced || partida === valor) return;

    let frame = 0;
    const inicio = performance.now();
    const duracao = DURATION[beat];

    const passo = (agora: number) => {
      const progresso = Math.min(1, (agora - inicio) / duracao);
      setMostrado(contagemValor(partida, valor, progresso));
      if (progresso < 1) frame = requestAnimationFrame(passo);
    };

    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [valor, partida, beat, reduced]);

  return <span className={className}>{formatar ? formatar(mostrado) : mostrado}</span>;
}

export default Contagem;
