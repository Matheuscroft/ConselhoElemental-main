import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Exercise, MuscleGroupId } from '@/types/workout';
import { FitnessEmptyState, FitnessListRow } from '@/components/fitness-kit';

import { MUSCLE_REGIONS as regions, MUSCLE_TARGETS } from '@/constants/muscle-regions';
import { STRENGTH_EQUIPMENT_LABELS } from '@/constants/strength-training-exercises';
import type { StrengthEquipmentId } from '@/types/workout';

const muscleLabels: Record<MuscleGroupId, string> = {
  chest: 'Peito', upper_back: 'Costas superiores', lats: 'Dorsais', lower_back: 'Lombar', shoulders: 'Ombros',
  biceps: 'Bíceps', triceps: 'Tríceps', forearms: 'Antebraços', core: 'Abdômen', obliques: 'Oblíquos', glutes: 'Glúteos',
  quadriceps: 'Quadríceps', hamstrings: 'Posteriores da coxa', calves: 'Panturrilhas', tibialis: 'Tibial anterior',
  serratus: 'Serrátil anterior', adductors: 'Adutores',
};

export function MuscleExerciseCatalog({ exercises, onSelect, icon = Dumbbell }: { exercises: Exercise[]; onSelect: (exercise: Exercise) => void; icon?: LucideIcon }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<MuscleGroupId[]>([]);
  const [includeSecondary, setIncludeSecondary] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<StrengthEquipmentId[]>([]);
  const [contraction, setContraction] = useState<'dynamic' | 'isometric' | null>(null);
  const availableEquipment = Array.from(new Set(exercises.flatMap((exercise) => exercise.strengthProfile?.equipmentIds ?? [])));
  const availableTargets = MUSCLE_TARGETS.filter((target) => exercises.some((exercise) => [...(exercise.primaryMuscles ?? []), ...(exercise.secondaryMuscles ?? [])].includes(target.id)));
  const visible = exercises.filter((exercise) => {
    const matchesMuscle = !selected.length || regions.filter((region) => selected.includes(region.id))
      .some((region) => [...(exercise.primaryMuscles ?? []), ...(includeSecondary ? exercise.secondaryMuscles ?? [] : [])].some((muscle) => region.muscles.includes(muscle)));
    const matchesTarget = !selectedTargets.length || selectedTargets.some((target) => [...(exercise.primaryMuscles ?? []), ...(includeSecondary ? exercise.secondaryMuscles ?? [] : [])].includes(target));
    const matchesEquipment = !selectedEquipment.length || selectedEquipment.some((item) => exercise.strengthProfile?.equipmentIds.includes(item));
    const matchesContraction = !contraction || exercise.strengthProfile?.contraction === contraction;
    return matchesMuscle && matchesTarget && matchesEquipment && matchesContraction;
  });
  const hasTags = exercises.some((exercise) => exercise.primaryMuscles?.length);
  return <div className="space-y-3">
    {hasTags && <><div role="group" aria-label="Filtrar por região muscular" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={!selected.length} onClick={() => setSelected([])} className={`min-h-10 rounded-full border px-3 text-xs font-medium ${!selected.length ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}>Todos</button>
      {regions.map((region) => <button key={region.id} type="button" aria-pressed={selected.includes(region.id)} onClick={() => setSelected((current) => current.includes(region.id) ? current.filter((id) => id !== region.id) : [...current, region.id])} className={`min-h-10 rounded-full border px-3 text-xs font-medium ${selected.includes(region.id) ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}><span aria-hidden="true">{region.emoji}</span> {region.label}</button>)}
    </div><label className="flex min-h-10 items-center gap-2 text-xs text-fitness-muted"><input type="checkbox" className="h-4 w-4 accent-violet-500" checked={includeSecondary} onChange={(event) => setIncludeSecondary(event.target.checked)} />Incluir músculos secundários</label></>}
    {availableTargets.length > 0 && <details className="rounded-xl border border-white/10 px-3">
      <summary className="flex min-h-10 cursor-pointer items-center text-xs font-medium text-fitness-muted">Refinar por músculo específico{selectedTargets.length ? ` · ${selectedTargets.length} selecionados` : ''}</summary>
      <div className="flex flex-wrap gap-2 pb-3" role="group" aria-label="Filtrar por músculo específico">
        {availableTargets.map((target) => <button key={target.id} type="button" aria-pressed={selectedTargets.includes(target.id)} onClick={() => setSelectedTargets((current) => current.includes(target.id) ? current.filter((id) => id !== target.id) : [...current, target.id])} className={`min-h-9 rounded-full border px-3 text-xs ${selectedTargets.includes(target.id) ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}><span aria-hidden="true">{target.emoji}</span> {target.label}</button>)}
      </div>
    </details>}
    {availableEquipment.length > 0 && <div className="space-y-2">
      <p className="text-xs font-medium text-fitness-muted">Equipamento</p>
      <div role="group" aria-label="Filtrar por equipamento" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!selectedEquipment.length} onClick={() => setSelectedEquipment([])} className={`min-h-9 rounded-full border px-3 text-xs ${!selectedEquipment.length ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}>Todos</button>
        {availableEquipment.map((item) => <button key={item} type="button" aria-pressed={selectedEquipment.includes(item)} onClick={() => setSelectedEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} className={`min-h-9 rounded-full border px-3 text-xs ${selectedEquipment.includes(item) ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}>{STRENGTH_EQUIPMENT_LABELS[item]}</button>)}
      </div>
      <div role="group" aria-label="Filtrar pelo tipo de contração" className="flex gap-2">
        {([['dynamic','Dinâmicos'],['isometric','Isométricos']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={contraction === value} onClick={() => setContraction((current) => current === value ? null : value)} className={`min-h-9 rounded-full border px-3 text-xs ${contraction === value ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}>{label}</button>)}
      </div>
    </div>}
    <p className="text-xs text-fitness-muted">{visible.length} de {exercises.length} exercícios</p>
    {visible.map((exercise) => {
      const primaryRegions = (exercise.primaryMuscles ?? []).map((muscle) => regions.find((region) => region.muscles.includes(muscle))).filter((region) => region !== undefined);
      return <FitnessListRow key={exercise.id} icon={icon} title={exercise.name}
        leading={primaryRegions[0] ? <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fitness-primary/10 text-xl">{primaryRegions[0].emoji}</span> : undefined}
        subtitle={[exercise.primaryMuscles?.length ? exercise.primaryMuscles.map((muscle) => `${regions.find((region) => region.muscles.includes(muscle))?.emoji ?? ''} ${muscleLabels[muscle]}`).join(' · ') : exercise.focus, exercise.strengthProfile?.equipmentIds.map((item) => STRENGTH_EQUIPMENT_LABELS[item]).join(', ')].filter(Boolean).join(' · ')}
        onClick={() => onSelect(exercise)} ariaLabel={`Ver ${exercise.name}`} />;
    })}
    {!visible.length && <FitnessEmptyState message={exercises.length ? 'Nenhum exercício corresponde aos filtros. Selecione Todos ou inclua os músculos secundários.' : 'Esta modalidade ainda não tem exercícios no catálogo.'} />}
  </div>;
}

