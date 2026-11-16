import { useId } from 'react';
import { X } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

/**
 * The search of the areas of an element: the same controlled input as before
 * (the page keeps the query in the address), with a clear button that appears
 * only when there is something to clear.
 */
export function ElementoBusca({ nomeDoElemento, valor, aoMudar }: {
  nomeDoElemento: string;
  valor: string;
  aoMudar: (valor: string) => void;
}) {
  const id = useId();
  return <div className="elemento-busca" data-preenchida={valor ? '' : undefined}>
    <label className="sr-only" htmlFor={id}>Buscar áreas de {nomeDoElemento}</label>
    <ArcaneIcon name="buscar" size={18} />
    <input id={id} type="search" name="elemental-area-search" autoComplete="off" spellCheck={false} placeholder="Buscar uma área…" value={valor} onChange={(evento) => aoMudar(evento.target.value)} />
    {valor ? <button type="button" className="elemento-busca-limpar" aria-label="Limpar busca" onClick={() => aoMudar('')}><X size={16} aria-hidden="true" /></button> : null}
  </div>;
}

export default ElementoBusca;
