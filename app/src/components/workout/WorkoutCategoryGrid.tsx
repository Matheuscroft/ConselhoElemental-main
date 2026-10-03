import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { CATEGORY_DESCRIPTIONS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import type { WorkoutExercise, WorkoutExerciseCategory } from '@/types/workout';

interface WorkoutCategoryGridProps {
  catalog: WorkoutExercise[];
  selected: WorkoutExerciseCategory | null;
  onSelect: (category: WorkoutExerciseCategory | null) => void;
}

export const WorkoutCategoryGrid: React.FC<WorkoutCategoryGridProps> = ({ catalog, selected, onSelect }) => {
  const counts = useMemo(() => {
    const map = new Map<WorkoutExerciseCategory, number>();
    catalog.forEach((exercise) => {
      map.set(exercise.category, (map.get(exercise.category) ?? 0) + 1);
    });
    return map;
  }, [catalog]);

  const availableCategories = useMemo(
    () => (Array.from(counts.keys()) as WorkoutExerciseCategory[]).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)),
    [counts]
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="Categorias de treino">
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className={`rounded-2xl border p-3.5 text-left transition-all ${
          selected === null
            ? 'border-mystic-arcane bg-mystic-arcane/15 shadow-glow-arcane'
            : 'border-white/10 bg-black/20 hover:border-white/20'
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-mystic-arcane/20 flex items-center justify-center mb-2">
          <Layers className="w-5 h-5 text-mystic-arcane" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-white">Todos</p>
        <p className="text-[11px] text-white/50 mt-0.5">Catálogo completo</p>
        <p className="text-[10px] text-mystic-gold mt-1.5">{catalog.length} exercícios</p>
      </motion.button>

      {availableCategories.map((category) => {
        const Icon = CATEGORY_ICONS[category];
        const isSelected = selected === category;
        return (
          <motion.button
            key={category}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-pressed={isSelected}
            onClick={() => onSelect(isSelected ? null : category)}
            className={`rounded-2xl border p-3.5 text-left transition-all ${
              isSelected
                ? 'border-mystic-arcane bg-mystic-arcane/15 shadow-glow-arcane'
                : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-mystic-arcane/20 flex items-center justify-center mb-2">
              <Icon className="w-5 h-5 text-mystic-arcane" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-white">{CATEGORY_LABELS[category]}</p>
            <p className="text-[11px] text-white/50 mt-0.5 line-clamp-2">{CATEGORY_DESCRIPTIONS[category]}</p>
            <p className="text-[10px] text-mystic-gold mt-1.5">{counts.get(category) ?? 0} exercícios</p>
          </motion.button>
        );
      })}
    </div>
  );
};
