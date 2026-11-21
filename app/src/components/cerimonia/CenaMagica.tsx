import { useMemo, type CSSProperties } from 'react';
import './cena-magica.css';

/** Little rune marks, drawn around the circle: lines, forks, triangles, diamonds. Centred on the origin, 7 units tall. */
const FORMAS = [
  'M0 -3.5V3.5',
  'M0 -3.5V3.5 M0 -3.5L2.4 -1.2',
  'M-2 3L0 -3.5 2 3Z',
  'M-2.2 -3L0 3.5 2.2 -3',
  'M0 -3.5L2.2 0 0 3.5-2.2 0Z',
  'M-2.5 0H2.5 M0 -3V3',
  'M-1.6 -3.5V3.5 M1.6 -3.5V3.5 M-1.6 0H1.6',
] as const;
const MARCAS = Array.from({ length: 30 }, (_, i) => ({ angulo: (360 / 30) * i, forma: FORMAS[(i * 5 + (i % 3)) % FORMAS.length] }));

/** Deterministic noise: the same scene always looks the same, so a ceremony is a thing you can learn. */
const ruido = (i: number, k: number) => ((Math.sin((i + 1) * k) * 43758.5453) % 1 + 1) % 1;
const BRASAS = Array.from({ length: 22 }, (_, i) => ({
  x: 4 + ruido(i, 12.9898) * 92, tamanho: 2 + ruido(i, 78.233) * 3.5, duracao: 5 + ruido(i, 37.719) * 5, atraso: ruido(i, 4.581) * 10, deriva: (ruido(i, 9.131) - 0.5) * 70,
}));
const ESTRELAS = Array.from({ length: 14 }, (_, i) => ({
  x: 6 + ruido(i, 21.17) * 88, y: 6 + ruido(i, 51.93) * 70, tamanho: 8 + ruido(i, 3.77) * 12, duracao: 3 + ruido(i, 17.3) * 3, atraso: ruido(i, 8.9) * 6,
}));

/**
 * The magic behind a ceremony. Decoration only: hidden from assistive tech and from pointers.
 * `cor` is the element's accent, `aura` its more saturated light; `cy` is where the light is centred, as a percentage of the screen height.
 */
export function CenaMagica({ cor, aura, cy = 38, runas = true }: { cor: string; aura: string; cy?: number; runas?: boolean }) {
  const brasas = useMemo(() => BRASAS, []);
  return (
    <div className="cena-magica" aria-hidden="true" style={{ '--cerimonia-cor': cor, '--cerimonia-aura': aura, '--cy': `${cy}%` } as CSSProperties}>
      <i className="cm-nevoa" />
      <i className="cm-raios cm-raios-a" />
      <i className="cm-raios cm-raios-b" />
      <i className="cm-vinheta" />
      {runas ? (
        <svg className="cm-runas" viewBox="0 0 100 100">
          <circle className="cm-aro" cx="50" cy="50" r="49.4" />
          <circle className="cm-aro cm-aro-tracejado" cx="50" cy="50" r="42" />
          <g className="cm-marcas">
            {MARCAS.map((m) => <path key={m.angulo} d={m.forma} transform={`translate(50 50) rotate(${m.angulo}) translate(0 -46)`} />)}
          </g>
        </svg>
      ) : null}
      <i className="cm-clarao" />
      <i className="cm-onda" />
      <ul className="cm-estrelas">
        {ESTRELAS.map((e, i) => <li key={i} style={{ '--x': `${e.x}%`, '--y': `${e.y}%`, '--s': `${e.tamanho}px`, '--d': e.duracao, '--a': e.atraso } as CSSProperties} />)}
      </ul>
      <ul className="cm-brasas">
        {brasas.map((b, i) => <li key={i} style={{ '--x': `${b.x}%`, '--s': `${b.tamanho}px`, '--d': b.duracao, '--a': b.atraso, '--dx': `${b.deriva}px` } as CSSProperties} />)}
      </ul>
    </div>
  );
}

export default CenaMagica;
