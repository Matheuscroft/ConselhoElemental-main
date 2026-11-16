import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { useElementoDaSemana } from '@/components/forge/luz-da-semana';
import { ACENTO, AURA } from '@/lib/design/palette';
import type { ElementId } from '@/types';
import { useEntradaInvocar } from './useEntradaInvocar';

/**
 * The room of the invocation: a light behind the heading, in the colour of the
 * element the person picked (or, before that, the one leading the week), which
 * changes colour smoothly when the pick changes. The arrival is choreographed
 * once per opening of the app, the finger's light follows over every `[data-luz]`
 * surface and the depth follows the hand. It only reads: nothing here writes.
 */
export function CenaInvocar({ elemento, children }: { elemento: ElementId | null; children: ReactNode }) {
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);
  const entrada = useEntradaInvocar();
  const semana = useElementoDaSemana();
  const luzDe = elemento ?? semana;
  const luz = luzDe
    ? ({ '--inv-acento': ACENTO[luzDe], '--inv-aura': AURA[luzDe] } as CSSProperties)
    : undefined;

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return <div ref={cenaRef} className="elemental-system invocation inv-cena" data-entrada={entrada} style={luz}>
    <div className="inv-luz" aria-hidden="true" />
    {children}
  </div>;
}
