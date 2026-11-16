import { useId, useState, type CSSProperties } from 'react';
import { ChevronDown, List, Search, X, RotateCcw, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import type { Exercise, MuscleGroupId, StrengthEquipmentId } from '@/types/workout';
import type { ElementoId } from '@/lib/design/palette';
import { FitnessEmptyState } from '@/components/fitness-kit/FitnessEmptyState';
import { ModalidadeLinha } from '@/components/fitness-kit/modalidade-linha';
import { ModalidadeAnel } from '@/components/fitness-kit/modalidade-anel';
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
export function MuscleExerciseCatalog({ exercises, onSelect, icon = FITNESS_ICONS.strength, element = 'terra' }: {
  exercises: Exercise[]; onSelect: (exercise: Exercise) => void; icon?: LucideIcon;
  /** The element that lights the catalogue; presentation only. */
  element?: ElementoId;
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
  const biggest = Math.max(1, ...groups.map((group) => group.exercises.length));
  const grouped = hasTags && !query.trim() && !hasFilters && !listView;
  const refinementCount = selectedTargets.length + selectedEquipment.length + Number(contraction !== null) + Number(includeSecondary);
  const activeFilters = refinementCount + selected.length;
  function resetFilters() {
    setSelected([]); setSelectedTargets([]); setIncludeSecondary(false); setSelectedEquipment([]); setContraction(null); setQuery(''); setLimit(12);
  }
  function exerciseRow(exercise: Exercise, index: number) {
    const presentation = getExercisePresentation(exercise.id, exercises);
    return <ModalidadeLinha key={exercise.id} index={index} icon={exercise.modality || exercise.primaryMuscles?.length ? FITNESS_ICONS[presentation.icon] : icon} title={exercise.name}
      subtitle={[exercise.primaryMuscles?.length ? exercise.primaryMuscles.map(muscle => muscleLabels[muscle]).join(' · ') : exercise.focus, exercise.strengthProfile?.equipmentIds.map(item => STRENGTH_EQUIPMENT_LABELS[item]).join(', ')].filter(Boolean).join(' · ')}
      nivel={exercise.level} onClick={() => onSelect(exercise)} ariaLabel={`Ver ${exercise.name}`} />;
  }
  return <div className="fitness-catalog mo-catalogo space-y-3" data-element={element}>
    <div className="mo-busca-palco" style={{ '--i': 1 } as CSSProperties}>
      <div className="mo-busca ds-glass-float" data-luz="">
        <Search size={19} aria-hidden="true" />
        <input type="search" aria-label="Buscar no catálogo de exercícios" placeholder="Buscar exercício ou músculo" value={query} onChange={event => { setQuery(event.target.value); setLimit(12); }} />
        {query && <button type="button" aria-label="Limpar busca" onClick={() => { setQuery(''); setLimit(12); }}><X size={18} aria-hidden="true" /></button>}
      </div>
    </div>
    {(hasTags || availableEquipment.length > 0 || availableTargets.length > 0) && <details className="mo-refinar ds-pane" style={{ '--i': 2 } as CSSProperties}>
      <summary>
        <span className="mo-refinar-sigilo" aria-hidden="true"><SlidersHorizontal size={18} /></span>
        <span className="mo-refinar-texto"><span className="mo-refinar-titulo">Refinar exercícios</span><span className="mo-refinar-dica">{activeFilters ? `${activeFilters} ${activeFilters === 1 ? 'filtro ativo' : 'filtros ativos'}` : 'Músculos e equipamentos'}</span></span>
        {activeFilters > 0 && <span className="mo-refinar-ativos" aria-hidden="true">{activeFilters}</span>}
        <ChevronDown className="mo-refinar-seta" size={18} aria-hidden="true" />
      </summary>
      <div className="mo-refinar-corpo">
        {hasTags && <fieldset><legend>Região muscular</legend><div role="group" aria-label="Filtrar por região muscular" className="mo-regioes">
          <button type="button" aria-pressed={!selected.length} onClick={() => setSelected([])} className="mo-chip"><FitnessGlyph name="mixed" size={28} />Todos</button>
          {regions.map((region) => <button key={region.id} type="button" aria-pressed={selected.includes(region.id)} onClick={() => setSelected((current) => current.includes(region.id) ? current.filter((id) => id !== region.id) : [...current, region.id])} className="mo-chip"><FitnessGlyph name={region.icon} size={28} />{region.label}</button>)}
        </div></fieldset>}
        {hasTags && <label className="mo-interruptor"><input type="checkbox" checked={includeSecondary} onChange={(event) => setIncludeSecondary(event.target.checked)} />Incluir músculos secundários</label>}
        {availableTargets.length > 0 && <fieldset><legend>Músculo específico</legend><div className="mo-chips" role="group" aria-label="Filtrar por músculo específico">
          {availableTargets.map((target) => <button key={target.id} type="button" aria-pressed={selectedTargets.includes(target.id)} onClick={() => setSelectedTargets((current) => current.includes(target.id) ? current.filter((id) => id !== target.id) : [...current, target.id])} className="mo-chip"><FitnessGlyph name={target.icon} size={26} />{target.label}</button>)}
        </div></fieldset>}
        {availableEquipment.length > 0 && <>
          <fieldset><legend>Equipamento</legend><div role="group" aria-label="Filtrar por equipamento" className="mo-chips">
            <button type="button" aria-pressed={!selectedEquipment.length} onClick={() => setSelectedEquipment([])} className="mo-chip">Todos</button>
            {availableEquipment.map((item) => <button key={item} type="button" aria-pressed={selectedEquipment.includes(item)} onClick={() => setSelectedEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} className="mo-chip"><FitnessGlyph name={equipmentIcons[item]} size={24} />{STRENGTH_EQUIPMENT_LABELS[item]}</button>)}
          </div></fieldset>
          <div role="group" aria-label="Filtrar pelo tipo de contração" className="mo-chips">
            {([['dynamic','Dinâmicos'],['isometric','Isométricos']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={contraction === value} onClick={() => setContraction((current) => current === value ? null : value)} className="mo-chip">{label}</button>)}
          </div>
        </>}
      </div>
    </details>}
    <div className="mo-barra">
      <p role="status">{visible.length} de {exercises.length} exercícios{grouped ? ` · ${groups.length} grupos` : ''}</p>
      <div className="mo-barra-acoes">
        {(hasFilters || query.trim()) && <button type="button" onClick={resetFilters} className="mo-acao"><RotateCcw size={15} aria-hidden="true" />Limpar filtros</button>}
        {hasTags && !hasFilters && !query.trim() && <button type="button" className="mo-acao" onClick={() => { setListView(value => !value); setLimit(12); }}><List size={15} aria-hidden="true" />{listView ? 'Agrupar por região' : 'Ver em lista'}</button>}
      </div>
    </div>
    {grouped ? <>
      <p className="mo-dica">Escolha uma região para explorar. Cada exercício aparece no seu grupo muscular principal.</p>
      <div className="mo-grupos">
        {groups.map((group, groupIndex) => {
          const open = expandedGroup === group.id;
          const targetNames = MUSCLE_TARGETS.filter(target => group.exercises.some(exercise => exercise.primaryMuscles?.includes(target.id))).map(target => target.label);
          return <section key={group.id} className="mo-grupo ds-pane" data-expanded={open} data-luz="" style={{ '--i': groupIndex + 3 } as CSSProperties}>
            <span className="mo-luz-brilho" aria-hidden="true" />
            <span className="mo-luz-borda" aria-hidden="true" />
            <h3><button type="button" className="mo-grupo-toggle" id={`${panelId}-${group.id}-toggle`} aria-expanded={open} aria-controls={`${panelId}-${group.id}`} onClick={() => { setExpandedGroup(current => current === group.id ? null : group.id); setLimit(8); }}>
              <span className="mo-grupo-sigilo" aria-hidden="true"><FitnessGlyph name={group.icon} size={34} /></span>
              <span className="mo-grupo-texto"><span className="mo-grupo-nome">{group.label}</span><span className="mo-grupo-alvos">{targetNames.slice(0,3).join(' · ') || 'Sem região principal definida'}</span></span>
              <ModalidadeAnel fracao={group.exercises.length / biggest}>{group.exercises.length}</ModalidadeAnel>
              <span className="sr-only">{group.exercises.length} {group.exercises.length === 1 ? 'exercício' : 'exercícios'}</span>
              <ChevronDown className="mo-grupo-seta" size={18} aria-hidden="true" />
            </button></h3>
            <div hidden={!open} id={`${panelId}-${group.id}`} role="region" aria-label={`Exercícios de ${group.label}`} className="mo-grupo-conteudo">{open && <>
              {group.exercises.slice(0,limit).map(exerciseRow)}
              <p className="mo-contagem-lista">Mostrando {Math.min(limit,group.exercises.length)} de {group.exercises.length}</p>
              {limit < group.exercises.length && <button type="button" className="mo-mais" onClick={() => setLimit(value => value + 8)}>Ver mais {Math.min(8,group.exercises.length-limit)} exercícios de {group.label}</button>}
              <button type="button" className="mo-recolher" onClick={() => { setExpandedGroup(null); document.getElementById(`${panelId}-${group.id}-toggle`)?.focus({preventScroll:true}); }}>Recolher {group.label}</button>
            </>}</div>
          </section>;
        })}
      </div>
    </> : <div className="mo-lista">{visible.slice(0,limit).map(exerciseRow)}
      {limit < visible.length && <button type="button" className="mo-mais" onClick={() => setLimit(value => value + 12)}>Ver mais {Math.min(12,visible.length-limit)} exercícios · {Math.min(limit,visible.length)} de {visible.length}</button>}
    </div>}
    {!visible.length && <FitnessEmptyState compact icon={<Search size={20} strokeWidth={1.5} />} message={exercises.length ? 'Nenhum exercício encontrado. Tente outro termo ou limpe os filtros.' : 'Esta modalidade ainda não tem exercícios no catálogo.'} />}
  </div>;
}
