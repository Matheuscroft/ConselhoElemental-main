import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { FundoSantuario } from '@/components/entry/FundoSantuario';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { areasDoElemento, contagemPorElemento, ORDEM_DO_FOCO, sanearAreas, type ElementoDoFoco } from '@/lib/sanctuary/foco-inicial';
import './foco-inicial.css';

const NOME: Record<ElementoDoFoco, string> = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' };
const PAPEL: Record<ElementoDoFoco, string> = { terra: 'Sua base', fogo: 'Sua iniciativa', agua: 'Suas conexões', ar: 'Seu conhecimento' };

const pedeMenosMovimento = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The fourth and last question of the opening: what the person wants to look after. Four glass spheres, one per
 * element; touching one opens its areas as chips, and what is chosen is counted on the sphere. Nothing is required:
 * an empty choice simply continues. The answer is a list of ids, kept on the device until the account exists.
 */
export function FocoInicial({ iniciais = [], despertou = false, aoConcluir, aoVoltar }: {
  iniciais?: readonly string[];
  despertou?: boolean;
  aoConcluir: (areas: string[]) => void;
  aoVoltar: () => void;
}) {
  const [ativo, setAtivo] = useState<ElementoDoFoco>('terra');
  const [escolhidas, setEscolhidas] = useState<ReadonlySet<string>>(() => new Set(sanearAreas(iniciais)));
  const raizRef = useRef<HTMLElement>(null);
  const abasRef = useRef<Array<HTMLButtonElement | null>>([]);
  useParalaxe(raizRef, !pedeMenosMovimento());
  useLuzDoToque(raizRef);

  const contagem = useMemo(() => contagemPorElemento(escolhidas), [escolhidas]);
  const areas = areasDoElemento(ativo);
  const total = escolhidas.size;

  const alternar = (id: string) => setEscolhidas((atual) => {
    const proximo = new Set(atual);
    if (proximo.has(id)) proximo.delete(id); else proximo.add(id);
    return proximo;
  });

  const aoTeclar = (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const salto = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[evento.key];
    if (!salto) return;
    evento.preventDefault();
    const alvo = (indice + salto + ORDEM_DO_FOCO.length) % ORDEM_DO_FOCO.length;
    setAtivo(ORDEM_DO_FOCO[alvo]);
    abasRef.current[alvo]?.focus();
  };

  const estilo = { '--pesq-cor': AURA[ativo], '--foco-acento': ACENTO[ativo] } as CSSProperties;

  return (
    <section ref={raizRef} className="pesquisa foco" aria-label="O que você quer cuidar" data-passo={3} data-signo="nao" style={estilo}>
      <FundoSantuario opacidade={0.34} />
      <div className="pesquisa-palco foco-palco">
        <header className="pesquisa-topo">
          <p className="pesquisa-eyebrow">{despertou ? 'Os quatro responderam' : 'Antes de começar'}</p>
          <div className="pesquisa-progresso" aria-hidden="true">
            {[0, 1, 2, 3].map((indice) => (
              <span key={indice} className="pesquisa-pip" data-estado={indice === 3 ? 'atual' : 'feito'} style={{ '--pip': indice } as CSSProperties}><i /></span>
            ))}
          </div>
          <p className="pesquisa-contagem" role="status" aria-live="polite">Pergunta 4 de 4</p>
        </header>

        <div className="foco-titulo">
          <h1 className="pesquisa-pergunta">O que você quer cuidar?</h1>
          <p className="pesquisa-ajuda">Toque num elemento e escolha as áreas que fazem parte da sua vida. Você muda isso quando quiser.</p>
        </div>

        <div className="foco-orbes" role="tablist" aria-label="Elementos">
          {ORDEM_DO_FOCO.map((id, indice) => (
            <button
              key={id}
              ref={(no) => { abasRef.current[indice] = no; }}
              id={`foco-aba-${id}`}
              type="button"
              role="tab"
              aria-selected={ativo === id}
              aria-controls="foco-painel"
              tabIndex={ativo === id ? 0 : -1}
              className="foco-aba"
              data-ativo={ativo === id}
              data-tem={contagem[id] > 0}
              style={{ '--aba-cor': AURA[id], '--aba-i': indice } as CSSProperties}
              onClick={() => setAtivo(id)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
            >
              <span className="foco-esfera">
                <ElementIcon element={id} size={28} />
                {contagem[id] > 0 ? <b key={contagem[id]} className="foco-contagem" aria-hidden="true">{contagem[id]}</b> : null}
              </span>
              <strong>{NOME[id]}</strong>
              <span className="sr-only">{contagem[id] > 0 ? `${contagem[id]} selecionadas` : 'nenhuma selecionada'}</span>
            </button>
          ))}
        </div>

        <div className="pesquisa-vidro">
          <span className="pesquisa-luz" aria-hidden="true" />
          <div id="foco-painel" role="tabpanel" aria-labelledby={`foco-aba-${ativo}`} className="pesquisa-painel ds-glass-float foco-painel" data-luz="">
            <div className="foco-cabeca">
              <strong>{PAPEL[ativo]}</strong>
              <small>{contagem[ativo]} de {areas.length}</small>
            </div>
            <div className="foco-areas" key={ativo}>
              {areas.map((area, indice) => {
                const marcada = escolhidas.has(area.id);
                return (
                  <button key={area.id} type="button" className="foco-area" aria-pressed={marcada} style={{ '--i': indice } as CSSProperties} onClick={() => alternar(area.id)}>
                    <span className="foco-visto" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
                    <span>{area.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pesquisa-acoes">
          <button type="button" className="pesquisa-primaria" onClick={() => aoConcluir([...escolhidas])}>
            <span>{total ? `Continuar · ${total} ${total === 1 ? 'área' : 'áreas'}` : 'Escolher depois'}</span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
          <div className="pesquisa-extra">
            <button type="button" className="pesquisa-secundaria" onClick={aoVoltar}><ArrowLeft size={16} aria-hidden="true" />Voltar</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FocoInicial;
