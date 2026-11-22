import type { CSSProperties } from 'react';
import './fundo-santuario.css';

/**
 * The questions right after the grimoire keep its world behind them: the last frame of the ceremony (the open
 * book on the plinth at dusk, the light rising from the gutter), under the same ramp as the sanctuary plate, so
 * the first question picks up exactly where the opening ended. A still image: no 3D, no motion to reduce.
 */
export function FundoGrimorio({ opacidade }: { readonly opacidade: number }) {
  const estilo = { '--fundo-opacidade': opacidade } as CSSProperties;
  return (
    <div className="fundo-santuario fundo-grimorio" aria-hidden="true" style={estilo}>
      <img src="/intro/final-390.webp" alt="" decoding="async" />
    </div>
  );
}

export default FundoGrimorio;
