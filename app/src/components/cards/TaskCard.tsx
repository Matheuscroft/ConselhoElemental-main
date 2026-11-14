import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import React from 'react';
import type { Task } from '@/types';
import { ELEMENTS, getAreaById } from '@/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onStart?: () => void;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStart,
  onComplete,
  onEdit,
  onDelete,
  onClick,
  compact = false,
}) => {
  const element = ELEMENTS[task.elementId];
  const area = task.areaPrimaryId ? getAreaById(task.areaPrimaryId) : null;
  const effortLevel = task.effortLevel || 1;

  const baseValue = task.baseValue || 1;
  const effortMultiplier = [1, 1.2, 1.5, 2, 2.8][effortLevel - 1];
  const totalPoints = Math.round(baseValue * effortMultiplier);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="ds-runa"
        data-element={task.elementId}
        data-completed={task.isCompleted ? 'true' : undefined}
        data-em-andamento={task.isInProgress ? '' : undefined}
      >
        <div className="ds-runa-cabeca">
          <button
            type="button"
            className="ds-selo"
            aria-pressed={!!task.isCompleted}
            aria-label={`Concluir ${task.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onComplete?.();
            }}
          >
            <ArcaneIcon name="concluir" size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="ds-runa-titulo truncate">{task.title}</p>
            <div className="ds-meta">
              {area && <span>{area.name}</span>}
              <span>+{totalPoints}</span>
            </div>
          </div>
          <span><ElementIcon element={element.id} label={element.name} /></span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="ds-runa"
      data-element={task.elementId}
      data-completed={task.isCompleted ? 'true' : undefined}
      data-em-andamento={task.isInProgress ? '' : undefined}
    >
      <div className="ds-runa-cabeca">
        <p className="ds-runa-titulo">{task.title}</p>
        <span><ElementIcon element={element.id} label={element.name} /></span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="ds-botao" data-tipo="fantasma" data-icone aria-label="Mais ações" onClick={(e) => e.stopPropagation()}>
              <ArcaneIcon name="mais" size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ds-menu">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="ds-meta">
        <span>+{totalPoints}</span>
        {area && <span>{area.name}</span>}
        {task.plannedTimeMinutes && (
          <span><ArcaneIcon name="relogio" size={12} />{task.plannedTimeMinutes}min</span>
        )}
        <span>Esforço: {effortLevel}/5</span>
        {task.childItems && task.childItems.length > 0 && (
          <span>{task.childItems.filter(c => c.isCompleted).length}/{task.childItems.length} itens</span>
        )}
      </div>

      {task.description && (
        <p className="ds-nota line-clamp-2">{task.description}</p>
      )}

      {!task.isCompleted && (onStart || onComplete) && (
        <div className="ds-runa-pe">
          {onStart ? (
            <button
              type="button"
              className="ds-botao"
              data-tipo="secundario"
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
            >
              <ArcaneIcon name="iniciar" size={16} />
              Iniciar
            </button>
          ) : <span />}
          {onComplete && (
            <button
              type="button"
              className="ds-botao"
              data-tipo="fantasma"
              data-icone
              aria-label="Concluir"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              <ArcaneIcon name="concluir" size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
