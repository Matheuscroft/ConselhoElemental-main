import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ELEMENTS } from '@/constants';
import type { ElementId } from '@/types';

interface BuscaRituaisProps {
  busca: string;
  aoBuscar: (texto: string) => void;
  filtro: ElementId | null;
  aoFiltrar: (elemento: ElementId | null) => void;
}

/** Search and element filter as one pane of glass: the only one on this screen. */
export function BuscaRituais({ busca, aoBuscar, filtro, aoFiltrar }: BuscaRituaisProps) {
  return <div className="rit-busca" data-luz data-element={filtro ?? undefined} data-filtro={filtro ? '' : undefined}>
    <label className="ds-campo" data-tipo="busca">
      <span className="sr-only">Buscar ritual</span>
      <ArcaneIcon name="buscar" size={18} />
      <Input
        aria-label="Buscar ritual"
        placeholder="Buscar ritual..."
        value={busca}
        onChange={(evento) => aoBuscar(evento.target.value)}
      />
    </label>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="ds-botao rit-filtro" data-icone="" data-tipo="fantasma" aria-label="Filtrar rituais por elemento">
          <ArcaneIcon name="filtrar" size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="ds-menu">
        <DropdownMenuItem onClick={() => aoFiltrar(null)}>
          Todos os elementos
        </DropdownMenuItem>
        {Object.values(ELEMENTS).map((elemento) => (
          <DropdownMenuItem key={elemento.id} onClick={() => aoFiltrar(elemento.id)}>
            <ElementIcon element={elemento.id} />
            {elemento.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>;
}
