import { ChevronDown, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Draft } from '@/types';

export function ForgeDraftCard({ draft, onClassify, onEdit, onDelete }: {
  draft: Draft; onClassify: (id: string) => void; onEdit: (id: string) => void; onDelete: (id: string) => void;
}) {
  const created = new Date(draft.createdAt);
  const dateLabel = Number.isNaN(created.getTime()) ? 'Data não informada' : created.toLocaleDateString('pt-BR');
  return <article className="forge-draft">
    <details>
      <summary>
        <span className="forge-draft-rune" aria-hidden="true"><ArcaneIcon name="grimorio" size={28} /></span>
        <span><strong>{draft.title}</strong><small>{dateLabel} · {draft.notes ? 'Abrir anotações' : 'Sem anotações'}</small></span>
        <ChevronDown size={18} aria-hidden="true" />
      </summary>
      <div className="forge-draft-notes">{draft.notes || 'Você pode acrescentar detalhes em Editar ideia.'}</div>
    </details>
    <div className="forge-draft-actions">
      <button type="button" onClick={() => onClassify(draft.id)} aria-label={`Classificar ${draft.title}`}><ArcaneIcon name="forja" size={20} />Classificar ideia</button>
      <DropdownMenu><DropdownMenuTrigger asChild><button type="button" aria-label={`Opções de ${draft.title}`}><MoreVertical size={20} aria-hidden="true" /></button></DropdownMenuTrigger>
        <DropdownMenuContent className="forge-menu" align="end">
          <DropdownMenuItem onSelect={() => onEdit(draft.id)}><Pencil size={16} aria-hidden="true" />Editar ideia</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDelete(draft.id)} className="forge-delete-option"><Trash2 size={16} aria-hidden="true" />Excluir rascunho</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </article>;
}
