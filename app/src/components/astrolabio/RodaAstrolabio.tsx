import type { CSSProperties } from 'react';
import { ELEMENTS, ZODIAC_SIGNS, type ElementId } from '@/constants';
import { AURA } from '@/lib/design/palette';
import { zodiacProfile, type ZodiacProfile } from '@/lib/sanctuary/zodiac';
import { fatiaDoAnel, pontoNaRoda } from './entrada-astrolabio';

/** Text presentation, so the glyph takes the colour of the sign instead of becoming an emoji. */
const TEXTO = '︎';

/** The four planets of the wheel are the four elements, each on its own orbit. */
const ORBITAS: readonly { elementId: ElementId; raio: number; fase: number; ciclo: number }[] = [
  { elementId: 'terra', raio: 54, fase: 200, ciclo: 36 },
  { elementId: 'fogo', raio: 44, fase: 40, ciclo: 28 },
  { elementId: 'agua', raio: 34, fase: 300, ciclo: 44 },
  { elementId: 'ar', raio: 24, fase: 130, ciclo: 22 },
];

const RAIO_ANEL_INTERNO = 62;
const RAIO_ANEL_EXTERNO = 90;
const RAIO_DOS_SIGNOS = 76;
const MARCAS = Array.from({ length: 72 }, (_, indice) => indice);
const SIGNOS = Array.from({ length: ZODIAC_SIGNS.length }, (_, indice) => zodiacProfile(indice));

interface Pontuacao { elementId: ElementId; percentage: number; score: number }

/**
 * A living astrolabe: the zodiac ring whose signs burn as much as the element
 * they belong to weighs in the person's balance, a ring of degrees that turns
 * slowly, four planets (the elements) on their orbits, and the Sun at the
 * centre standing in the sign where it really is today. Everything moves by
 * transform and opacity only. It is a picture of the balance, not a forecast:
 * the numbers it shows are the same ones the tabs below list in text.
 */
export function RodaAstrolabio({ pontuacoes, sol }: { pontuacoes: readonly Pontuacao[]; sol: ZodiacProfile }) {
  const porElemento = new Map(pontuacoes.map((item) => [item.elementId, item]));
  const maior = Math.max(0, ...pontuacoes.map((item) => item.percentage));
  const resumo = pontuacoes.map((item) => `${ELEMENTS[item.elementId].name} ${item.percentage}%`).join(', ');
  const largura = 360 / ZODIAC_SIGNS.length;

  return <div className="ast-roda" role="img" aria-label={`Astrolábio. O Sol está em ${sol.name}. Equilíbrio dos elementos: ${resumo}.`}>
    <span className="ast-roda-halo" aria-hidden="true" />

    <div className="ast-camada" data-camada="graus" aria-hidden="true">
      <svg className="ast-gira ast-graus" viewBox="0 0 200 200" focusable="false">
        <circle cx="100" cy="100" r="98.5" className="ast-fio" />
        {MARCAS.map((indice) => {
          const longa = indice % 6 === 0;
          const de = pontoNaRoda(longa ? 92 : 94.5, indice * 5);
          const ate = pontoNaRoda(98, indice * 5);
          return <path key={indice} d={`M${de.x.toFixed(2)} ${de.y.toFixed(2)}L${ate.x.toFixed(2)} ${ate.y.toFixed(2)}`} className={longa ? 'ast-marca ast-marca-longa' : 'ast-marca'} />;
        })}
      </svg>
    </div>

    <div className="ast-camada" data-camada="anel" aria-hidden="true">
      <svg viewBox="0 0 200 200" focusable="false">
        <circle cx="100" cy="100" r={RAIO_ANEL_EXTERNO} className="ast-fio" />
        <circle cx="100" cy="100" r={RAIO_ANEL_INTERNO} className="ast-fio" />
        {SIGNOS.map((signo) => {
          const de = signo.index * largura;
          const raia = pontoNaRoda(RAIO_ANEL_INTERNO, de);
          const fora = pontoNaRoda(RAIO_ANEL_EXTERNO, de);
          return <path key={signo.index} d={`M${raia.x.toFixed(2)} ${raia.y.toFixed(2)}L${fora.x.toFixed(2)} ${fora.y.toFixed(2)}`} className="ast-fio" />;
        })}
        <path className="ast-sol-fatia" d={fatiaDoAnel(RAIO_ANEL_INTERNO, RAIO_ANEL_EXTERNO, sol.index * largura, (sol.index + 1) * largura)} style={{ fill: sol.colour }} />
      </svg>
    </div>

    <div className="ast-camada ast-signos" aria-hidden="true">
      {SIGNOS.map((signo) => {
        const ponto = pontoNaRoda(RAIO_DOS_SIGNOS, signo.index * largura + largura / 2);
        const peso = porElemento.get(signo.element)?.percentage ?? 0;
        const brilho = maior > 0 ? 0.3 + 0.7 * (peso / maior) : 0.3;
        return <span
          key={signo.index}
          className="ast-signo"
          data-sol={signo.index === sol.index ? '' : undefined}
          style={{ left: `${ponto.x / 2}%`, top: `${ponto.y / 2}%`, '--cor': signo.colour, '--brilho': brilho.toFixed(2), '--i': signo.index } as CSSProperties}
        >{signo.icon}{TEXTO}</span>;
      })}
    </div>

    {ORBITAS.map((orbita, ordem) => {
      const item = porElemento.get(orbita.elementId);
      const planeta = pontoNaRoda(orbita.raio, orbita.fase);
      const tamanho = 2.8 + 4 * ((item?.percentage ?? 0) / 100);
      return <div key={orbita.elementId} className="ast-camada" data-camada="orbita" aria-hidden="true" style={{ '--cor': AURA[orbita.elementId], '--i': ordem } as CSSProperties}>
        <svg className="ast-gira ast-orbita" viewBox="0 0 200 200" focusable="false" style={{ '--ciclo': orbita.ciclo } as CSSProperties}>
          <circle cx="100" cy="100" r={orbita.raio} className="ast-orbita-trilho" />
          <circle cx={planeta.x.toFixed(2)} cy={planeta.y.toFixed(2)} r={tamanho.toFixed(2)} fill={AURA[orbita.elementId]} className="ast-planeta" />
        </svg>
      </div>;
    })}

    <div className="ast-centro" aria-hidden="true" style={{ '--cor': sol.colour } as CSSProperties}>
      <span className="ast-centro-raios" />
      <span className="ast-centro-glifo">{sol.icon}{TEXTO}</span>
    </div>
  </div>;
}
