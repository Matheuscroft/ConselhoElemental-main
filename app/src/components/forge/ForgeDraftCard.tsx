import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Draft } from '@/types';

export function ForgeDraftCard({ draft, recem = false, onClassify, onEdit, onDelete }: {
  draft: Draft; recem?: boolean; onClassify: (id: string) => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const created = new Date(draft.createdAt);
  const dateLabel = Number.isNaN(created.getTime()) ? 'Data não informada' : created.toLocaleDateString('pt-BR');
  // data-luz: the scene writes where the finger is, and the card's rim and inner light follow it.
  return <article className="forge-draft ds-runa" data-luz="" data-recem={recem ? '' : undefined}>
    <details>
      <summary>
        <span className="forge-draft-rune" aria-hidden="true"><ArcaneIcon name="forja" size={28} /></span>
        <span><strong>{draft.title}</strong><small className="ds-meta"><span>{dateLabel}</span><span>{draft.notes ? 'Abrir anotações' : 'Sem anotações'}</span></small></span>
        <ArcaneIcon name="chevron" size={16} />
      </summary>
      <div className="forge-draft-notes">{draft.notes || 'Você pode acrescentar detalhes em Editar ideia.'}</div>
    </details>
    <div className="forge-draft-actions ds-runa-pe">
      <button className="ds-botao" data-tipo="fantasma" type="button" onClick={() => onClassify(draft.id)} aria-label={`Classificar ${draft.title}`}><ArcaneIcon name="forja" size={20} />Classificar ideia</button>
      <DropdownMenu><DropdownMenuTrigger asChild><button className="ds-botao" data-icone="" data-tipo="fantasma" type="button" id={`forge-options-${draft.id}`} aria-label={`Opções de ${draft.title}`}><ArcaneIcon name="mais" size={20} /></button></DropdownMenuTrigger>
        <DropdownMenuContent className="ds-menu forge-menu" align="end">
          <DropdownMenuItem onSelect={() => onEdit(draft.id)}><ArcaneIcon name="editar" size={16} />Editar ideia</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDelete(draft.id)} className="forge-delete-option"><ArcaneIcon name="excluir" size={16} />Excluir rascunho</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </article>;
}
