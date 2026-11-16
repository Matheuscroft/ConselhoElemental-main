import type { ReactNode } from 'react';

/**
 * A ring that fills (or empties) with a value between 0 and 1. Presentation
 * only: the number it shows is always computed by the caller from real data.
 */
export function TreinoAnel({ valor, tamanho = 64, espessura = 6, rotulo, children, className }: {
  valor: number;
  tamanho?: number;
  espessura?: number;
  /** When given, the ring is announced as a progress bar with this name. */
  rotulo?: string;
  children?: ReactNode;
  className?: string;
}) {
  const fracao = Math.min(1, Math.max(0, Number.isFinite(valor) ? valor : 0));
  const raio = (tamanho - espessura) / 2;
  const perimetro = 2 * Math.PI * raio;
  const aria = rotulo ? { role: 'progressbar', 'aria-label': rotulo, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(fracao * 100) } : { 'aria-hidden': true as const };
  return <div className={className ? `treino-anel ${className}` : 'treino-anel'} style={{ width: tamanho, height: tamanho }} {...aria}>
    <svg viewBox={`0 0 ${tamanho} ${tamanho}`} aria-hidden="true" focusable="false">
      <circle className="treino-anel-trilho" cx={tamanho / 2} cy={tamanho / 2} r={raio} strokeWidth={espessura} />
      <circle className="treino-anel-arco" cx={tamanho / 2} cy={tamanho / 2} r={raio} strokeWidth={espessura}
        strokeDasharray={perimetro} strokeDashoffset={perimetro * (1 - fracao)} />
    </svg>
    {children !== undefined && <span className="treino-anel-centro">{children}</span>}
  </div>;
}
