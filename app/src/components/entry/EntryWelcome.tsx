import { EntryBrand } from './EntryVisuals';
import { FundoSantuario } from '@/components/entry/FundoSantuario';
import { getOpeningName } from '@/lib/sanctuary/first-run';
import type { ElementId } from '@/types';
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
 */
export function EntryWelcome() {
  const nome = getOpeningName();

  return (
    <div className="boas">
      <a className="boas-pular" href="#boas-titulo">
        Ir para a apresentação
      </a>

      <FundoSantuario opacidade={0.52} />

      <header className="boas-topo">
        <EntryBrand />
      </header>

      <main className="boas-corpo" aria-labelledby="boas-titulo">
        {nome ? <p className="boas-saudacao">Bem-vindo, {nome}.</p> : null}
        <h1 id="boas-titulo">
          Seu cotidiano.
          <br />
          Uma nova jornada.
        </h1>
        <p className="boas-resumo">
          Organize hábitos, conclua tarefas e acompanhe a evolução do seu personagem. Um passo de
          cada vez.
        </p>

        <ul className="boas-elementos">
          {ELEMENTOS.map((elemento) => (
            <li key={elemento.id} style={{ color: `var(--element-${elemento.id})` }}>
              <strong>{elemento.nome}</strong>
              <span>{elemento.papel}</span>
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
      </main>
    </div>
  );
}
