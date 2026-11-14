import type { ElementId } from '@/types';
import { CycleSigil } from '@/components/cycles/CycleSigil';

const NOMES: Record<ElementId, string> = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };

export interface MarcaElementoProps {
  elemento: ElementId;
  /** `ouro` troca o acento do elemento pelo ouro. */
  tom?: 'ouro';
}

/** Triângulo de 10 mais o nome do elemento, sem caixa. O significado vem do nome, nunca só da cor. */
export function MarcaElemento({ elemento, tom }: MarcaElementoProps) {
  return (
    <span className="ds-marca" data-element={elemento} data-tom={tom}>
      <CycleSigil element={elemento} size="trail" />
      {NOMES[elemento]}
    </span>
  );
}

export default MarcaElemento;
