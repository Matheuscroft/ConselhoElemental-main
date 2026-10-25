import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Plus, Search, Trash2 } from 'lucide-react';
import { DomainAreaNavigator, DomainSectionJump } from '@/components/domains/DomainNavigation';
import { domainFilterSearch, domainReturnHref, readDomainFilters } from '@/components/domains/navigation';
import { focusDomainSection } from '@/components/domains/navigation';
import { AppLayout } from '@/components/layout';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { DomainShowcase, DomainEmpty } from '@/components/domains/DomainPresentation';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import '@/styles/elemental-design-system.css';
import '@/components/domains/domains.css';

export function DominioDetalhe() {
  const { areaId } = useParams<{ areaId: string }>();
  const accountId = useAppStore(state => state.currentAccountId);
  return <AppLayout><DomainWorkspace key={`${accountId ?? 'local'}:${areaId}`} areaId={areaId} /></AppLayout>;
}

function DomainWorkspace({ areaId }: { areaId?: string }) {
  const {
    tasks,
    habits,
    customAreas,
    customSubareas,
    linkedSubareasByAreaId,
    addCustomSubarea,
    linkSubarea,
    unlinkSubarea,
    removeCustomSubarea,
  } = useAppStore();

  const location = useLocation();
  const navigate = useNavigate();
  const rawReturnSearch = location.state?.domainsReturnSearch;
  const returnSearch = domainFilterSearch(readDomainFilters(typeof rawReturnSearch === 'string' ? rawReturnSearch : ''));
  const backHref = domainReturnHref(returnSearch);
  useEffect(() => {
    const frame = requestAnimationFrame(() => focusDomainSection('domain-detail-start'));
    return () => cancelAnimationFrame(frame);
  }, [areaId]);

  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listMode, setListMode] = useState<'active' | 'inactive'>('active');
  const [newSubareaName, setNewSubareaName] = useState('');
  const [formError, setFormError] = useState('');

  const [search, setSearch] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);

  const allAreas = useMemo(() => [...AREAS, ...customAreas], [customAreas]);
  const area = allAreas.find((item) => item.id === areaId);

  const subareas = useMemo(() => {
    if (!area) return [];

    const builtInSubareas = allAreas
      .flatMap((rootArea) => rootArea.subareas || [])
      .filter((subarea) => subarea.parentId === area.id);

    const inlineSubareas = (area.subareas || []).filter(
      (subarea) => subarea.parentId === area.id
    );

    const persistedCustomSubareas = customSubareas[area.id] || [];

    // Evita duplicidade quando a mesma subarea aparece em mais de uma fonte.
    const mergedSubareas = [
      ...builtInSubareas,
      ...inlineSubareas,
      ...persistedCustomSubareas,
    ];

    const uniqueById = new Map(mergedSubareas.map((subarea) => [subarea.id, subarea]));
    return Array.from(uniqueById.values());
  }, [allAreas, area, customSubareas]);

  const activeSubareaSet = useMemo(() => {
    if (!area) return new Set<string>();
    const explicitLinked = linkedSubareasByAreaId[area.id];

    // Backward compatibility: if user has never managed subareas for this area,
    // treat all visible subareas as active.
    if (!explicitLinked) {
      return new Set(subareas.map((subarea) => subarea.id));
    }

    return new Set(explicitLinked);
  }, [area, linkedSubareasByAreaId, subareas]);

  const visibleSubareas = subareas.filter((subarea) =>
    listMode === 'active' ? activeSubareaSet.has(subarea.id) : !activeSubareaSet.has(subarea.id)
  );

  const resetCreateForm = () => {
    setNewSubareaName('');
    setFormError('');
  };

  const handleCreateSubarea = () => {
    if (!area) return;

    const trimmedName = newSubareaName.trim();
    if (!trimmedName) {
      setFormError('Informe o nome da subárea.');
      return;
    }

    const alreadyExists = subareas.some(
      (subarea) => subarea.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      setFormError('Já existe uma subárea com esse nome.');
      return;
    }

    addCustomSubarea(area.id, trimmedName, area.elementId, area.color);
    resetCreateForm();
    setShowCreateModal(false);
    setSearch('');
    setListMode('active');
  };


  if (!area) return <div className="elemental-system domains-workspace"><DomainEmpty title="Área não encontrada"><p>Essa área não existe ou foi removida.</p><Link className="elemental-action elemental-action-secondary" to={backHref}>Voltar para Domínios</Link></DomainEmpty></div>;

  const element = ELEMENTS[area.elementId];
  const areaTaskCount = tasks.filter((task) => task.areaPrimaryId === area.id).length;
  const areaHabitCount = habits.filter((habit) => habit.areaId === area.id).length;

  const handleToggleSubarea = (subareaId: string) => {
    if (activeSubareaSet.has(subareaId)) {
      unlinkSubarea(area.id, subareaId);
      return;
    }

    linkSubarea(area.id, subareaId);
  };


  const searchedSubareas = visibleSubareas.filter(subarea => subarea.name.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')));
  const removal = subareas.find(subarea => subarea.id === removeId && subarea.isCustom);
  return <div className="elemental-system domains-workspace">
    <nav id="domain-detail-start" tabIndex={-1} className="domains-back" aria-label="Navegação da área"><Link to={backHref}><ArrowLeft size={18} aria-hidden="true" />Voltar às áreas</Link><DomainSectionJump target="domain-subareas-heading">Ir às subáreas</DomainSectionJump></nav>
    <DomainShowcase area={area} taskCount={areaTaskCount} habitCount={areaHabitCount} subareaCount={subareas.length} />
    <DomainAreaNavigator areas={allAreas} current={area} returnSearch={returnSearch} onSelect={id => navigate(`/dominios/${id}`, { state: { domainsReturnSearch: returnSearch } })} />
    <section className="domains-library" aria-labelledby="domain-subareas-heading"><div className="domains-section-heading"><div><h2 id="domain-subareas-heading" tabIndex={-1}>Organize suas subáreas</h2><p className="domains-help">Vincule as que fazem parte da sua rotina.</p></div><Button ref={createButtonRef} className="elemental-action" onClick={() => { resetCreateForm(); setShowCreateModal(true); }}><Plus size={18} />Nova subárea</Button></div>
      <div className="domains-toolbar"><div className="domains-mode" role="group" aria-label="Vínculo das subáreas"><button type="button" aria-pressed={listMode === 'active'} onClick={() => setListMode('active')}>Vinculadas ({subareas.filter(subarea => activeSubareaSet.has(subarea.id)).length})</button><button type="button" aria-pressed={listMode === 'inactive'} onClick={() => setListMode('inactive')}>Desvinculadas ({subareas.filter(subarea => !activeSubareaSet.has(subarea.id)).length})</button></div><div className="domains-search"><Search size={18} aria-hidden="true" /><Input type="search" aria-label="Buscar subárea" placeholder="Buscar subárea…" value={search} onChange={event => setSearch(event.target.value)} /></div></div>
      {search && <div className="domain-filter-summary"><span>Busca: {search}</span><button type="button" onClick={() => setSearch('')}>Limpar busca</button></div>}
      <p className="domains-result" role="status">{searchedSubareas.length} {searchedSubareas.length === 1 ? 'subárea encontrada' : 'subáreas encontradas'}</p>
      <div className="domains-subarea-grid">{searchedSubareas.map(subarea => {
        const isYogaSubarea = subarea.id === 'sub-saude-yoga';
        const isCalisteniaSubarea = subarea.id === 'sub-saude-calistenia';
        const dedicatedPath = isYogaSubarea ? '/dominios/yoga' : isCalisteniaSubarea ? '/dominios/calistenia' : null;
        const linkedTaskCount = tasks.filter((task) =>
          task.subareaPrimaryId === subarea.id ||
          task.subareaSecondaryId1 === subarea.id ||
          task.subareaSecondaryId2 === subarea.id
        ).length;
        const linkedHabitCount = habits.filter((habit) => habit.subareaId === subarea.id).length;
        return <article className="domain-subarea" key={subarea.id}><div className="domain-subarea-heading"><ElementIcon element={area.elementId} size={25} /><div><h3>{subarea.name}</h3><small>{subarea.isCustom ? 'Subárea personalizada' : element.name}</small></div></div>
          <dl><div><dt>Rituais</dt><dd>{linkedTaskCount}</dd></div><div><dt>Ciclos</dt><dd>{linkedHabitCount}</dd></div></dl>
          {dedicatedPath && <Link className="domain-module-link" to={dedicatedPath}>Abrir {isYogaSubarea ? 'Yoga' : 'Calistenia'}<ArrowUpRight size={18} aria-hidden="true" /></Link>}
          <div className="domain-subarea-actions"><button type="button" onClick={() => handleToggleSubarea(subarea.id)} aria-label={`${activeSubareaSet.has(subarea.id) ? 'Desvincular' : 'Vincular'} ${subarea.name}`}>{activeSubareaSet.has(subarea.id) ? 'Desvincular' : 'Vincular subárea'}</button>{subarea.isCustom && <button type="button" className="domain-delete" aria-label={`Remover ${subarea.name}`} onClick={() => setRemoveId(subarea.id)}><Trash2 size={18} aria-hidden="true" /></button>}</div>
        </article>;
      })}</div>
      {searchedSubareas.length === 0 && <DomainEmpty title={search ? 'Nenhuma subárea encontrada' : listMode === 'active' ? 'Nenhuma subárea vinculada' : 'Nenhuma subárea desvinculada'}><p>{search ? 'Tente outro nome ou limpe a busca.' : 'Explore o outro filtro ou crie uma subárea personalizada.'}</p><button type="button" className="elemental-action elemental-action-secondary" onClick={() => { if (search) setSearch(''); else setListMode(listMode === 'active' ? 'inactive' : 'active'); }}>{search ? 'Limpar busca' : listMode === 'active' ? 'Ver desvinculadas' : 'Ver vinculadas'}</button></DomainEmpty>}
    </section>
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); createButtonRef.current?.focus(); }} className="elemental-system domain-dialog" aria-labelledby="subarea-create-title" aria-describedby="subarea-create-description"><DialogHeader><DialogTitle id="subarea-create-title">Nova subárea</DialogTitle><DialogDescription id="subarea-create-description">Crie um espaço mais específico dentro de {area.name}.</DialogDescription></DialogHeader><form className="domain-form" onSubmit={event => { event.preventDefault(); handleCreateSubarea(); }}>
      <div className="domain-form-preview"><ElementIcon element={area.elementId} size={28} /><div><small>{element.name}</small><strong>{area.name}</strong></div></div>
      <label htmlFor="subarea-name">Nome da subárea</label><Input id="subarea-name" placeholder="Ex.: Leitura técnica" value={newSubareaName} onChange={event => { setNewSubareaName(event.target.value); if (formError) setFormError(''); }} autoFocus aria-invalid={!!formError} aria-describedby={formError ? 'subarea-form-error' : undefined} />
      {formError && <p id="subarea-form-error" role="alert" className="domain-error">{formError}</p>}
      <div className="domain-form-actions"><Button type="button" className="elemental-action elemental-action-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button><Button type="submit" className="elemental-action">Criar subárea</Button></div>
    </form></DialogContent></Dialog>
    <Dialog open={!!removal} onOpenChange={open => { if (!open) setRemoveId(null); }}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); createButtonRef.current?.focus(); }} className="elemental-system domain-dialog" aria-labelledby="subarea-remove-title" aria-describedby="subarea-remove-description"><DialogHeader><DialogTitle id="subarea-remove-title">Remover subárea personalizada?</DialogTitle><DialogDescription id="subarea-remove-description">Confira o nome antes de remover esta subárea de {area.name}.</DialogDescription></DialogHeader><p className="domain-removal-name">{removal?.name}</p><div className="domain-form-actions"><Button className="elemental-action elemental-action-secondary" onClick={() => setRemoveId(null)}>Cancelar</Button><Button className="elemental-action domain-danger" onClick={() => { if (!removal) return; removeCustomSubarea(area.id, removal.id); setRemoveId(null); }}>Remover subárea</Button></div></DialogContent></Dialog>
  </div>;
}
