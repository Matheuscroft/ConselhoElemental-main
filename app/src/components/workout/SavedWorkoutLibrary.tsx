import { useId, useMemo, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { Exercise, WorkoutTemplate } from '@/types/workout';
import { CATEGORY_LABELS } from '@/lib/workout/workout-labels';
import { getWorkoutPresentation } from '@/lib/workout/workout-focus';
import { FITNESS_ICONS, FitnessGlyph } from '@/components/fitness-kit/FitnessGlyph';
import { FitnessListRow } from '@/components/fitness-kit/FitnessListRow';
import { FitnessEmptyState } from '@/components/fitness-kit/FitnessEmptyState';
import { FitnessButton } from '@/components/fitness-kit/FitnessButton';

const PAGE_SIZE = 6;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
const modifiedAt = (template: WorkoutTemplate) => Date.parse(template.updatedAt || template.createdAt) || 0;

/** Read-only entry to existing templates; opening a row never starts a session. */
export function SavedWorkoutLibrary({ templates, catalog, onOpen, onExplore }: {
  templates: WorkoutTemplate[]; catalog: Exercise[]; onOpen: (id: string) => void; onExplore: () => void;
}) {
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const matches = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    return templates.filter((template) => {
      const text = normalize(`${template.name} ${CATEGORY_LABELS[template.modality] ?? ''}`);
      return words.every((word) => text.includes(word));
    }).sort((a, b) => modifiedAt(b) - modifiedAt(a));
  }, [templates, query]);
  const clearSearch = () => { setQuery(''); setLimit(PAGE_SIZE); searchRef.current?.focus(); };

  return <section aria-labelledby={`${id}-heading`} className="tr-meus space-y-4">
    <div className="tr-meus-cab">
      <h2 id={`${id}-heading`} className="tr-secao-titulo">Meus treinos <span className="tr-meus-contagem">{templates.length}</span></h2>
      {templates.length > 0 && <button type="button" onClick={onExplore} className="tr-novo"><Plus size={18} aria-hidden="true" />Novo treino</button>}
    </div>
    {templates.length > 0 ? <>
      <div className="relative">
        <label htmlFor={`${id}-search`} className="sr-only">Buscar treinos pelo nome ou modalidade</label>
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fitness-muted" />
        <input ref={searchRef} id={`${id}-search`} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(PAGE_SIZE); }} placeholder="Buscar treino ou modalidade" className="tr-meus-busca min-h-12 w-full min-w-0 rounded-xl border border-fitness-muted/25 py-3 pl-10 pr-12 text-base text-fitness-text outline-none placeholder:text-fitness-muted focus-visible:ring-2 focus-visible:ring-fitness-primary" />
        {query && <button type="button" aria-label="Limpar busca de treinos" onClick={clearSearch} className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-xl text-fitness-muted outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"><X size={18} aria-hidden="true" /></button>}
      </div>
      <p role="status" className="text-xs text-fitness-muted">{Math.min(limit, matches.length)} de {matches.length} {matches.length === 1 ? 'treino encontrado' : 'treinos encontrados'}</p>
      <div className="space-y-2">
        {matches.slice(0, limit).map((template) => {
          const presentation = getWorkoutPresentation(template, catalog);
          return <FitnessListRow key={template.id} icon={FITNESS_ICONS[presentation.icon]} title={template.name} subtitle={`${CATEGORY_LABELS[template.modality] ?? 'Misto'} · ${template.exercises.length} ${template.exercises.length === 1 ? 'exercício' : 'exercícios'}`} ariaLabel={`Ver treino ${template.name}`} onClick={() => onOpen(template.id)} />;
        })}
      </div>
      {matches.length === 0 && <div className="tr-vazio" data-compacto="true"><p className="tr-vazio-texto">Nenhum treino corresponde à busca.</p><button type="button" onClick={clearSearch} className="tr-secao-acao min-h-11 px-3 outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">Mostrar todos os treinos</button></div>}
      {matches.length > PAGE_SIZE && <button type="button" onClick={() => setLimit((current) => current >= matches.length ? PAGE_SIZE : current + PAGE_SIZE)} className="min-h-11 w-full rounded-xl border border-fitness-primary/30 px-4 text-sm font-medium text-fitness-primary outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">{limit >= matches.length ? 'Mostrar menos' : `Mostrar mais ${Math.min(PAGE_SIZE, matches.length - limit)} treinos`}</button>}
    </> : <FitnessEmptyState
      icon={<FitnessGlyph name="strength" size={30} />}
      title="Seu primeiro treino começa aqui"
      message="Seus treinos salvos aparecerão aqui, e cada série que você fizer fica selada só para você. Escolha uma modalidade abaixo para montar o primeiro."
      action={<FitnessButton size="md" className="w-full max-w-xs" onClick={onExplore}><Plus size={18} aria-hidden="true" />Novo treino</FitnessButton>}
    />}
  </section>;
}
