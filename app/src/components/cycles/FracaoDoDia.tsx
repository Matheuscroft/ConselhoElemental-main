import { useEffect, useState } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { contagemValor } from '@/lib/motion/contagem';
import { DURATION } from '@/lib/motion/motion';

/**
 * "feitos/total" of the day. The done count climbs when something is finished
 * here, in front of the person, like every other earned number in the app. It
 * jumps when the day or the list changes (counting from one day's tally to
 * another's would be a number running for no reason).
 *
 * It is written as one text node, so a reader of the markup, and the tests
 * that read it, still see "3/7" and not three fragments.
 */
export function FracaoDoDia({ feitos, total }: { feitos: number; total: number }) {
  const reduzido = useMotionPreference();
  const [mostrado, setMostrado] = useState(feitos);
  const [partida, setPartida] = useState(feitos);
  const [alvo, setAlvo] = useState(feitos);
  const [totalVisto, setTotalVisto] = useState(total);

  // Adjusted during render, as `Contagem` does: the final value is never
  // flashed for a frame before the count begins.
  if (alvo !== feitos || totalVisto !== total) {
    const contar = totalVisto === total && feitos > alvo && !reduzido;
    setAlvo(feitos);
    setTotalVisto(total);
    setPartida(contar ? mostrado : feitos);
    if (!contar) setMostrado(feitos);
  }

  useEffect(() => {
    if (partida === feitos) return;
    let quadro = 0;
    const inicio = performance.now();
    const passo = (agora: number) => {
      const progresso = Math.min(1, (agora - inicio) / DURATION.conjure);
      setMostrado(contagemValor(partida, feitos, progresso));
      if (progresso < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [partida, feitos]);

  return <span className="cycle-day-fraction" aria-hidden="true">{`${mostrado}/${total}`}</span>;
}

export default FracaoDoDia;
