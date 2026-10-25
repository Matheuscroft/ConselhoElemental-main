import { useId, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS, type ElementId } from '@/constants';
import type { Area } from '@/types';

export const DOMAIN_ELEMENTS: ElementId[] = ['terra', 'fogo', 'agua', 'ar'];
const TINTS = { terra: '151 192 144', fogo: '245 162 109', agua: '125 207 229', ar: '197 223 229' };
const tint = (id: ElementId) => ({ '--domain-tint': TINTS[id] } as CSSProperties);
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function DomainArt({ element }: { element: ElementId }) {
  const [failed, setFailed] = useState(false);
  return failed ? <ElementIcon element={element} size={80} /> : <img src={`/sanctuary/elements/${element}-v1.webp`} alt="" width={240} height={240} loading="lazy" onError={() => setFailed(true)} />;
}

export function DomainElementRail({ selected, counts, onSelect }: { selected: ElementId | null; counts: Record<ElementId, number>; onSelect: (id: ElementId | null) => void }) {
  const id = useId();
  return <div className="domain-rail" role="group" aria-label="Filtrar áreas por elemento">{DOMAIN_ELEMENTS.map(elementId => {
    const open = selected === elementId;
    return <button key={elementId} type="button" className="domain-rail-card" style={tint(elementId)} data-open={open} aria-expanded={open} aria-pressed={open} aria-controls={`${id}-${elementId}`} aria-label={`${ELEMENTS[elementId].name}, ${counts[elementId]} áreas. ${open ? 'Mostrar todos os elementos' : 'Explorar elemento'}`} onClick={() => onSelect(open ? null : elementId)}>
      <span className="domain-rail-art" aria-hidden="true"><DomainArt element={elementId} /></span>
      <span className="domain-rail-name"><ElementIcon element={elementId} size={22} /><strong>{ELEMENTS[elementId].name}</strong></span>
      <span id={`${id}-${elementId}`} className="domain-rail-caption" hidden={!open}><span>{ELEMENTS[elementId].domain}</span><small>{counts[elementId]} áreas</small></span>
    </button>;
  })}</div>;
}

export function DomainAreaCard({ area, score, taskCount, active, onToggle, returnSearch = '' }: { returnSearch?: string; area: Area; score: number; taskCount: number; active: boolean; onToggle: (id: string) => void }) {
  return <article className="domain-area" style={tint(area.elementId)}>
    <Link className="domain-area-link" to={`/dominios/${area.id}`} state={{ domainsReturnSearch: returnSearch }}>
      <span className="domain-area-rune"><ElementIcon element={area.elementId} size={28} /></span>
      <span><h3>{area.name}</h3><small>{ELEMENTS[area.elementId].name}{area.isCustom ? ' · Personalizada' : ''}</small></span><ArrowUpRight size={19} aria-hidden="true" />
    </Link>
    <dl><div><dt>Pontos</dt><dd>{format(score)}</dd></div><div><dt>Rituais</dt><dd>{taskCount}</dd></div></dl>
    <div className="domain-area-actions"><span>{active ? 'Vinculada' : 'Desvinculada'}</span><button type="button" onClick={() => onToggle(area.id)} aria-label={`${active ? 'Desvincular' : 'Vincular'} ${area.name}`}>{active ? 'Desvincular' : 'Vincular área'}</button></div>
  </article>;
}

export function DomainShowcase({ area, taskCount, habitCount, subareaCount }: { area: Area; taskCount: number; habitCount: number; subareaCount: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <section className="domain-showcase" style={tint(area.elementId)} aria-label={`Resumo de ${area.name}`}>
    <div className="domain-showcase-cover"><span className="domain-showcase-orbit" aria-hidden="true" /><span className="domain-showcase-art" aria-hidden="true"><DomainArt element={area.elementId} /></span>
      <div className="domain-showcase-title"><p><ElementIcon element={area.elementId} size={20} />{ELEMENTS[area.elementId].name}{area.isCustom ? ' · Área personalizada' : ''}</p><h1>{area.name}</h1></div>
    </div>
    <button type="button" className="domain-showcase-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{open ? 'Recolher resumo' : 'Conhecer esta área'}<ChevronDown size={20} aria-hidden="true" /></button>
    <div id={id} className="domain-reveal" data-open={open} inert={!open} aria-hidden={!open}><div><div className="domain-showcase-detail">
      <p>{area.description || `Um espaço de ${ELEMENTS[area.elementId].name} para organizar suas atividades e subáreas.`}</p>
      <dl><div><dt>Rituais na área</dt><dd>{taskCount}</dd></div><div><dt>Ciclos na área</dt><dd>{habitCount}</dd></div><div><dt>Subáreas</dt><dd>{subareaCount}</dd></div></dl>
    </div></div></div>
  </section>;
}

export function DomainElementPicker({ value, onChange }: { value: ElementId; onChange: (id: ElementId) => void }) {
  const id = useId();
  return <fieldset className="domain-element-picker"><legend>Elemento da área</legend><div>{DOMAIN_ELEMENTS.map(elementId => <label key={elementId} style={tint(elementId)}><input type="radio" name={`domain-element-${id}`} value={elementId} checked={value === elementId} onChange={() => onChange(elementId)} /><span><ElementIcon element={elementId} size={24} /><strong>{ELEMENTS[elementId].name}</strong><Check size={17} aria-hidden="true" /></span></label>)}</div><p>{ELEMENTS[value].description}</p></fieldset>;
}

export function DomainEmpty({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="domain-empty"><ArcaneIcon name="dominios" size={36} /><h3>{title}</h3>{children}</div>;
}
