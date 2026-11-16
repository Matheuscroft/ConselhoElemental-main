import { useState } from 'react';

export type Direcao = 'adiante' | 'atras';

/**
 * Which way a period moved, from keys that sort in time ("2026-09", "2027").
 * Undefined until the first change, so the first sight of a screen is never
 * mistaken for a turn of the page.
 */
export function useDirecao(chave: string): Direcao | undefined {
  const [estado, setEstado] = useState<{ chave: string; direcao?: Direcao }>({ chave });
  if (estado.chave !== chave) {
    // Adjusted during render, which is React's answer to state that follows a prop.
    setEstado({ chave, direcao: chave > estado.chave ? 'adiante' : 'atras' });
  }
  return estado.direcao;
}
