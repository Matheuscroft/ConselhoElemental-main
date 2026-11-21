import type { ReactNode } from 'react';

/** The small controls of the Laboratório: every one is a plain button or range, 44px at least, labelled. */

export function Escolha<T extends string | number | null>({ rotulo, valor, opcoes, aoMudar }: {
  rotulo: string;
  valor: T;
  opcoes: ReadonlyArray<{ valor: T; texto: string }>;
  aoMudar: (valor: T) => void;
}) {
  return (
    <div className="lab-campo" role="radiogroup" aria-label={rotulo}>
      <span className="lab-rotulo">{rotulo}</span>
      <div className="lab-segmentos">
        {opcoes.map((opcao) => (
          <button key={String(opcao.valor)} type="button" role="radio" aria-checked={opcao.valor === valor} onClick={() => aoMudar(opcao.valor)}>
            {opcao.texto}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Deslizante({ rotulo, valor, min, max, passo = 1, formatar, aoMudar }: {
  rotulo: string; valor: number; min: number; max: number; passo?: number;
  formatar?: (valor: number) => string; aoMudar: (valor: number) => void;
}) {
  return (
    <label className="lab-campo">
      <span className="lab-rotulo">{rotulo}<b>{formatar ? formatar(valor) : valor}</b></span>
      <input className="lab-faixa" type="range" min={min} max={max} step={passo} value={valor} onChange={(evento) => aoMudar(Number(evento.target.value))} />
    </label>
  );
}

export function Texto({ rotulo, valor, aoMudar }: { rotulo: string; valor: string; aoMudar: (valor: string) => void }) {
  return (
    <label className="lab-campo">
      <span className="lab-rotulo">{rotulo}</span>
      <input className="lab-texto" type="text" value={valor} maxLength={40} onChange={(evento) => aoMudar(evento.target.value)} />
    </label>
  );
}

/** `fixa`: the main button of a long block stays in view at the foot of the screen while you tune its sliders. */
export function Acao({ children, aoClicar, primaria = false, fixa = false }: { children: ReactNode; aoClicar: () => void; primaria?: boolean; fixa?: boolean }) {
  return <button type="button" className="lab-acao" data-primaria={primaria || undefined} data-fixa={fixa || undefined} onClick={aoClicar}>{children}</button>;
}

export function Bloco({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <section className="lab-bloco">
      <header><h2>{titulo}</h2>{nota ? <p>{nota}</p> : null}</header>
      {children}
    </section>
  );
}
