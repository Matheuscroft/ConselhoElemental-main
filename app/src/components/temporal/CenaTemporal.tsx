import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { ACENTO, AURA } from '@/lib/design/palette';
import { LuzDaSemanaContext } from './luz-da-semana';
import { useConclusoesDoApp } from './useElementosDosDias';
import { useEntradaTemporal } from './useEntradaTemporal';

/**
 * The room of the Temporal screens: one light from above in the colour of the
 * element that leads the person's week (gold while the week has no leader),
 * depth that leans with the finger, and the arrival decided once per opening
 * of the app. It is the same recipe as Ciclos, with its own flag.
 */
export function CenaTemporal({ className = '', children }: { className?: string; children: ReactNode }) {
  const conclusoes = useConclusoesDoApp();
  const [hoje] = useState(() => new Date());
  const elemento = useMemo(() => elementoDaSemana(conclusoes, hoje).elemento, [conclusoes, hoje]);
  const luz = useMemo(() => ({
    '--semana-acento': elemento ? ACENTO[elemento] : 'rgb(var(--el-gold))',
    '--semana-aura': elemento ? AURA[elemento] : '#d6b66f',
  }) as CSSProperties, [elemento]);

  const reduzido = useMotionPreference();
  const entrada = useEntradaTemporal();
  const cenaRef = useRef<HTMLElement>(null);
  useLuzDoToque(cenaRef);
  useParalaxe(cenaRef, !reduzido);

  return (
    <LuzDaSemanaContext.Provider value={luz}>
      <section ref={cenaRef} className={`temporal-surface ${className}`} data-entrada={entrada} data-elemento={elemento ?? 'ouro'} style={luz}>
        {children}
      </section>
    </LuzDaSemanaContext.Provider>
  );
}

export default CenaTemporal;
