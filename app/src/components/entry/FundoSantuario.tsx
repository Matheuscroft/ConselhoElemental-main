import type { CSSProperties } from 'react';
import './fundo-santuario.css';

const BASE = '/sanctuary/despertar';

const ELEMENTOS = ['terra', 'fogo', 'agua', 'ar'] as const;

/**
 * Embers and motes in the four colours, fixed so every opening paints the same
 * sky. `x` is where each starts, `t` how many slow beats it takes to rise,
 * `dx` how far it drifts sideways on the way up.
 */
const BRASAS = Array.from({ length: 14 }, (_, i) => ({
  elemento: ELEMENTOS[i % 4],
  x: 6 + ((i * 53) % 88),
  t: 9 + ((i * 5) % 7),
  tamanho: 2 + (i % 3),
  dx: ((i * 37) % 41) - 20,
}));

export interface FundoSantuarioProps {
  /** How present the sanctuary still is. The journey moves away from it. */
  readonly opacidade: number;
  /**
   * Brings the plate to life for the entry: it breathes, the four elements
   * glow around it, embers rise and the light comes up on arrival. The depth
   * reads `--par-x` and `--par-y` from whichever ancestor writes them.
   */
  readonly viva?: boolean;
}

function Placa() {
  return (
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
  );
}

/**
 * The sanctuary kept behind the screens that follow the awakening, so the
 * opening reads as one place instead of three. The plate is already in cache
 * by the time anyone gets here, so it costs nothing but a paint, and each
 * screen sits a little further from it as the journey comes indoors.
 */
export function FundoSantuario({ opacidade, viva = false }: FundoSantuarioProps) {
  const estilo = { '--fundo-opacidade': opacidade } as CSSProperties;

  if (!viva) {
    return (
      <div className="fundo-santuario" aria-hidden="true" style={estilo}>
        <Placa />
      </div>
    );
  }

  return (
    <div className="fundo-santuario" data-viva="" aria-hidden="true" style={estilo}>
      <div className="fundo-camada fundo-camada-placa">
        <div className="fundo-placa">
          <Placa />
        </div>
      </div>

      <div className="fundo-camada fundo-camada-luzes">
        {ELEMENTOS.map((elemento) => (
          <span
            key={elemento}
            className={`fundo-luz fundo-luz-${elemento}`}
            style={{ '--fundo-cor': `var(--element-${elemento})` } as CSSProperties}
          />
        ))}
      </div>

      <div className="fundo-camada fundo-camada-brasas">
        {BRASAS.map((brasa, i) => (
          <i
            key={i}
            className="fundo-brasa"
            style={
              {
                '--fundo-cor': `var(--element-${brasa.elemento})`,
                '--b-x': `${brasa.x}%`,
                '--b-t': brasa.t,
                '--b-i': i,
                '--b-tam': `${brasa.tamanho}px`,
                '--b-dx': `${brasa.dx}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="fundo-lampejo" />
    </div>
  );
}

export default FundoSantuario;
