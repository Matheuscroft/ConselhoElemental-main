import { useId, useState, type CSSProperties, type PointerEvent } from 'react';
import { Contagem } from '@/components/motion/Contagem';

export interface DiaDoGrafico { stamp: number; date: string; points: number }

const LARGURA = 300;
const ALTURA = 88;
const TOPO = 12;
const BASE = 8;
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** A smooth line through the points: each step eases flat at both ends, so it never overshoots a value. */
function linha(pontos: readonly { x: number; y: number }[]) {
  return pontos.map((ponto, indice) => {
    if (indice === 0) return `M ${ponto.x.toFixed(2)} ${ponto.y.toFixed(2)}`;
    const anterior = pontos[indice - 1];
    const meio = ((anterior.x + ponto.x) / 2).toFixed(2);
    return `C ${meio} ${anterior.y.toFixed(2)}, ${meio} ${ponto.y.toFixed(2)}, ${ponto.x.toFixed(2)} ${ponto.y.toFixed(2)}`;
  }).join(' ');
}

/**
 * The recent days as a line that draws itself the first time it is seen. Only
 * recorded points are drawn, never an estimate. A finger or a pointer across
 * the chart reads one day at a time; the written summary says the same for
 * everyone else.
 */
export function GraficoRecente({ dias, chegou = true }: { dias: readonly DiaDoGrafico[]; chegou?: boolean }) {
  const idArea = useId();
  const [foco, setFoco] = useState<number | null>(null);
  if (dias.length < 2) return null;

  const total = dias.reduce((soma, dia) => soma + dia.points, 0);
  const minimo = Math.min(0, ...dias.map(dia => dia.points));
  const maximo = Math.max(1, ...dias.map(dia => dia.points));
  const faixa = maximo - minimo || 1;
  const pontos = dias.map((dia, indice) => ({
    x: (indice / (dias.length - 1)) * LARGURA,
    y: ALTURA - BASE - ((dia.points - minimo) / faixa) * (ALTURA - TOPO - BASE),
  }));
  const tracado = linha(pontos);
  const area = `${tracado} L ${LARGURA} ${ALTURA} L 0 ${ALTURA} Z`;
  const melhor = dias.reduce((acc, dia) => (dia.points > acc.points ? dia : acc), dias[0]);
  const ultimo = pontos[pontos.length - 1];
  const atual = foco === null ? null : dias[foco];
  const resumo = `Pontos registrados nos últimos ${dias.length} dias: ${format(total)} no total. Melhor dia: ${melhor.date}, com ${format(melhor.points)} pontos.`;

  const ler = (evento: PointerEvent<HTMLDivElement>) => {
    const caixa = evento.currentTarget.getBoundingClientRect();
    if (caixa.width <= 0) return;
    const razao = Math.min(1, Math.max(0, (evento.clientX - caixa.left) / caixa.width));
    setFoco(Math.round(razao * (dias.length - 1)));
  };
  const estilo = foco === null ? undefined : ({ '--foco-x': `${(foco / (dias.length - 1)) * 100}%`, '--foco-y': `${(pontos[foco].y / ALTURA) * 100}%` } as CSSProperties);

  return <div className="gr-grafico" data-luz="" data-chegou={chegou} style={estilo}>
    <span className="gr-brilho" aria-hidden="true" />
    <div className="gr-grafico-cabeca">
      <div>
        <small>{atual ? atual.date : `Últimos ${dias.length} dias`}</small>
        <strong>{atual ? format(atual.points) : <Contagem valor={chegou ? total : 0} formatar={format} />}<span> pts</span></strong>
      </div>
      <p>Melhor dia: {melhor.date}</p>
    </div>
    <div className="gr-grafico-area" onPointerMove={ler} onPointerDown={ler} onPointerLeave={() => setFoco(null)} onPointerCancel={() => setFoco(null)} onPointerUp={evento => { if (evento.pointerType !== 'mouse') setFoco(null); }}>
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={resumo} focusable="false">
        <defs>
          <linearGradient id={idArea} x1="0" y1="0" x2="0" y2="1">
            <stop className="gr-grafico-topo" offset="0" />
            <stop className="gr-grafico-fundo" offset="1" />
          </linearGradient>
        </defs>
        <line className="gr-grafico-base" x1="0" x2={LARGURA} y1={ALTURA - BASE} y2={ALTURA - BASE} />
        <path className="gr-grafico-area-cor" d={area} fill={`url(#${idArea})`} />
        <path className="gr-grafico-halo" d={tracado} pathLength={1} />
        <path className="gr-grafico-linha" d={tracado} pathLength={1} />
        <circle className="gr-grafico-ponta" cx={ultimo.x} cy={ultimo.y} r="3.2" />
      </svg>
      {foco !== null && <i className="gr-grafico-marca" aria-hidden="true" />}
    </div>
    <div className="gr-grafico-pe" aria-hidden="true"><span>{dias[0].date}</span><span>{dias[dias.length - 1].date}</span></div>
  </div>;
}
