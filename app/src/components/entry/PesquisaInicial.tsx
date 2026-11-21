import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FundoSantuario } from '@/components/entry/FundoSantuario';
import { SigiloDaCidade } from '@/components/entry/pesquisa-sigilos';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { MAX_NAME_LENGTH, normaliseName } from '@/lib/sanctuary/first-run';
import { DURATION } from '@/lib/motion/motion';
import { SANCTUARY_CITIES, type SanctuaryCityId } from '@/lib/temporal/sanctuary-city';
import { parseBirthDate, zodiacProfileAt } from '@/lib/sanctuary/zodiac';

const ELEMENTO_NOME: Record<string, string> = {
  fogo: 'Fogo', terra: 'Terra', ar: 'Ar', agua: 'Água',
};

/** What each city adds to the card, in a word: the sky it looks up at. */
const CEU_DA_CIDADE: Record<SanctuaryCityId, string> = {
  recife: 'Mar e pontes',
  olinda: 'Colinas e torres',
};

/** The gold the aura burns until a birth date gives it a sign. */
const OURO = '#d5b66f';

const TOTAL = 3;
const ULTIMO = TOTAL - 1;
/** The whole survey, as the person counts it: these three and the choice of focus that follows. */
const PERGUNTAS_NO_TOTAL = TOTAL + 1;

const pedeMenosMovimento = (): boolean =>
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The questions the opening asks, one at a time. The name is how the app
 * addresses the person; the city decides the sky the sanctuary is lit by; the
 * birth date decides the colour of the aura, which lights up beside the
 * question the moment the date is complete. Every one can be skipped, and
 * none is required to use the app.
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
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState<SanctuaryCityId>(cidadeInicial);
  const [nascimento, setNascimento] = useState('');
  const [selando, setSelando] = useState(false);

  const raizRef = useRef<HTMLElement>(null);
  const cidadesRef = useRef<Array<HTMLButtonElement | null>>([]);
  const primeiroPasso = useRef(true);
  const adiamento = useRef<number | null>(null);

  const nomeId = useId();
  const cidadeId = useId();
  const nascimentoId = useId();

  // Shown the moment the date is complete: the answer to "why are you asking".
  const dataValida = parseBirthDate(nascimento);
  const signo = dataValida ? zodiacProfileAt(dataValida) : null;
  const saudacao = normaliseName(nome);

  useParalaxe(raizRef, !pedeMenosMovimento());
  useLuzDoToque(raizRef);

  // The new question takes the focus, so a screen reader reads it and a
  // keyboard continues from it. Never on the first render: the person has not
  // asked for anything yet.
  useEffect(() => {
    if (primeiroPasso.current) {
      primeiroPasso.current = false;
      return;
    }
    const alvo = raizRef.current?.querySelector<HTMLElement>(`[data-passo-id="${passo}"] [data-foco]`);
    alvo?.focus({ preventScroll: true });
  }, [passo]);

  useEffect(() => () => {
    if (adiamento.current !== null) window.clearTimeout(adiamento.current);
  }, []);

  const concluir = () => {
    if (selando) return;
    const resposta = { nome: saudacao, cidade, nascimento };
    if (pedeMenosMovimento()) {
      onConcluir(resposta);
      return;
    }
    // One beat for the orb to flare before the next screen, so the answer is
    // seen to land. Nothing is saved until it ends.
    setSelando(true);
    adiamento.current = window.setTimeout(() => onConcluir(resposta), DURATION.settle);
  };

  const avancar = () => {
    if (passo < ULTIMO) setPasso(passo + 1);
    else concluir();
  };

  const escolherCidade = (indice: number, foco: boolean) => {
    const opcao = SANCTUARY_CITIES[(indice + SANCTUARY_CITIES.length) % SANCTUARY_CITIES.length];
    setCidade(opcao.id);
    if (foco) {
      const posicao = SANCTUARY_CITIES.indexOf(opcao);
      cidadesRef.current[posicao]?.focus();
    }
  };

  const aoTeclarCidade = (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const passoDaSeta: Record<string, number> = {
      ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1,
    };
    const salto = passoDaSeta[evento.key];
    if (!salto) return;
    evento.preventDefault();
    escolherCidade(indice + salto, true);
  };

  const estado = (indice: number) => (indice === passo ? 'atual' : indice < passo ? 'antes' : 'depois');

  const estilo = { '--pesq-cor': signo?.colour ?? OURO } as CSSProperties;

  return (
    <section
      ref={raizRef}
      className="pesquisa"
      aria-label="Perguntas rápidas"
      data-passo={passo}
      data-signo={signo ? 'sim' : 'nao'}
      data-selando={selando ? '' : undefined}
      style={estilo}
    >
      <FundoSantuario opacidade={0.34} />

      <div className="pesquisa-palco">
        <header className="pesquisa-topo">
          <p className="pesquisa-eyebrow">
            {despertou ? 'Os quatro responderam' : 'Antes de começar'}
          </p>
          <div className="pesquisa-progresso" aria-hidden="true">
            {Array.from({ length: PERGUNTAS_NO_TOTAL }, (_, indice) => (
              <span
                key={indice}
                className="pesquisa-pip"
                data-estado={estado(indice) === 'atual' ? 'atual' : indice < passo ? 'feito' : 'adiante'}
                style={{ '--pip': indice } as CSSProperties}
              >
                <i />
              </span>
            ))}
          </div>
          <p className="pesquisa-contagem" role="status" aria-live="polite">
            Pergunta {passo + 1} de {PERGUNTAS_NO_TOTAL}
          </p>
        </header>

        <div className="pesquisa-orbe-area" aria-hidden="true">
          <div className="pesquisa-orbe">
            <span className="pesquisa-orbe-anel" />
            <span className="pesquisa-orbe-anel" data-volta="" />
            <span className="pesquisa-orbe-nucleo">
              <span className="pesquisa-orbe-glifo">{signo ? `${signo.icon}\uFE0E` : null}</span>
            </span>
          </div>
          <p className="pesquisa-saudacao" data-tem-nome={saudacao ? '' : undefined}>
            {saudacao ? `Bem-vindo, ${saudacao}` : ' '}
          </p>
        </div>

        <div className="pesquisa-vidro">
          <span className="pesquisa-luz" aria-hidden="true" />
          <form
            className="pesquisa-painel ds-glass-float"
            data-luz=""
            onSubmit={(evento) => {
              evento.preventDefault();
              avancar();
            }}
          >
            <div className="pesquisa-passos">
              <div
                className="pesquisa-passo"
                data-passo-id="0"
                data-estado={estado(0)}
                inert={passo !== 0}
              >
                <h1 className="pesquisa-pergunta">
                  <label htmlFor={nomeId}>Como quer ser chamado?</label>
                </h1>
                <input
                  id={nomeId}
                  data-foco=""
                  name="nome"
                  type="text"
                  autoComplete="given-name"
                  enterKeyHint="next"
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="Seu nome ou apelido"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                />
                <p className="pesquisa-ajuda">
                  É assim que o santuário vai falar com você.
                </p>
              </div>

              <div
                className="pesquisa-passo"
                data-passo-id="1"
                data-estado={estado(1)}
                inert={passo !== 1}
              >
                <h1 className="pesquisa-pergunta" id={cidadeId}>De onde você olha o céu?</h1>
                <div className="pesquisa-cidades" role="radiogroup" aria-labelledby={cidadeId}>
                  {SANCTUARY_CITIES.map((opcao, indice) => (
                    <button
                      key={opcao.id}
                      ref={(no) => { cidadesRef.current[indice] = no; }}
                      data-foco={cidade === opcao.id ? '' : undefined}
                      type="button"
                      role="radio"
                      aria-checked={cidade === opcao.id}
                      tabIndex={cidade === opcao.id ? 0 : -1}
                      className="pesquisa-cidade"
                      onClick={() => setCidade(opcao.id)}
                      onKeyDown={(evento) => aoTeclarCidade(evento, indice)}
                    >
                      <SigiloDaCidade cidade={opcao.id} />
                      <strong>{opcao.name}</strong>
                      <small>{CEU_DA_CIDADE[opcao.id]}</small>
                    </button>
                  ))}
                </div>
                <p className="pesquisa-ajuda">
                  O sol, a lua e a estação do santuário são calculados para essa cidade.
                </p>
              </div>

              <div
                className="pesquisa-passo"
                data-passo-id="2"
                data-estado={estado(2)}
                inert={passo !== 2}
              >
                <h1 className="pesquisa-pergunta">
                  <label htmlFor={nascimentoId}>Quando você nasceu?</label>
                </h1>
                <p className="pesquisa-ajuda">
                  O seu signo decide a cor da aura em volta do personagem. A data fica neste
                  aparelho e não serve a mais nada.
                </p>
                <input
                  id={nascimentoId}
                  data-foco=""
                  name="nascimento"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={nascimento}
                  onChange={(evento) => setNascimento(evento.target.value)}
                />
                <p className="pesquisa-signo" aria-live="polite" data-acesa={signo ? '' : undefined}>
                  {signo
                    ? `${signo.icon}\uFE0E ${signo.name} · ${ELEMENTO_NOME[signo.element]}`
                    : 'Sem data, a aura fica dourada.'}
                </p>
              </div>
            </div>

            <div className="pesquisa-acoes">
              <button type="submit" className="pesquisa-primaria" disabled={selando}>
                <span>Continuar</span>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
              <div className="pesquisa-extra">
                {passo > 0 ? (
                  <button
                    type="button"
                    className="pesquisa-secundaria"
                    disabled={selando}
                    onClick={() => setPasso(passo - 1)}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Voltar
                  </button>
                ) : null}
                <button type="button" className="pesquisa-secundaria" disabled={selando} onClick={onPular}>
                  Responder depois
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default PesquisaInicial;
