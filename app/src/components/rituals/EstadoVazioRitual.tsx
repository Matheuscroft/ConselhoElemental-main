import { useId, type CSSProperties } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';

/** One orb of each element, resting in an arc: the four forces waiting for a first ritual. */
const ORBES: readonly ElementId[] = ['fogo', 'terra', 'agua', 'ar'];

interface EstadoVazioRitualProps {
  tipo: 'pending' | 'completed';
  /** A search or an element filter is what emptied the list. */
  filtrado?: boolean;
  aoLimpar?: () => void;
  aoCriar?: () => void;
}

/** Nothing to show yet, said as an invitation and not as an error. */
export function EstadoVazioRitual({ tipo, filtrado = false, aoLimpar, aoCriar }: EstadoVazioRitualProps) {
  const id = useId();
  const titulo = filtrado
    ? 'Nenhum ritual encontrado'
    : tipo === 'pending' ? 'Nenhum ritual pendente' : 'Nenhum ritual concluído';
  const texto = filtrado
    ? 'Tente outro nome ou remova o filtro de elemento.'
    : tipo === 'pending'
      ? 'Tudo em paz por aqui. Crie um ritual para dar o próximo passo.'
      : 'Cada ritual que você concluir fica selado aqui, com a luz do seu elemento.';
  return <div className="rit-vazio" role="group" aria-labelledby={id} data-tipo={tipo}>
    <div className="rit-vazio-orbes" aria-hidden="true">
      {ORBES.map((elemento, ordem) => <span key={elemento} className="rit-vazio-orbe" data-element={elemento} style={{ '--ordem': ordem } as CSSProperties}>
        <img src={`/sanctuary/elements/${elemento}-v1.webp`} width={128} height={128} alt="" loading="lazy" />
      </span>)}
    </div>
    <h3 id={id}>{titulo}</h3>
    <p>{texto}</p>
    {filtrado
      ? <button type="button" className="ds-botao" data-tipo="secundario" onClick={aoLimpar}>Limpar busca e filtros</button>
      : tipo === 'pending' && aoCriar
        ? <button type="button" className="ds-botao rit-vazio-acao" data-tipo="primario" onClick={aoCriar}><ArcaneIcon name="criar" size={18} />Criar um ritual</button>
        : null}
  </div>;
}
