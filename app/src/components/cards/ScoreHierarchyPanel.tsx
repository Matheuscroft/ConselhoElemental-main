import { ElementScoreExplorer } from '@/components/elemental/ElementScoreExplorer';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import React, { useMemo, useState } from 'react';
import type { Area, ElementId, Habit, Task } from '@/types';
import { AREAS, ELEMENTS, calculateTaskScore } from '@/constants';

interface ScoreHierarchyPanelProps {
  presentation?: 'default' | 'showcase' | 'explorer';
  tasks: Task[];
  habits: Habit[];
  customAreas?: Area[];
  customSubareas?: Record<string, Area[]>;
}

type AreaWithSubareas = Area & { mergedSubareas: Area[] };

const ELEMENT_ORDER: ElementId[] = ['terra', 'fogo', 'agua', 'ar'];

const getTaskPoints = (task: Task): number => {
  if (!task.isCompleted) return 0;

  if (typeof task.completedScore === 'number') {
    return Math.max(0, Math.round(task.completedScore));
  }

  const score = calculateTaskScore(
    task.baseValue || 1,
    task.effortLevel || 1,
    task.actualTimeMinutes ?? 0,
    !!task.areaPrimaryId
  );
  return Math.max(0, Math.round(score));
};

const toDayStamp = (date: Date | string | number | null | undefined): number | null => {
  if (date == null) return null;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
};

const isHabitCompletedOnDate = (habit: Habit, completionDate: Date | string | number): boolean => {
  const targetDay = toDayStamp(completionDate);
  if (targetDay == null) return false;

  return habit.completions.some((completion) => toDayStamp(completion.completionDate) === targetDay);
};

const sanitizeNonNegativeNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null;
    return Math.max(0, value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) return null;

    return Math.max(0, parsed);
  }

  return null;
};

const getHabitBasePoints = (habit: Habit): number => {
  const semanticType = habit.semanticType ?? 'valuable';
  // The core persists VALUABLE; imported older nodes may use lowercase.
  if (semanticType !== 'valuable' && semanticType !== 'VALUABLE') return 0;

  if (habit.childHabits.length > 0) {
    // Aggregators never contribute direct base points.
    return 0;
  }

  const livePlannedPoints = sanitizeNonNegativeNumber(habit.plannedPoints);
  if (livePlannedPoints != null) return livePlannedPoints;

  const backupPlannedPoints = sanitizeNonNegativeNumber(habit.semanticValueBackup?.plannedPoints);
  if (backupPlannedPoints != null) return backupPlannedPoints;

  return 0;
};

export const ScoreHierarchyPanel: React.FC<ScoreHierarchyPanelProps> = ({
  tasks,
  habits,
  customAreas = [],
  customSubareas = {},
  presentation = 'default',
}) => {
  const [selectedElement, setSelectedElement] = useState<ElementId | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const mergedAreas = useMemo<AreaWithSubareas[]>(() => {
    const allTopAreas = [...AREAS, ...customAreas];

    return allTopAreas.map((area) => {
      const builtInSubareas = (area.subareas || []).filter((sub) => sub.parentId === area.id);
      const persistedCustomSubareas = customSubareas[area.id] || [];
      const uniqueSubareas = Array.from(
        new Map([...builtInSubareas, ...persistedCustomSubareas].map((sub) => [sub.id, sub])).values()
      );

      return {
        ...area,
        mergedSubareas: uniqueSubareas,
      };
    });
  }, [customAreas, customSubareas]);

  const areaById = useMemo(() => {
    const map = new Map<string, Area>();

    mergedAreas.forEach((area) => {
      map.set(area.id, area);
      area.mergedSubareas.forEach((subarea) => map.set(subarea.id, subarea));
    });

    return map;
  }, [mergedAreas]);

  const scoreData = useMemo(() => {
    const habitElementMap: Record<ElementId, number> = {
      terra: 0,
      fogo: 0,
      agua: 0,
      ar: 0,
    };
    const habitAreaScores = new Map<string, number>();
    const habitSubareaScores = new Map<string, number>();

    const accumulateCompletedHabitContributionsForDate = (
      habit: Habit,
      completionDate: Date | string | number
    ) => {
      const ownPoints = isHabitCompletedOnDate(habit, completionDate) ? getHabitBasePoints(habit) : 0;
      if (ownPoints > 0) {
        const resolvedElementId = areaById.get(habit.areaId)?.elementId || habit.elementId;
        habitElementMap[resolvedElementId] += ownPoints;

        if (habit.areaId) {
          habitAreaScores.set(habit.areaId, (habitAreaScores.get(habit.areaId) || 0) + ownPoints);
        }

        if (habit.subareaId) {
          habitSubareaScores.set(habit.subareaId, (habitSubareaScores.get(habit.subareaId) || 0) + ownPoints);
        }
      }

      habit.childHabits.forEach((child) => {
        accumulateCompletedHabitContributionsForDate(child, completionDate);
      });
    };

    habits.forEach((rootHabit) => {
      rootHabit.completions.forEach((completion) => {
        accumulateCompletedHabitContributionsForDate(rootHabit, completion.completionDate);
      });
    });

    const map: Record<ElementId, number> = {
      terra: 0,
      fogo: 0,
      agua: 0,
      ar: 0,
    };

    tasks.forEach((task) => {
      const resolvedElementId = task.areaPrimaryId
        ? areaById.get(task.areaPrimaryId)?.elementId || task.elementId
        : task.elementId;
      map[resolvedElementId] += getTaskPoints(task);
    });

    ELEMENT_ORDER.forEach((elementId) => {
      map[elementId] += habitElementMap[elementId];
    });

    const areaScores = new Map<string, number>();
    tasks.forEach((task) => {
      if (!task.areaPrimaryId) return;
      areaScores.set(task.areaPrimaryId, (areaScores.get(task.areaPrimaryId) || 0) + getTaskPoints(task));
    });
    habitAreaScores.forEach((score, areaId) => {
      areaScores.set(areaId, (areaScores.get(areaId) || 0) + score);
    });

    const subareaScores = new Map<string, number>();
    tasks.forEach((task) => {
      if (!task.subareaPrimaryId) return;
      subareaScores.set(task.subareaPrimaryId, (subareaScores.get(task.subareaPrimaryId) || 0) + getTaskPoints(task));
    });
    habitSubareaScores.forEach((score, subareaId) => {
      subareaScores.set(subareaId, (subareaScores.get(subareaId) || 0) + score);
    });

    return {
      elementScores: ELEMENT_ORDER.map((elementId) => ({
        elementId,
        score: map[elementId],
      })),
      areaScoresById: areaScores,
      subareaScoresById: subareaScores,
    };
  }, [tasks, habits, areaById]);

  const elementScores = scoreData.elementScores;
  const areaScoresById = scoreData.areaScoresById;
  const subareaScoresById = scoreData.subareaScoresById;

  const areasForElement = useMemo(() => {
    if (!selectedElement) return [];
    return mergedAreas.filter((area) => area.elementId === selectedElement);
  }, [mergedAreas, selectedElement]);

  const selectedArea = useMemo(() => {
    if (!selectedAreaId) return null;
    return areasForElement.find((area) => area.id === selectedAreaId) || null;
  }, [areasForElement, selectedAreaId]);

  const maxElementScore = Math.max(1, ...elementScores.map((item) => item.score));
  const maxAreaScore = Math.max(
    1,
    ...areasForElement.map((area) => areaScoresById.get(area.id) || 0)
  );
  const maxSubareaScore = Math.max(
    1,
    ...(selectedArea?.mergedSubareas || []).map((subarea) => subareaScoresById.get(subarea.id) || 0)
  );

  const handleSelectElement = (elementId: ElementId) => {
    setSelectedElement((current) => {
      if (current === elementId) {
        setSelectedAreaId(null);
        return null;
      }
      return elementId;
    });
    setSelectedAreaId(null);
  };

  const breadcrumb = [
    selectedElement ? ELEMENTS[selectedElement].name : null,
    selectedArea?.name || null,
  ].filter(Boolean).join(' > ');

  if (presentation === 'explorer') {
    return <ElementScoreExplorer scores={elementScores} areas={mergedAreas} areaScores={areaScoresById} subareaScores={subareaScoresById} selectedElement={selectedElement} selectedAreaId={selectedAreaId} onSelectElement={handleSelectElement} onSelectArea={id => setSelectedAreaId(current => current === id ? null : id)} />;
  }

  const fio = (value: number): React.CSSProperties => ({ '--medidor-valor': Math.min(Math.max(value, 0), 1) } as React.CSSProperties);

  return (
    <div className={`mb-4 space-y-3 ${presentation === 'showcase' ? 'score-elemental-showcase' : ''}`}>
      <section>
        <div className="ds-secao" data-nivel="2">
          <h3>Pontuacao por elemento</h3>
          <small className="ds-contagem">Total {elementScores.reduce((acc, item) => acc + item.score, 0)} pts</small>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {elementScores.map((item) => {
            const element = ELEMENTS[item.elementId];
            const isActive = selectedElement === item.elementId;

            return (
              <button
                key={item.elementId}
                type="button"
                aria-pressed={isActive}
                data-element={item.elementId}
                onClick={() => handleSelectElement(item.elementId)}
                className="ds-runa score-element-card"
              >
                {presentation === 'showcase' && <img className="score-element-art" src={`/sanctuary/elements/${item.elementId}-v1.webp`} alt="" loading="lazy" width={96} height={96} />}
                <span className="ds-meta"><span><ElementIcon element={element.id} size={16} /> {element.name}</span></span>
                <span className="ds-cifra">{item.score}</span>
                <span className="ds-medidor" data-forma="fio" role="presentation" style={fio(item.score / maxElementScore)} />
              </button>
            );
          })}
        </div>
      </section>

      {selectedElement && (
        <section data-element={selectedElement}>
          <div className="ds-secao" data-nivel="2">
            <h3>Areas de {ELEMENTS[selectedElement].name}</h3>
            {breadcrumb && <small className="ds-contagem">{breadcrumb}</small>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {areasForElement.map((area) => {
              const score = areaScoresById.get(area.id) || 0;
              const isActive = selectedAreaId === area.id;

              return (
                <button
                  key={area.id}
                  type="button"
                  aria-pressed={isActive}
                  data-element={selectedElement}
                  onClick={() => setSelectedAreaId((current) => (current === area.id ? null : area.id))}
                  className="ds-runa score-area-card"
                >
                  <span className="ds-runa-titulo">{area.name}</span>
                  <span className="ds-cifra">{score}</span>
                  <span className="ds-medidor" data-forma="fio" role="presentation" style={fio(score / maxAreaScore)} />
                  {area.mergedSubareas.length > 0 && <ArcaneIcon name="chevron" size={16} className="ds-runa-chevron" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedArea && selectedArea.mergedSubareas.length > 0 && (
        <section data-element={selectedElement ?? undefined}>
          <div className="ds-secao" data-nivel="2">
            <h3>Subareas de {selectedArea.name}</h3>
            <small className="ds-contagem">{selectedArea.mergedSubareas.length} itens</small>
          </div>

          <div>
            {selectedArea.mergedSubareas.map((subarea) => {
              const score = subareaScoresById.get(subarea.id) || 0;
              return (
                <div key={subarea.id} className="ds-linha" data-densa>
                  <div className="min-w-0">
                    <p>{subarea.name}</p>
                    <span className="ds-medidor" data-forma="fio" role="presentation" style={fio(score / maxSubareaScore)} />
                  </div>
                  <span className="ds-linha-valor">{score}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
