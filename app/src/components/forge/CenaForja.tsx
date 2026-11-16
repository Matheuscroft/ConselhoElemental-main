import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { luzDoElemento, useElementoDaSemana } from './luz-da-semana';
import { useEntradaForja } from './useEntradaForja';

/**
 * The scene of the Forge: the light of the element leading the week behind the
 * heading, the arrival choreographed once per opening of the app, the finger's
 * light on every `[data-luz]` surface and a little depth that follows the hand.
 */
export function CenaForja({ children }: { children: ReactNode }) {
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);
  const entrada = useEntradaForja();
  const luz = luzDoElemento(useElementoDaSemana());

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return <div ref={cenaRef} className="elemental-system forge-workspace forge-cena" data-entrada={entrada} style={luz}>
    <div className="forge-luz" aria-hidden="true" />
    {children}
  </div>;
}
