import type { CSSProperties } from 'react';
import './fundo-santuario.css';

const BASE = '/sanctuary/despertar';

export interface FundoSantuarioProps {
  /** How present the sanctuary still is. The journey moves away from it. */
  readonly opacidade: number;
}

/**
 * The sanctuary kept behind the screens that follow the awakening, so the
 * opening reads as one place instead of three. The plate is already in cache
 * by the time anyone gets here, so it costs nothing but a paint, and each
 * screen sits a little further from it as the journey comes indoors.
 */
export function FundoSantuario({ opacidade }: FundoSantuarioProps) {
  return (
    <div
      className="fundo-santuario"
      aria-hidden="true"
      style={{ '--fundo-opacidade': opacidade } as CSSProperties}
    >
      <picture>
        <source
          type="image/avif"
          srcSet={`${BASE}/placa-base-390w.avif 390w, ${BASE}/placa-base-780w.avif 780w`}
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet={`${BASE}/placa-base-390w.webp 390w, ${BASE}/placa-base-780w.webp 780w`}
          sizes="100vw"
        />
        <img src={`${BASE}/reserva-390w.webp`} alt="" decoding="async" />
      </picture>
    </div>
  );
}

export default FundoSantuario;
