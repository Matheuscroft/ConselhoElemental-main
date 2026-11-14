import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import React from 'react';
import type { Habit } from '@/types';
import { ELEMENTS, getAreaById } from '@/constants';

interface HabitCardProps {
  habit: Habit;
  onComplete?: () => void;
  onClick?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onComplete,
  onClick,
}) => {
  const element = ELEMENTS[habit.elementId];
  const area = getAreaById(habit.areaId);
  
  const isCompletedToday = habit.lastCompletedAt && 
    new Date(habit.lastCompletedAt).toDateString() === new Date().toDateString();

  const recurrence = habit.recurrenceType === 'DAILY' ? 'Diário' :
    habit.recurrenceType === 'WEEKLY' ? 'Semanal' :
    habit.recurrenceType === 'MONTHLY' ? 'Mensal' : 'Anual';

  return (
    <div
      onClick={onClick}
      className="ds-runa"
      data-element={habit.elementId}
      data-completed={isCompletedToday ? 'true' : undefined}
    >
      <div className="ds-runa-cabeca">
        <button
          type="button"
          className="ds-selo"
          aria-pressed={!!isCompletedToday}
          aria-label={`Concluir ${habit.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.();
          }}
          disabled={!!isCompletedToday}
        >
          <ArcaneIcon name="concluir" size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="ds-runa-titulo">{habit.name}</p>
          {habit.description && <p className="ds-nota line-clamp-1">{habit.description}</p>}
        </div>
        <span><ElementIcon element={element.id} label={element.name} /></span>
      </div>

      <div className="ds-meta">
        {area && <span>{area.name}</span>}
        <span><ArcaneIcon name="calendario" size={12} />{recurrence}</span>
        <span>+{habit.plannedPoints} pts</span>
        {habit.streak > 0 && (
          <span><ArcaneIcon name="ofensiva" size={12} />{habit.streak} dia{habit.streak !== 1 ? 's' : ''} consecutivo{habit.streak !== 1 ? 's' : ''}</span>
        )}
      </div>

      {habit.streak > 0 && (
        <span
          className="ds-medidor"
          data-forma="fio"
          role="img"
          aria-label={`${habit.streak} de 10 dias`}
          style={{ '--medidor-valor': Math.min(habit.streak / 10, 1) } as React.CSSProperties}
        />
      )}
    </div>
  );
};
