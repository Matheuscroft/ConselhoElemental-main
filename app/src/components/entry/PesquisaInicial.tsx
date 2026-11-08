import { useId, useState } from 'react';
import { MAX_NAME_LENGTH, normaliseName } from '@/lib/sanctuary/first-run';
import { SANCTUARY_CITIES, type SanctuaryCityId } from '@/lib/temporal/sanctuary-city';

/**
 * The two questions the opening asks, and no more. The name is how the app
 * addresses the person; the city decides the sky the sanctuary is lit by.
 * Both can be skipped, and neither is required to use the app.
 */
export interface PesquisaInicialProps {
  readonly cidadeInicial: SanctuaryCityId;
  readonly onConcluir: (resposta: { nome: string; cidade: SanctuaryCityId }) => void;
  readonly onPular: () => void;
}

export function PesquisaInicial({ cidadeInicial, onConcluir, onPular }: PesquisaInicialProps) {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState<SanctuaryCityId>(cidadeInicial);
  const nomeId = useId();
  const cidadeId = useId();

  return (
    <section className="pesquisa" aria-labelledby={`${nomeId}-titulo`}>
      <form
        className="pesquisa-cartao"
        onSubmit={(event) => {
          event.preventDefault();
          onConcluir({ nome: normaliseName(nome), cidade });
        }}
      >
        <p className="pesquisa-eyebrow">Antes de começar</p>
        <h1 id={`${nomeId}-titulo`}>Duas perguntas rápidas</h1>
        <p className="pesquisa-intro">
          Servem para o santuário falar com você e para o céu dele acompanhar o seu.
        </p>

        <label className="pesquisa-campo" htmlFor={nomeId}>
          <span>Como quer ser chamado?</span>
          <input
            id={nomeId}
            name="nome"
            type="text"
            autoComplete="given-name"
            enterKeyHint="next"
            maxLength={MAX_NAME_LENGTH}
            placeholder="Seu nome ou apelido"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </label>

        <fieldset className="pesquisa-campo pesquisa-cidades">
          <legend id={cidadeId}>De onde você olha o céu?</legend>
          <p className="pesquisa-ajuda">
            O sol, a lua e a estação do santuário são calculados para essa cidade.
          </p>
          <div className="pesquisa-opcoes" role="radiogroup" aria-labelledby={cidadeId}>
            {SANCTUARY_CITIES.map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                role="radio"
                aria-checked={cidade === opcao.id}
                className="pesquisa-opcao"
                onClick={() => setCidade(opcao.id)}
              >
                {opcao.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="pesquisa-acoes">
          <button type="submit" className="pesquisa-primaria">
            Continuar
          </button>
          <button type="button" className="pesquisa-secundaria" onClick={onPular}>
            Responder depois
          </button>
        </div>
      </form>
    </section>
  );
}

export default PesquisaInicial;
