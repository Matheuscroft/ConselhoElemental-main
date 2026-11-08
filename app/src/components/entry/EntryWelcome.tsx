import { EntryBrand } from './EntryVisuals';
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
 * the opening reads as one place, and it offers one clear way forward instead
 * of five equal ones. Every destination the access guards rely on is kept.
 */
export function EntryWelcome() {
  const nome = getOpeningName();

  return (
    <div className="boas">
      <a className="boas-pular" href="#boas-titulo">
        Ir para a apresentação
      </a>

      <div className="boas-fundo" aria-hidden="true">
        <picture>
          <source
            type="image/avif"
            srcSet="/sanctuary/despertar/placa-base-390w.avif 390w, /sanctuary/despertar/placa-base-780w.avif 780w"
            sizes="100vw"
          />
          <img src="/sanctuary/despertar/reserva-390w.webp" alt="" decoding="async" />
        </picture>
      </div>

      <header className="boas-topo">
        <EntryBrand />
        <a className="boas-entrar" href="/auth">
          Entrar
        </a>
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
            Criar minha conta
          </a>
          <a className="boas-secundaria" href="/santuario">
            Experimentar sem conta
          </a>
        </div>
        <small className="boas-nota">
          Experimentando, o progresso fica neste aparelho. Você pode conectar uma conta depois.
        </small>
      </main>

      <footer className="boas-rodape">
        <a href="/?progresso=restaurar">Já uso o app. Quero trazer meu progresso.</a>
        <a href="/onboarding">Conhecer os quatro elementos</a>
      </footer>
    </div>
  );
}
