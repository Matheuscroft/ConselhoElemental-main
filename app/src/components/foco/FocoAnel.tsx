import { MARCOS } from './foco-tempo';

const RAIO = 92;
const CENTRO = 100;
const TIQUES = Array.from({ length: 60 }, (_, i) => i);

/** A point on the ring at a fraction of the way round, clockwise from twelve o'clock. */
function pontoNoAnel(fracao: number): { x: number; y: number } {
  const angulo = (fracao * 360 - 90) * (Math.PI / 180);
  return { x: CENTRO + RAIO * Math.cos(angulo), y: CENTRO + RAIO * Math.sin(angulo) };
}

/**
 * The ring around the time. With a plan it fills toward it, and four beads at a
 * quarter, half, three quarters and the whole light up as each is reached. With
 * no plan there is nothing to fill, so it becomes a watch face: sixty ticks that
 * light as the seconds of the current minute pass, under a halo that breathes.
 *
 * The fill is one dash offset on a path normalised to a length of 1, so it
 * never needs to measure. The whole thing is decorative: the number it draws is
 * already in the timer's own label.
 */
export function FocoAnel({ fracao, comPlano, segundoDoMinuto, marco, onda }: {
  fracao: number;
  comPlano: boolean;
  segundoDoMinuto: number;
  /** How many of the four marks have been reached. */
  marco: number;
  /** Changes whenever a mark is reached, which replays the one ripple. */
  onda: number;
}) {
  const deslocamento = 1 - fracao;
  return <svg className="foco-anel" viewBox="0 0 200 200" aria-hidden="true" focusable="false" data-plano={comPlano}>
    <circle className="foco-halo" cx={CENTRO} cy={CENTRO} r={RAIO + 4} />
    <circle className="foco-trilho" cx={CENTRO} cy={CENTRO} r={RAIO} />
    {comPlano ? <>
      <circle className="foco-arco-brilho" cx={CENTRO} cy={CENTRO} r={RAIO} pathLength={1} strokeDasharray="1 1" strokeDashoffset={deslocamento} transform="rotate(-90 100 100)" />
      <circle className="foco-arco" cx={CENTRO} cy={CENTRO} r={RAIO} pathLength={1} strokeDasharray="1 1" strokeDashoffset={deslocamento} transform="rotate(-90 100 100)" />
      {MARCOS.map((marcoDoPlano, i) => {
        const { x, y } = pontoNoAnel(marcoDoPlano === 1 ? 0 : marcoDoPlano);
        return <circle key={marcoDoPlano} className="foco-marco" data-aceso={marco > i} cx={x} cy={y} r={3.4} />;
      })}
      <g className="foco-ponta" style={{ transform: `rotate(${(fracao * 360).toFixed(2)}deg)` }}>
        <circle cx={CENTRO} cy={CENTRO - RAIO} r={3.2} />
      </g>
    </> : <g className="foco-tiques">
      {TIQUES.map((i) => {
        const angulo = (i * 6 - 90) * (Math.PI / 180);
        const comprimento = i % 5 === 0 ? 9 : 5;
        return <line key={i} data-aceso={i <= segundoDoMinuto}
          x1={CENTRO + (RAIO - comprimento) * Math.cos(angulo)} y1={CENTRO + (RAIO - comprimento) * Math.sin(angulo)}
          x2={CENTRO + RAIO * Math.cos(angulo)} y2={CENTRO + RAIO * Math.sin(angulo)} />;
      })}
    </g>}
    {onda > 0 && <circle key={onda} className="foco-onda" cx={CENTRO} cy={CENTRO} r={RAIO} />}
  </svg>;
}
