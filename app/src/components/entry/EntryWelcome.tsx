import { useRef, type CSSProperties } from 'react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { EntryBrand } from './EntryVisuals';
import { FundoSantuario } from '@/components/entry/FundoSantuario';
import { getOpeningName } from '@/lib/sanctuary/first-run';
import type { ElementId } from '@/types';
// The welcome path loads the foundation but not the motion tokens, and every
// beat below is one of them. The bundler keeps a single copy of the file.
import '@/styles/elemental-motion.css';
import './boas-vindas.css';

const ELEMENTOS: ReadonlyArray<{ id: ElementId; nome: string; papel: string }> = [
  { id: 'terra', nome: 'Terra', papel: 'sua base' },
  { id: 'fogo', nome: 'Fogo', papel: 'sua iniciativa' },
  { id: 'agua', nome: 'Água', papel: 'suas conexões' },
  { id: 'ar', nome: 'Ar', papel: 'seu conhecimento' },
];

/**
 * The entry, reached after the awakening. It keeps the sanctuary behind it so
 * the opening reads as one place, and it offers one clear way forward and one for
 * people who already have an account.
 *
 * It is the first thing a person sees of the app, so the arrival is staged on
 * every opening: the light comes up on the plate, the brand, the heading line
 * by line, then the pane of glass with the four elements lighting one by one
 * and the buttons rising last. The depth follows the finger (or the tilt, where
 * the browser hands it over without asking) and the light follows the finger
 * across the glass. It only reads: nothing here writes.
 */
export function EntryWelcome() {
  const nome = getOpeningName();
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return (
    <div className="boas" ref={cenaRef}>
      <a className="boas-pular" href="#boas-titulo">
        Ir para a apresentação
      </a>

      <FundoSantuario opacidade={0.62} viva />

      <header className="boas-topo">
        <EntryBrand />
      </header>

      <main className="boas-corpo" aria-labelledby="boas-titulo">
        {nome ? <p className="boas-saudacao">Bem-vindo, {nome}.</p> : null}
        <h1 id="boas-titulo">
          <span className="boas-linha">Seu cotidiano.</span>{' '}
          <span className="boas-linha boas-linha-ouro">Uma nova jornada.</span>
        </h1>

        <div className="boas-painel ds-glass-float" data-luz>
          <p className="boas-resumo">
            Organize hábitos, conclua tarefas e acompanhe a evolução do seu personagem. Um passo de
            cada vez.
          </p>

          <ul className="boas-elementos">
            {ELEMENTOS.map((elemento, indice) => (
              <li
                key={elemento.id}
                className="boas-selo"
                style={{ '--selo-cor': `var(--element-${elemento.id})`, '--selo-i': indice } as CSSProperties}
              >
                <span className="boas-sigilo" aria-hidden="true">
                  <ElementIcon element={elemento.id} size={26} />
                </span>
                <span className="boas-selo-texto">
                  <strong>{elemento.nome}</strong>
                  <span>{elemento.papel}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="boas-acoes">
            <a className="boas-primaria" href="/auth?modo=cadastro">
              Começar
            </a>
            <a className="boas-secundaria" href="/auth">
              Já tenho conta
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
