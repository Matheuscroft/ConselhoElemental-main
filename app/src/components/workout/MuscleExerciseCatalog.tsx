import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Exercise, MuscleGroupId } from '@/types/workout';
import { FitnessEmptyState, FitnessListRow } from '@/components/fitness-kit';

import { MUSCLE_REGIONS as regions } from '@/constants/muscle-regions';

const muscleLabels: Record<MuscleGroupId, string> = {
  chest: 'Peito', upper_back: 'Costas superiores', lats: 'Dorsais', lower_back: 'Lombar', shoulders: 'Ombros',
  biceps: 'Bíceps', triceps: 'Tríceps', forearms: 'Antebraços', core: 'Abdômen', glutes: 'Glúteos',
  quadriceps: 'Quadríceps', hamstrings: 'Posteriores da coxa', calves: 'Panturrilhas', adductors: 'Adutores',
};

export function MuscleExerciseCatalog({ exercises, onSelect, icon = Dumbbell }: { exercises: Exercise[]; onSelect: (exercise: Exercise) => void; icon?: LucideIcon }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [includeSecondary, setIncludeSecondary] = useState(false);
  const visible = exercises.filter((exercise) => !selected.length || regions.filter((region) => selected.includes(region.id))
    .some((region) => [...(exercise.primaryMuscles ?? []), ...(includeSecondary ? exercise.secondaryMuscles ?? [] : [])].some((muscle) => region.muscles.includes(muscle))));
  const hasTags = exercises.some((exercise) => exercise.primaryMuscles?.length);
  return <div className="space-y-3">
    {hasTags && <><div role="group" aria-label="Filtrar por região muscular" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={!selected.length} onClick={() => setSelected([])} className={`min-h-10 rounded-full border px-3 text-xs font-medium ${!selected.length ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}>Todos</button>
      {regions.map((region) => <button key={region.id} type="button" aria-pressed={selected.includes(region.id)} onClick={() => setSelected((current) => current.includes(region.id) ? current.filter((id) => id !== region.id) : [...current, region.id])} className={`min-h-10 rounded-full border px-3 text-xs font-medium ${selected.includes(region.id) ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}><span aria-hidden="true">{region.emoji}</span> {region.label}</button>)}
    </div><label className="flex min-h-10 items-center gap-2 text-xs text-fitness-muted"><input type="checkbox" className="h-4 w-4 accent-violet-500" checked={includeSecondary} onChange={(event) => setIncludeSecondary(event.target.checked)} />Incluir músculos secundários</label></>}
    <p className="text-xs text-fitness-muted">{visible.length} de {exercises.length} exercícios</p>
    {visible.map((exercise) => {
      const primaryRegions = (exercise.primaryMuscles ?? []).map((muscle) => regions.find((region) => region.muscles.includes(muscle))).filter((region) => region !== undefined);
      return <FitnessListRow key={exercise.id} icon={icon} title={exercise.name}
        leading={primaryRegions[0] ? <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fitness-primary/10 text-xl">{primaryRegions[0].emoji}</span> : undefined}
        subtitle={exercise.primaryMuscles?.length ? exercise.primaryMuscles.map((muscle) => `${regions.find((region) => region.muscles.includes(muscle))?.emoji ?? ''} ${muscleLabels[muscle]}`).join(' · ') : exercise.focus}
        onClick={() => onSelect(exercise)} ariaLabel={`Ver ${exercise.name}`} />;
    })}
    {!visible.length && <FitnessEmptyState message={exercises.length ? 'Nenhum exercício corresponde aos filtros. Selecione Todos ou inclua os músculos secundários.' : 'Esta modalidade ainda não tem exercícios no catálogo.'} />}
  </div>;
}

