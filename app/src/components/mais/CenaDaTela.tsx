import { useRef, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { EntradaDaCenaContexto, useEntradaDaTela, useLuzDaSemana, type TelaDaPassada } from './useCenaDaTela';
import './cena-da-tela.css';

/**
 * The scene of the Map, the Moon and the Seasons: the light of the element
 * that leads the week behind the heading, the arrival staged once per opening
 * of the app (only a fade when coming back), the finger's light on every
 * `[data-luz]` surface and a little depth that follows the hand. It only
 * reads: nothing here writes or scores.
 */
export function CenaDaTela({ tela, className, children }: { tela: Exclude<TelaDaPassada, 'hub'>; className?: string; children: ReactNode }) {
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);
  const luz = useLuzDaSemana();
  const { entrada, abrindo } = useEntradaDaTela(tela);

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return (
    <EntradaDaCenaContexto.Provider value={entrada}>
      <div ref={cenaRef} className={className ? `cena ${className}` : 'cena'} data-entrada={entrada} data-abrindo={abrindo} style={luz}>
        <div className="cena-luz" aria-hidden="true" />
        {children}
      </div>
    </EntradaDaCenaContexto.Provider>
  );
}

export default CenaDaTela;
