import { useId, useState } from 'react';
import { ChevronDown, List, Search, X, RotateCcw, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import type { Exercise, MuscleGroupId, StrengthEquipmentId } from '@/types/workout';
import { FitnessEmptyState } from '@/components/fitness-kit/FitnessEmptyState';
import { FitnessListRow } from '@/components/fitness-kit/FitnessListRow';
import { FITNESS_ICONS, FitnessGlyph, type FitnessGlyphName } from '@/components/fitness-kit/FitnessGlyph';
import { MUSCLE_REGIONS as regions, MUSCLE_TARGETS } from '@/constants/muscle-regions';
import { getExercisePresentation } from '@/lib/workout/workout-focus';
import { groupCatalogExercises, matchesCatalogSearch } from '@/lib/workout/catalog-navigation';
import { STRENGTH_EQUIPMENT_LABELS } from '@/constants/strength-training-exercises';

const equipmentIcons: Record<StrengthEquipmentId, FitnessGlyphName> = {
  barbell: 'barbell', ez_bar: 'ez_bar', dumbbell: 'dumbbell', kettlebell: 'kettlebell',
  cable: 'cable', selectorized_machine: 'machine', plate_loaded_machine: 'machine',
  smith_machine: 'rack', bench: 'bench', preacher_bench: 'preacher_bench', rack: 'rack',
  resistance_band: 'band', weight_plate: 'plate', wrist_roller: 'wrist_roller',
};
const muscleLabels: Record<MuscleGroupId, string> = {
  chest: 'Peito', upper_back: 'Costas superiores', lats: 'Dorsais', lower_back: 'Lombar', shoulders: 'Ombros',
  biceps: 'Bíceps', triceps: 'Tríceps', forearms: 'Antebraços', core: 'Abdômen', obliques: 'Oblíquos', glutes: 'Glúteos',
  quadriceps: 'Quadríceps', hamstrings: 'Posteriores da coxa', calves: 'Panturrilhas', tibialis: 'Tibial anterior',
  serratus: 'Serrátil anterior', adductors: 'Adutores',
};

/** Filters only the existing catalogue; neither exercises nor muscle assignments are rewritten. */
export function MuscleExerciseCatalog({ exercises, onSelect, icon = FITNESS_ICONS.strength }: {
  exercises: Exercise[]; onSelect: (exercise: Exercise) => void; icon?: LucideIcon;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<MuscleGroupId[]>([]);
  const [includeSecondary, setIncludeSecondary] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<StrengthEquipmentId[]>([]);
  const [contraction, setContraction] = useState<'dynamic' | 'isometric' | null>(null);
  const [query, setQuery] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [listView, setListView] = useState(false);
  const [limit, setLimit] = useState(12);
  const panelId = useId();
  const availableEquipment = Array.from(new Set(exercises.flatMap((exercise) => exercise.strengthProfile?.equipmentIds ?? [])));
  const availableTargets = MUSCLE_TARGETS.filter((target) => exercises.some((exercise) => [...(exercise.primaryMuscles ?? []), ...(exercise.secondaryMuscles ?? [])].includes(target.id)));
  const visible = exercises.filter((exercise) => {
    const matchesMuscle = !selected.length || regions.filter((region) => selected.includes(region.id))
      .some((region) => [...(exercise.primaryMuscles ?? []), ...(includeSecondary ? exercise.secondaryMuscles ?? [] : [])].some((muscle) => region.muscles.includes(muscle)));
    const matchesTarget = !selectedTargets.length || selectedTargets.some((target) => [...(exercise.primaryMuscles ?? []), ...(includeSecondary ? exercise.secondaryMuscles ?? [] : [])].includes(target));
    const matchesEquipment = !selectedEquipment.length || selectedEquipment.some((item) => exercise.strengthProfile?.equipmentIds.includes(item));
    const matchesContraction = !contraction || exercise.strengthProfile?.contraction === contraction;
    return matchesMuscle && matchesTarget && matchesEquipment && matchesContraction && matchesCatalogSearch(exercise, query, includeSecondary);
  });
  const hasTags = exercises.some((exercise) => exercise.primaryMuscles?.length);
  const hasFilters = selected.length > 0 || selectedTargets.length > 0 || includeSecondary || selectedEquipment.length > 0 || contraction !== null;
  const groups = groupCatalogExercises(visible);
  const grouped = hasTags && !query.trim() && !hasFilters && !listView;
  const refinementCount = selectedTargets.length + selectedEquipment.length + Number(contraction !== null) + Number(includeSecondary);
  function resetFilters() {
    setSelected([]); setSelectedTargets([]); setIncludeSecondary(false); setSelectedEquipment([]); setContraction(null); setQuery(''); setLimit(12);
  }
  function exerciseRow(exercise: Exercise) {
    const presentation = getExercisePresentation(exercise.id, exercises);
    return <FitnessListRow key={exercise.id} icon={exercise.modality || exercise.primaryMuscles?.length ? FITNESS_ICONS[presentation.icon] : icon} title={exercise.name}
      subtitle={[exercise.primaryMuscles?.length ? exercise.primaryMuscles.map(muscle => muscleLabels[muscle]).join(' · ') : exercise.focus, exercise.strengthProfile?.equipmentIds.map(item => STRENGTH_EQUIPMENT_LABELS[item]).join(', ')].filter(Boolean).join(' · ')}
      onClick={() => onSelect(exercise)} ariaLabel={`Ver ${exercise.name}`} />;
  }
  return <div className="fitness-catalog space-y-3">
    <div className="fitness-catalog-search">
      <Search size={19} aria-hidden="true" />
      <input type="search" aria-label="Buscar no catálogo de exercícios" placeholder="Buscar exercício ou músculo" value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} />
      {query && <button type="button" aria-label="Limpar busca" onClick={() => { setQuery(''); setLimit(12); }}><X size={18} aria-hidden="true" /></button>}
    </div>
    {(hasTags || availableEquipment.length > 0 || availableTargets.length > 0) && <details className="fitness-catalog-refinements">
      <summary><SlidersHorizontal size={17} aria-hidden="true" /><span>Refinar exercícios</span><span className="ml-auto text-xs">{refinementCount + selected.length ? `${refinementCount + selected.length} ativos` : 'Músculos e equipamentos'}</span></summary>
      <div className="space-y-4 p-3 pt-1">
    {hasTags && <fieldset><legend className="mb-2 text-xs text-fitness-muted">Região muscular</legend><div role="group" aria-label="Filtrar por região muscular" className="fitness-region-grid">
      <button type="button" aria-pressed={!selected.length} onClick={() => setSelected([])} className="fitness-filter-chip"><FitnessGlyph name="mixed" size={28} />Todos</button>
      {regions.map((region) => <button key={region.id} type="button" aria-pressed={selected.includes(region.id)} onClick={() => setSelected((current) => current.includes(region.id) ? current.filter((id) => id !== region.id) : [...current, region.id])} className="fitness-filter-chip"><FitnessGlyph name={region.icon} size={28} />{region.label}</button>)}
    </div></fieldset>}
        {hasTags && <label className="flex min-h-11 items-center gap-3 text-sm text-fitness-muted"><input type="checkbox" className="h-5 w-5 accent-[rgb(var(--el-gold))]" checked={includeSecondary} onChange={(event) => setIncludeSecondary(event.target.checked)} />Incluir músculos secundários</label>}
        {availableTargets.length > 0 && <fieldset><legend className="mb-2 text-xs text-fitness-muted">Músculo específico</legend><div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por músculo específico">
          {availableTargets.map((target) => <button key={target.id} type="button" aria-pressed={selectedTargets.includes(target.id)} onClick={() => setSelectedTargets((current) => current.includes(target.id) ? current.filter((id) => id !== target.id) : [...current, target.id])} className="fitness-filter-chip"><FitnessGlyph name={target.icon} size={26} />{target.label}</button>)}
        </div></fieldset>}
        {availableEquipment.length > 0 && <>
          <fieldset><legend className="mb-2 text-xs text-fitness-muted">Equipamento</legend><div role="group" aria-label="Filtrar por equipamento" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!selectedEquipment.length} onClick={() => setSelectedEquipment([])} className="fitness-filter-chip">Todos</button>
            {availableEquipment.map((item) => <button key={item} type="button" aria-pressed={selectedEquipment.includes(item)} onClick={() => setSelectedEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} className="fitness-filter-chip"><FitnessGlyph name={equipmentIcons[item]} size={24} />{STRENGTH_EQUIPMENT_LABELS[item]}</button>)}
          </div></fieldset>
          <div role="group" aria-label="Filtrar pelo tipo de contração" className="flex flex-wrap gap-2">
            {([['dynamic','Dinâmicos'],['isometric','Isométricos']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={contraction === value} onClick={() => setContraction((current) => current === value ? null : value)} className="fitness-filter-chip">{label}</button>)}
          </div>
        </>}
      </div>
    </details>}
    <div className="fitness-catalog-toolbar">
      <p role="status">{visible.length} de {exercises.length} exercícios{grouped ? ` · ${groups.length} grupos` : ''}</p>
      <div className="flex flex-wrap items-center gap-1">
        {(hasFilters || query.trim()) && <button type="button" onClick={resetFilters} className="fitness-filter-reset"><RotateCcw size={15} aria-hidden="true" />Limpar filtros</button>}
        {hasTags && !hasFilters && !query.trim() && <button type="button" className="fitness-filter-reset" onClick={() => { setListView(value => !value); setLimit(12); }}><List size={15} aria-hidden="true" />{listView ? 'Agrupar por região' : 'Ver em lista'}</button>}
      </div>
    </div>
    {grouped ? <>
      <p className="text-xs leading-relaxed text-fitness-muted">Escolha uma região para explorar. Cada exercício aparece no seu grupo muscular principal.</p>
      <div className="fitness-catalog-groups">
        {groups.map(group => {
          const open = expandedGroup === group.id;
          const targetNames = MUSCLE_TARGETS.filter(target => group.exercises.some(exercise => exercise.primaryMuscles?.includes(target.id))).map(target => target.label);
          return <section key={group.id} className="fitness-catalog-group" data-expanded={open}>
            <h3><button type="button" className="fitness-catalog-group-toggle" id={`${panelId}-${group.id}-toggle`} aria-expanded={open} aria-controls={`${panelId}-${group.id}`} onClick={() => { setExpandedGroup(current => current === group.id ? null : group.id); setLimit(8); }}>
              <span className="fitness-elemental-badge grid h-12 w-12 shrink-0 place-items-center rounded-2xl"><FitnessGlyph name={group.icon} size={32} /></span>
              <span className="min-w-0 flex-1"><span className="block font-display text-xl text-fitness-text">{group.label}</span><span className="mt-1 block text-xs font-normal leading-relaxed text-fitness-muted">{targetNames.slice(0,3).join(' · ') || 'Sem região principal definida'}</span></span>
              <span className="fitness-catalog-group-count" aria-label={`${group.exercises.length} exercícios`}>{group.exercises.length}</span><ChevronDown size={18} aria-hidden="true" className={open ? 'rotate-180' : ''} />
            </button></h3>
            <div hidden={!open} id={`${panelId}-${group.id}`} role="region" aria-label={`Exercícios de ${group.label}`} className="fitness-catalog-group-content">{open && <>
              {group.exercises.slice(0,limit).map(exerciseRow)}
              <p className="text-center text-xs text-fitness-muted">Mostrando {Math.min(limit,group.exercises.length)} de {group.exercises.length}</p>
              {limit < group.exercises.length && <button type="button" className="fitness-catalog-more" onClick={() => setLimit(value => value + 8)}>Ver mais {Math.min(8,group.exercises.length-limit)} exercícios de {group.label}</button>}
              <button type="button" className="fitness-catalog-collapse" onClick={() => { setExpandedGroup(null); document.getElementById(`${panelId}-${group.id}-toggle`)?.focus({preventScroll:true}); }}>Recolher {group.label}</button>
            </>}</div>
          </section>;
        })}
      </div>
    </> : <div className="space-y-3">{visible.slice(0,limit).map(exerciseRow)}
      {limit < visible.length && <button type="button" className="fitness-catalog-more" onClick={() => setLimit(value => value + 12)}>Ver mais {Math.min(12,visible.length-limit)} exercícios · {Math.min(limit,visible.length)} de {visible.length}</button>}
    </div>}
    {!visible.length && <FitnessEmptyState message={exercises.length ? 'Nenhum exercício encontrado. Tente outro termo ou limpe os filtros.' : 'Esta modalidade ainda não tem exercícios no catálogo.'} />}
  </div>;
}
