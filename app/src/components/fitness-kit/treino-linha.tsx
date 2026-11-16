import type { CSSProperties, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import './treino-uau.css';

/**
 * One exercise of the program as a rune: its number, its name and its prescription.
 * A button when there is something to open, a plain row when there is not.
 */
export function TreinoLinha({ numero, titulo, subtitulo, onClick, ariaLabel, indice = 0, children }: {
  numero: number;
  titulo: string;
  subtitulo: string;
  onClick?: () => void;
  ariaLabel?: string;
  indice?: number;
  children?: ReactNode;
}) {
  const miolo = <>
    <span className="treino-runa-num" aria-hidden="true">{numero}</span>
    <span className="treino-runa-texto">
      <span className="treino-runa-titulo">{titulo}</span>
      <span className="treino-runa-sub">{subtitulo}</span>
    </span>
    {onClick && <ChevronRight className="treino-runa-seta" size={22} aria-hidden="true" />}
  </>;
  const estilo = { '--i': indice + 3 } as CSSProperties;
  return onClick
    ? <button type="button" className="treino-runa ds-pane treino-entra" style={estilo} onClick={onClick} aria-label={ariaLabel}>{miolo}{children}</button>
    : <div className="treino-runa ds-pane treino-entra" style={estilo}>{miolo}{children}</div>;
}
