import { useId, type ReactNode } from 'react';
import { CycleSigil, type ElementoDoCiclo } from '@/components/cycles/CycleSigil';

const LOSANGO: ElementoDoCiclo[] = ['fogo', 'agua', 'ar', 'terra'];

export interface VazioProps {
  titulo: string;
  texto?: ReactNode;
  /** Botão secundário do chamador. */
  acao?: ReactNode;
  compacto?: boolean;
}

/** Estado vazio que convida a agir: quatro sigilos em losango, título, texto e uma ação. Sem scroll próprio. */
export function Vazio({ titulo, texto, acao, compacto = false }: VazioProps) {
  const id = useId();
  return (
    <div className="ds-vazio" role="group" aria-labelledby={id} data-compacto={compacto ? '' : undefined}>
      <span className="ds-vazio-losango" aria-hidden="true">
        {LOSANGO.map((element) => <CycleSigil key={element} element={element} size="card" />)}
      </span>
      <h3 id={id}>{titulo}</h3>
      {texto ? <p>{texto}</p> : null}
      {acao ?? null}
    </div>
  );
}

export default Vazio;
