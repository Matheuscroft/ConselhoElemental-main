import { useEffect, useState, type ReactNode } from 'react';
import { DURATION } from '@/lib/motion/motion';
import './conjurar.css';

export interface ConjurarProps {
  /** Change this and the energy arrives. Usually the value that was earned. */
  readonly marca: string | number;
  /** Colour of the light, so an element's reward looks like that element. */
  readonly cor?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Marks the arrival of something earned. The pop is one CSS animation on the
 * conjure beat, which is the only curve in the system that overshoots, so a
 * reward never reads like a value quietly changing.
 *
 * Like the tally beside it, it stays still on first render: a page opening is
 * not an achievement.
 */
export function Conjurar({ marca, cor, className, children }: ConjurarProps) {
  const [ativo, setAtivo] = useState(false);
  const [anterior, setAnterior] = useState(marca);

  // Adjusted during render rather than in an effect, so the pop starts on the
  // same paint as the value it is marking and nothing cascades.
  if (anterior !== marca) {
    setAnterior(marca);
    setAtivo(true);
  }

  useEffect(() => {
    if (!ativo) return;
    // Cleared on the beat's own length, so the same value earned twice in a
    // row still plays instead of finding the class already set.
    const fim = window.setTimeout(() => setAtivo(false), DURATION.conjure);
    return () => window.clearTimeout(fim);
  }, [ativo]);

  return (
    <span
      className={className ? `conjurar ${className}` : 'conjurar'}
      data-ativo={ativo}
      style={cor ? ({ '--conjurar-cor': cor } as React.CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}

export default Conjurar;
