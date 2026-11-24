import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS } from '@/constants';
import { ACENTO, type ElementoId } from '@/lib/design/palette';
import type { Area } from '@/types';
import { SUGESTOES } from './CycleCreationForm';
import { CycleCategoryPicker } from './CycleCategoryPicker';
import { ATALHOS, ritmoAtivo } from './CycleRhythmPresets';
import type { RecurrenceEditorValue } from './RecurrenceEditor';
import './ciclos-assistente.css';

const PASSOS = ['O quê', 'Elemento', 'Ritmo'] as const;
const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
const TODOS = [0, 1, 2, 3, 4, 5, 6];
/** How hard a cycle is, as the points it is worth. Light is what every cycle was born with. */
export const ESFORCOS: ReadonlyArray<{ pontos: number; nome: string; dica: string }> = [
  { pontos: 1, nome: 'Leve', dica: 'um passo pequeno' },
  { pontos: 3, nome: 'Médio', dica: 'pede foco' },
  { pontos: 5, nome: 'Intenso', dica: 'um desafio' },
];
export const DURACOES = [0, 5, 15, 30, 60] as const;
const rotuloDuracao = (minutos: number) => (minutos === 0 ? 'Sem tempo' : minutos === 60 ? '1 h' : `${minutos} min`);

/** The days a rhythm lights, for the little week drawn on its card. */
const diasDoRitmo = (valor: RecurrenceEditorValue): number[] =>
  (valor.type === 'DAILY' ? TODOS : valor.type === 'WEEKLY' ? valor.config.daysOfWeek ?? TODOS : []);

function OrbeDoCiclo({ elemento }: { elemento: ElementoId | null }) {
  const [falhou, setFalhou] = useState(false);
  return elemento && !falhou
    ? <img src={`/sanctuary/elements/${elemento}-v1.webp`} alt="" width={56} height={56} onError={() => setFalhou(true)} />
    : <ArcaneIcon name="ciclo" size={34} />;
}

/**
 * Creating a cycle in three short steps, a living card on top that answers every touch. What to practise, which element
 * and category rule it, and the rhythm; the last step shows the whole sentence and conjures it. It owns only the step
 * you are on: the name, element, category and rhythm are the caller's, so creating still goes through the same command.
 */
export function CycleCreationWizard({ name, onNameChange, areas, elemento, areaId, onElemento, onArea, onSugestao, ritmo, onRitmo, editor, esforco, onEsforco, minutos, onMinutos, startLabel, agendaResumo, onSubmit, onCancel, erro }: {
  name: string; onNameChange: (nome: string) => void;
  areas: readonly Area[]; elemento: ElementoId | null; areaId: string | null;
  onElemento: (elemento: ElementoId | null) => void; onArea: (area: Area | null) => void;
  onSugestao: (sugestao: { texto: string; areaId: string }) => void;
  ritmo: RecurrenceEditorValue; onRitmo: (valor: RecurrenceEditorValue) => void;
  /** The full schedule editor, kept for anything custom. */
  editor: ReactNode;
  /** How much the cycle is worth and how long it takes: they decide the XP, so they are chosen where it is born. */
  esforco: number; onEsforco: (pontos: number) => void;
  minutos: number; onMinutos: (minutos: number) => void;
  startLabel: string; agendaResumo: string;
  onSubmit: () => void; onCancel: () => void; erro?: ReactNode;
}) {
  const [passo, setPasso] = useState(0);
  const [direcao, setDirecao] = useState<'avanca' | 'volta'>('avanca');
  const [personalizar, setPersonalizar] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const nome = name.trim();
  const area = areas.find((a) => a.id === areaId);
  const ir = (proximo: number) => { setDirecao(proximo > passo ? 'avanca' : 'volta'); setPasso(proximo); };
  // Each step announces itself and takes the focus, so a screen reader and the keyboard follow the screen.
  useEffect(() => { if (passo > 0) tituloRef.current?.focus({ preventScroll: true }); }, [passo]);
  const estilo = { '--cc-acento': elemento ? ACENTO[elemento] : 'rgb(var(--el-gold))' } as CSSProperties;
  const nomeEsforco = ESFORCOS.find((e) => e.pontos === esforco)?.nome ?? '';
  const resumo = [nome, elemento ? ELEMENTS[elemento].name : '', area?.name ?? '', agendaResumo, esforco !== 1 ? nomeEsforco : '', minutos > 0 ? rotuloDuracao(minutos) : ''].filter(Boolean).join(' · ');
  const ultimo = passo === PASSOS.length - 1;

  return (
    <form className="ciclo-assistente" data-elemento={elemento ?? undefined} data-passo={passo} style={estilo}
      onSubmit={(evento) => { evento.preventDefault(); if (!nome) return; if (ultimo) onSubmit(); else ir(passo + 1); }}>
      <div className="ca-cartao" data-pronto={Boolean(nome)}>
        <span key={elemento ?? 'ciclo'} className="ca-orbe"><OrbeDoCiclo elemento={elemento} /></span>
        <div>
          <small>{elemento ? <>{ELEMENTS[elemento].name}{area ? ` · ${area.name}` : ''}</> : 'Um novo ciclo'}</small>
          <strong>{nome || 'Seu novo ciclo'}</strong>
          <p>A partir de {startLabel} · <b>{agendaResumo}</b></p>
        </div>
      </div>

      <ol className="ca-passos" aria-label="Passos da criação">
        {PASSOS.map((rotulo, i) => (
          <li key={rotulo} data-estado={i < passo ? 'feito' : i === passo ? 'atual' : 'depois'}>
            <button type="button" disabled={i > passo && !nome} aria-current={i === passo ? 'step' : undefined} onClick={() => { if (i <= passo || nome) ir(i); }}>
              <i aria-hidden="true">{i < passo ? '✓' : i + 1}</i><span>{rotulo}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="ca-palco" data-direcao={direcao}>
        <section key={passo} className="ca-folha" aria-labelledby="ca-titulo">
          {passo === 0 ? (
            <>
              <h3 id="ca-titulo" ref={tituloRef} tabIndex={-1}>O que você quer praticar?</h3>
              <label className="ca-campo"><span className="sr-only">Nome do ciclo</span>
                <input autoFocus required value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Ex.: Ler por 20 minutos" enterKeyHint="next" />
              </label>
              <div className="ca-sugestoes" role="group" aria-label="Sugestões de ciclo">
                {SUGESTOES.map((s, i) => <button key={s.texto} type="button" style={{ '--i': i } as CSSProperties} data-ativa={nome === s.texto || undefined} onClick={() => onSugestao(s)}>{s.texto}</button>)}
              </div>
              <p className="ca-dica">Toque numa sugestão e o elemento já vem escolhido.</p>
            </>
          ) : null}

          {passo === 1 ? (
            <>
              <h3 id="ca-titulo" ref={tituloRef} tabIndex={-1}>Qual elemento rege este ciclo?</h3>
              <CycleCategoryPicker grande areas={areas} elemento={elemento} areaId={areaId} onElemento={onElemento} onArea={onArea} />
            </>
          ) : null}

          {passo === 2 ? (
            <>
              <h3 id="ca-titulo" ref={tituloRef} tabIndex={-1}>Com que ritmo?</h3>
              <div className="ca-ritmos" role="group" aria-label="Ritmos rápidos">
                {ATALHOS.map((a, i) => {
                  const ativo = ritmoAtivo(ritmo, a.valor);
                  const acesos = diasDoRitmo(a.valor);
                  return (
                    <button key={a.rotulo} type="button" aria-pressed={ativo} style={{ '--i': i } as CSSProperties} onClick={() => { onRitmo(a.valor); setPersonalizar(false); }}>
                      <strong>{a.rotulo}</strong>
                      <span className="ca-semana" aria-hidden="true">{DIAS.map((d, dia) => <i key={dia} data-aceso={acesos.includes(dia)}>{d}</i>)}</span>
                    </button>
                  );
                })}
              </div>
              <button type="button" className="ca-personalizar" aria-expanded={personalizar} onClick={() => setPersonalizar((v) => !v)}>
                <ArcaneIcon name="chevron" size={16} />{personalizar ? 'Fechar a agenda completa' : 'Personalizar (mensal, anual, data final)'}
              </button>
              {personalizar ? <div className="ca-editor">{editor}</div> : null}
              <h4 className="ca-subtitulo">Quanto vale?</h4>
              <div className="ca-esforcos" role="group" aria-label="Esforço do ciclo">
                {ESFORCOS.map((e, i) => (
                  <button key={e.pontos} type="button" aria-pressed={esforco === e.pontos} style={{ '--i': i } as CSSProperties} onClick={() => onEsforco(e.pontos)}>
                    <span className="ca-chama" aria-hidden="true">{Array.from({ length: i + 1 }, (_, k) => <i key={k} />)}</span>
                    <strong>{e.nome}</strong><small>{e.dica}</small>
                  </button>
                ))}
              </div>
              <h4 className="ca-subtitulo">Quanto tempo leva?</h4>
              <div className="ca-duracoes" role="group" aria-label="Tempo previsto">
                {DURACOES.map((d) => <button key={d} type="button" aria-pressed={minutos === d} onClick={() => onMinutos(d)}>{rotuloDuracao(d)}</button>)}
              </div>
              <p className="ca-dica">Esforço e tempo decidem o XP de cada conclusão. Dá para mudar depois.</p>
              {erro}
            </>
          ) : null}
        </section>
      </div>

      <footer className="ca-pe">
        <p className="ca-resumo" aria-live="polite">{ultimo && resumo ? resumo : passo === 0 ? 'Dê um nome para continuar' : passo === 1 ? 'Escolher o elemento é opcional' : 'Quase lá'}</p>
        <div className="ca-botoes">
          <button type="button" className="ds-botao" data-tipo="secundario" onClick={passo === 0 ? onCancel : () => ir(passo - 1)}>{passo === 0 ? 'Cancelar' : 'Voltar'}</button>
          <button type="submit" className="ds-botao" data-tipo="primario" disabled={!nome}>{ultimo ? 'Conjurar ciclo' : passo === 1 && !elemento ? 'Pular' : 'Continuar'}</button>
        </div>
      </footer>
    </form>
  );
}

export default CycleCreationWizard;
