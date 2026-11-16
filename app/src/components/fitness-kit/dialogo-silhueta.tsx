import type { CSSProperties } from 'react';

/**
 * Where each measurement is read on the mannequin, in percent of the figure.
 * Decorative: the light shows which measurement the person is typing, and it
 * never simulates their body or their values.
 */
const PONTOS: Readonly<Record<string, { x: number; y: number }>> = {
  heightCm: { x: 50, y: 4 },
  waterPercent: { x: 50, y: 16 },
  chestCm: { x: 41, y: 25 },
  weightKg: { x: 50, y: 31 },
  muscleMassKg: { x: 27, y: 33 },
  armCm: { x: 73, y: 33 },
  bodyFatPercent: { x: 50, y: 39 },
  waistCm: { x: 62, y: 40 },
  thighCm: { x: 40, y: 57 },
};

/** A small mannequin whose point lights up for the measurement in focus; the filled ones stay softly lit. */
export function DialogoSilhueta({ foco, preenchidas }: { foco: string | null; preenchidas: readonly string[] }) {
  return <div className="dg-silhueta" aria-hidden="true" data-foco={foco ?? undefined}>
    <span className="dg-silhueta-luz" />
    <img src="/fitness/body/mannequin-front-v1.png" width={912} height={1724} alt="" draggable={false} />
    {Object.entries(PONTOS).map(([id, ponto]) => (
      <i key={id} className="dg-ponto" data-aceso={foco === id || undefined} data-cheio={preenchidas.includes(id) || undefined}
        style={{ insetInlineStart: `${ponto.x}%`, insetBlockStart: `${ponto.y}%` } as CSSProperties} />
    ))}
  </div>;
}
