import { useEffect, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { DomainCatalogue } from '@/components/domains/DomainCatalogue';
import { DomainSectionJump } from '@/components/domains/DomainNavigation';
import { readDomainFilters, domainFilterSearch, type DomainFilters } from '@/components/domains/navigation';
import { focusDomainSection } from '@/components/domains/navigation';
import { AppLayout } from '@/components/layout';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { DomainElementRail, DomainElementPicker, DomainEmpty } from '@/components/domains/DomainPresentation';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS, type ElementId } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import '@/styles/elemental-design-system.css';
import '@/components/domains/domains.css';

export function Dominios() {
  const accountId = useAppStore(state => state.currentAccountId);
  return <AppLayout><DomainsWorkspace key={accountId ?? 'local'} /></AppLayout>;
}

function DomainsWorkspace() {
  const {
    getAreaScores,
    customAreas,
    onboarding,
    addCustomArea,
    selectArea,
    deselectArea,
  } = useAppStore();
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filters = readDomainFilters(searchParams.toString());
  const { element: selectedElement, mode: listMode, query: search } = filters;
  const updateFilters = (patch: Partial<DomainFilters>) => setSearchParams(domainFilterSearch({ ...filters, ...patch }), { replace: true });
  const setSelectedElement = (element: ElementId | null) => updateFilters({ element });
  const setListMode = (mode: 'active' | 'inactive') => updateFilters({ mode });
  const setSearch = (query: string) => updateFilters({ query });
  useEffect(() => {
    if (location.hash !== '#domains-areas-heading') return;
    const frame = requestAnimationFrame(() => focusDomainSection('domains-areas-heading'));
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaElement, setNewAreaElement] = useState<ElementId>('terra');
  const [formError, setFormError] = useState('');


  const areaScores = getAreaScores();
  const allAreas = [...AREAS, ...customAreas];
  const activeAreaSet = new Set(onboarding.selectedAreas);
  const elementOrder: ElementId[] = ['terra', 'fogo', 'agua', 'ar'];

  const getOrderedAreasForElement = (elementId: ElementId) => {
    const builtInAreas = AREAS.filter((area) => area.elementId === elementId);
    const customAreasForElement = customAreas.filter((area) => area.elementId === elementId);
    return [...builtInAreas, ...customAreasForElement];
  };

  const filteredAreas = selectedElement
    ? getOrderedAreasForElement(selectedElement)
    : elementOrder.flatMap((elementId) => getOrderedAreasForElement(elementId));

  const resetCreateForm = () => {
    setNewAreaName('');
    setNewAreaElement('terra');
    setFormError('');
  };

  const handleCreateArea = () => {
    const trimmedName = newAreaName.trim();
    if (!trimmedName) {
      setFormError('Informe o nome da área.');
      return;
    }

    const alreadyExists = allAreas.some(
      (area) => area.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      setFormError('Já existe uma área com esse nome.');
      return;
    }

    const createdArea = addCustomArea(trimmedName, newAreaElement);
    selectArea(createdArea.id);
    resetCreateForm();
    setShowCreateModal(false);
    updateFilters({ element: newAreaElement, mode: 'active', query: '' });
  };

  const toggleAreaLink = (areaId: string) => {
    if (activeAreaSet.has(areaId)) {
      deselectArea(areaId);
      return;
    }

    selectArea(areaId);
  };

  const visibleAreas = filteredAreas.filter((area) =>
    listMode === 'active' ? activeAreaSet.has(area.id) : !activeAreaSet.has(area.id)
  );


  const searchedAreas = visibleAreas.filter(area => `${area.name} ${area.description}`.toLocaleLowerCase('pt-BR').includes(search.trim().toLocaleLowerCase('pt-BR')));
  const counts = Object.fromEntries(elementOrder.map(id => [id, getOrderedAreasForElement(id).length])) as Record<ElementId, number>;
  return <div className="elemental-system domains-workspace">
    <header className="domains-heading"><span className="domains-heading-rune"><ArcaneIcon name="dominios" size={36} /></span><div><h1>Domínios</h1><p>Organize as áreas que fazem parte da sua vida.</p></div>
      <Button ref={createButtonRef} className="elemental-action" onClick={() => { resetCreateForm(); setShowCreateModal(true); }}><Plus size={19} />Nova área</Button>
    </header>
    <nav className="domain-section-nav" aria-label="Atalhos de Domínios"><DomainSectionJump target="domains-areas-heading">Ir às áreas</DomainSectionJump><button type="button" onClick={() => { focusDomainSection('domains-areas-heading'); document.getElementById('domains-area-search')?.focus({ preventScroll: true }); }}><Search size={16} aria-hidden="true" />Buscar uma área</button></nav>
    <section aria-labelledby="domains-elements-heading"><div className="domains-section-heading"><h2 id="domains-elements-heading" tabIndex={-1}>Quatro elementos, seus caminhos</h2><button type="button" aria-pressed={selectedElement === null} onClick={() => setSelectedElement(null)}>Todos os elementos</button></div>
      <DomainElementRail selected={selectedElement} counts={counts} onSelect={setSelectedElement} />
<div className="domain-rail-footer"><p className="domains-help">Escolha um elemento para expandir e filtrar suas áreas. Toque novamente para ver todas.</p><DomainSectionJump target="domains-areas-heading">Ver {searchedAreas.length} áreas</DomainSectionJump></div>
    </section>
    <section className="domains-library" aria-labelledby="domains-areas-heading">
      <div className="domains-section-heading"><h2 id="domains-areas-heading" tabIndex={-1}>{selectedElement ? `Áreas de ${ELEMENTS[selectedElement].name}` : 'Todas as áreas'}</h2><DomainSectionJump target="domains-elements-heading">Trocar elemento</DomainSectionJump></div>
      <div className="domains-toolbar"><div className="domains-mode" role="group" aria-label="Vínculo das áreas">
        <button type="button" aria-pressed={listMode === 'active'} onClick={() => setListMode('active')}>Vinculadas ({filteredAreas.filter(area => activeAreaSet.has(area.id)).length})</button>
        <button type="button" aria-pressed={listMode === 'inactive'} onClick={() => setListMode('inactive')}>Desvinculadas ({filteredAreas.filter(area => !activeAreaSet.has(area.id)).length})</button>
      </div><div className="domains-search"><Search size={18} aria-hidden="true" /><Input id="domains-area-search" type="search" aria-label="Buscar área por nome ou descrição" placeholder="Buscar área…" value={search} onChange={event => setSearch(event.target.value)} /></div></div>
      {(selectedElement || search || listMode === 'inactive') && <div className="domain-filter-summary" aria-label="Filtros aplicados">{selectedElement && <button type="button" onClick={() => setSelectedElement(null)} aria-label={`Remover filtro ${ELEMENTS[selectedElement].name}`}>{ELEMENTS[selectedElement].name}<X size={14} aria-hidden="true" /></button>}{search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca">Busca: {search}<X size={14} aria-hidden="true" /></button>}<button type="button" onClick={() => updateFilters({ element: null, mode: 'active', query: '', expanded: null })}>Limpar filtros</button></div>}
      <p className="domains-result" role="status">{searchedAreas.length} {searchedAreas.length === 1 ? 'área encontrada' : 'áreas encontradas'}</p>
      <DomainCatalogue areas={searchedAreas} scores={areaScores} activeAreas={activeAreaSet} selectedElement={selectedElement} expanded={filters.expanded} searching={!!search.trim()} returnSearch={domainFilterSearch(filters)} onExpand={expanded => updateFilters({ expanded })} onToggle={toggleAreaLink} />
      {searchedAreas.length === 0 && <DomainEmpty title={search ? 'Nenhuma área encontrada' : listMode === 'active' ? 'Nenhuma área vinculada neste elemento' : 'Todas as áreas deste elemento estão vinculadas'}><p>{search ? 'Tente outra palavra ou limpe a busca.' : 'Alterne o vínculo ou explore outro elemento.'}</p><button type="button" className="elemental-action elemental-action-secondary" onClick={() => { if (search) setSearch(''); else setListMode(listMode === 'active' ? 'inactive' : 'active'); }}>{search ? 'Limpar busca' : listMode === 'active' ? 'Ver desvinculadas' : 'Ver vinculadas'}</button></DomainEmpty>}
    </section>
    <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); createButtonRef.current?.focus(); }} className="elemental-system domain-dialog" aria-labelledby="domain-create-title" aria-describedby="domain-create-description"><DialogHeader><DialogTitle id="domain-create-title">Uma nova área para sua vida</DialogTitle><DialogDescription id="domain-create-description">Dê um nome e escolha o elemento. Sua nova área será vinculada automaticamente.</DialogDescription></DialogHeader>
      <form className="domain-form" onSubmit={event => { event.preventDefault(); handleCreateArea(); }}>
        <label htmlFor="domain-name">Nome da área</label><Input id="domain-name" placeholder="Ex.: Estudo profundo" value={newAreaName} onChange={event => { setNewAreaName(event.target.value); if (formError) setFormError(''); }} autoFocus aria-invalid={!!formError} aria-describedby={formError ? 'domain-form-error' : undefined} />
        <DomainElementPicker value={newAreaElement} onChange={value => { setNewAreaElement(value); if (formError) setFormError(''); }} />
        <div className="domain-form-preview"><ArcaneIcon name={newAreaElement} size={28} /><div><small>Prévia da área</small><strong>{newAreaName.trim() || 'Nome da sua área'}</strong><span>{ELEMENTS[newAreaElement].name}</span></div></div>
        {formError && <p id="domain-form-error" role="alert" className="domain-error">{formError}</p>}
        <div className="domain-form-actions"><Button type="button" className="elemental-action elemental-action-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</Button><Button type="submit" className="elemental-action">Criar área</Button></div>
      </form>
    </DialogContent></Dialog>
  </div>;
}
