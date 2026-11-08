import { useId, useState } from 'react';
import { FundoSantuario } from '@/components/entry/FundoSantuario';
import { MAX_NAME_LENGTH, normaliseName } from '@/lib/sanctuary/first-run';
import { SANCTUARY_CITIES, type SanctuaryCityId } from '@/lib/temporal/sanctuary-city';
import { parseBirthDate, zodiacProfileAt } from '@/lib/sanctuary/zodiac';

const ELEMENTO_NOME: Record<string, string> = {
  fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água',
};

/**
 * The two questions the opening asks, and no more. The name is how the app
 * addresses the person; the city decides the sky the sanctuary is lit by.
 * Both can be skipped, and neither is required to use the app.
 */
export interface PesquisaInicialProps {
  readonly cidadeInicial: SanctuaryCityId;
  /** True when the person actually woke the four, rather than skipping. */
  readonly despertou?: boolean;
  readonly onConcluir: (resposta: { nome: string; cidade: SanctuaryCityId; nascimento: string }) => void;
  readonly onPular: () => void;
}

export function PesquisaInicial({
  cidadeInicial,
  despertou = false,
  onConcluir,
  onPular,
}: PesquisaInicialProps) {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState<SanctuaryCityId>(cidadeInicial);
  const [nascimento, setNascimento] = useState('');
  const nomeId = useId();
  const cidadeId = useId();
  const nascimentoId = useId();
  // Shown the moment the date is complete: the answer to "why are you asking".
  const dataValida = parseBirthDate(nascimento);
  const signo = dataValida ? zodiacProfileAt(dataValida) : null;

  return (
    <section className="pesquisa" aria-labelledby={`${nomeId}-titulo`}>
      <FundoSantuario opacidade={0.34} />

      <form
        className="pesquisa-cartao"
        onSubmit={(event) => {
          event.preventDefault();
          onConcluir({ nome: normaliseName(nome), cidade, nascimento });
        }}
      >
        <p className="pesquisa-eyebrow">
          {despertou ? 'Os quatro responderam' : 'Antes de começar'}
        </p>
        <h1 id={`${nomeId}-titulo`}>Três perguntas rápidas</h1>
        <p className="pesquisa-intro">
          Servem para o santuário falar com você, para o céu dele acompanhar o seu, e para
          a sua aura ter a sua cor.
        </p>

        <label className="pesquisa-campo" htmlFor={nomeId}>
          <span>Como quer ser chamado?</span>
          <input
            id={nomeId}
            name="nome"
            type="text"
            autoComplete="given-name"
            enterKeyHint="go"
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

        <label className="pesquisa-campo" htmlFor={nascimentoId}>
          <span>Quando você nasceu?</span>
          <p className="pesquisa-ajuda">
            O seu signo decide a cor da aura em volta do personagem. A data fica neste
            aparelho e não serve a mais nada.
          </p>
          <input
            id={nascimentoId}
            name="nascimento"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={nascimento}
            onChange={(event) => setNascimento(event.target.value)}
          />
          <p className="pesquisa-signo" aria-live="polite">
            {signo
              ? `${signo.icon} ${signo.name} · ${ELEMENTO_NOME[signo.element]}`
              : 'Sem data, a aura fica dourada.'}
          </p>
        </label>

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
