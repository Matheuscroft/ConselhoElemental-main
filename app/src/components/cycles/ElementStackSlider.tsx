import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS } from '@/constants';
import type { ElementId } from '@/types';
import './element-stack-slider.css';

const ORDEM: readonly ElementId[] = ['terra', 'fogo', 'agua', 'ar'];

/** The flat, saturated colour each slide washes the card with, and the ink that reads on it. */
const FUNDO: Record<ElementId, { cor: string; tinta: string }> = {
  terra: { cor: '#86c46f', tinta: '#0f1f10' },
  fogo: { cor: '#ff8a4a', tinta: '#2a0f05' },
  agua: { cor: '#4aa9ec', tinta: '#06182a' },
  ar: { cor: '#d3e6ef', tinta: '#0e1a22' },
};

/** The giant word, letter by letter: the old one leaves upward (or downward) and the new one rolls in behind it. */
function Palavra({ texto, saindo, direcao }: { texto: string; saindo: string | null; direcao: 1 | -1 }) {
  const letras = (t: string, fase: 'entra' | 'sai') => [...t].map((letra, i) => (
    <i key={`${fase}-${i}`} data-fase={fase} style={{ '--i': i, '--dir': direcao } as CSSProperties}>{letra}</i>
  ));
  return (
    <span className="es-palavra" aria-hidden="true">
      {saindo ? <span className="es-palavra-sai">{letras(saindo, 'sai')}</span> : null}
      <span className="es-palavra-entra" key={texto}>{letras(texto, 'entra')}</span>
    </span>
  );
}

/**
 * Choosing an element, as a vertical stack slider: one giant word per element, the element's own image rolling in a
 * stack with blurred neighbours, the card washing into the colour of the slide and the word swapping letter by letter.
 * Slide with the arrows, a vertical swipe, the keyboard (↑ ↓) or the dots; "Escolher" commits, so browsing is free.
 * Controlled: it creates nothing, the caller owns the chosen element.
 */
export function ElementStackSlider({ elemento, onElemento }: { elemento: ElementId | null; onElemento: (elemento: ElementId | null) => void }) {
  const [indice, setIndice] = useState(() => Math.max(0, ORDEM.indexOf(elemento ?? 'terra')));
  const [saindo, setSaindo] = useState<string | null>(null);
  const [direcao, setDirecao] = useState<1 | -1>(1);
  const [visto, setVisto] = useState(elemento);
  const toque = useRef<{ y: number; usado: boolean } | null>(null);
  const atual = ORDEM[indice];
  const escolhido = elemento === atual;

  /** Moves to another slide: the old word starts to leave, the new one rolls in. */
  const mover = useCallback((novo: number) => {
    if (novo === indice) return;
    setDirecao(novo > indice ? 1 : -1);
    setSaindo(ELEMENTS[ORDEM[indice]].name);
    setIndice(novo);
  }, [indice]);
  // Someone else changed the element (a suggestion filled it): follow it (adjusted while rendering, React's own pattern).
  if (elemento !== visto) { setVisto(elemento); if (elemento) mover(ORDEM.indexOf(elemento)); }
  // the old word is gone after its exit
  useEffect(() => {
    if (!saindo) return undefined;
    const fim = window.setTimeout(() => setSaindo(null), 900);
    return () => window.clearTimeout(fim);
  }, [saindo]);

  const ir = useCallback((passo: 1 | -1) => mover((indice + passo + ORDEM.length) % ORDEM.length), [indice, mover]);
  const aoTeclar = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowRight') { evento.preventDefault(); ir(1); }
    if (evento.key === 'ArrowUp' || evento.key === 'ArrowLeft') { evento.preventDefault(); ir(-1); }
  };
  const aoTocar = (evento: PointerEvent<HTMLDivElement>) => { toque.current = { y: evento.clientY, usado: false }; };
  const aoMover = (evento: PointerEvent<HTMLDivElement>) => {
    const t = toque.current; if (!t || t.usado) return;
    const dy = evento.clientY - t.y;
    if (Math.abs(dy) > 36) { t.usado = true; ir(dy < 0 ? 1 : -1); }
  };
  const aoSoltar = () => { toque.current = null; };

  const cor = FUNDO[atual];
  const estilo = { '--es-cor': cor.cor, '--es-tinta': cor.tinta, '--es-n': indice } as CSSProperties;

  return (
    <div className="es-slider" style={estilo} role="group" aria-roledescription="carrossel" aria-label="Elemento do ciclo" tabIndex={0} onKeyDown={aoTeclar}
      onPointerDown={aoTocar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar} onPointerLeave={aoSoltar}>
      <div className="es-moldura">
        <div className="es-pilha" aria-hidden="true">
          {ORDEM.map((id, i) => (
            <div key={id} className="es-quadro" data-posicao={i === indice ? 'atual' : i < indice ? 'antes' : 'depois'} style={{ '--d': i - indice } as CSSProperties}>
              <img src={`/sanctuary/elements/${id}-v1.webp`} alt="" width={160} height={160} loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
        <Palavra texto={ELEMENTS[atual].name} saindo={saindo} direcao={direcao} />
        <p className="es-dominio">{ELEMENTS[atual].domain}</p>
        <div className="es-controles">
          <button type="button" aria-label="Elemento anterior" onClick={() => ir(-1)}><ArcaneIcon name="chevron" size={18} style={{ rotate: '180deg' }} /></button>
          <button type="button" aria-label="Próximo elemento" onClick={() => ir(1)}><ArcaneIcon name="chevron" size={18} /></button>
          <span className="es-contador" aria-hidden="true"><b>{indice + 1}</b> / {ORDEM.length}</span>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{ELEMENTS[atual].name}, {indice + 1} de {ORDEM.length}. {ELEMENTS[atual].description}</p>
      <div className="es-rodape">
        <button type="button" className="es-escolher" aria-pressed={escolhido} onClick={() => onElemento(escolhido ? null : atual)}>
          {escolhido ? <>✓ {ELEMENTS[atual].name} escolhido</> : <>Escolher {ELEMENTS[atual].name}</>}
        </button>
        {elemento ? <button type="button" className="es-limpar" onClick={() => onElemento(null)}>Sem elemento</button> : null}
      </div>
    </div>
  );
}

export default ElementStackSlider;
