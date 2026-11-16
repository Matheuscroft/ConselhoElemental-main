import { useId, type CSSProperties } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

const BRASAS = [0, 1, 2, 3, 4, 5] as const;

interface EstadoVazioForjaProps {
  /** A search is what emptied the list. */
  filtrado?: boolean;
  onAcao: () => void;
}

/** Nothing on the anvil yet, said as an invitation: a sigil with embers rising from it. */
export function EstadoVazioForja({ filtrado = false, onAcao }: EstadoVazioForjaProps) {
  const id = useId();
  return <div className="forge-vazio ds-pane" role="group" aria-labelledby={id}>
    <div className="forge-vazio-brasa" aria-hidden="true">
      <span className="forge-vazio-halo" />
      {BRASAS.map(i => <i key={i} style={{ '--brasa': i } as CSSProperties} />)}
      <ArcaneIcon name={filtrado ? 'buscar' : 'forja'} size={40} />
    </div>
    <h3 id={id}>{filtrado ? 'Nenhuma ideia encontrada' : 'Um espaço para o que ainda vai nascer'}</h3>
    <p>{filtrado
      ? 'Tente outra palavra ou limpe a busca para ver todos os rascunhos.'
      : 'Guarde pensamentos, planos e possibilidades. Você não precisa organizar tudo agora.'}</p>
    <button type="button" className="ds-botao" data-tipo="secundario" onClick={onAcao}>{filtrado ? 'Limpar busca' : 'Escrever minha primeira ideia'}</button>
  </div>;
}
