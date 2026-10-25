import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Area } from '@/types';
import { ELEMENTS } from '@/constants';
import { DOMAIN_ELEMENTS } from './DomainPresentation';
import { focusDomainSection } from './navigation';

export function DomainSectionJump({ target, children }: { target: string; children: React.ReactNode }) {
  return <button type="button" className="domain-section-jump" onClick={() => focusDomainSection(target)}>{children}<ArrowDown size={16} aria-hidden="true" /></button>;
}

export function DomainAreaNavigator({ areas, current, returnSearch, onSelect }: { areas: Area[]; current: Area; returnSearch: string; onSelect: (id: string) => void }) {
  const siblings = areas.filter(area => area.elementId === current.elementId);
  const index = siblings.findIndex(area => area.id === current.id);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  return <nav className="domain-area-navigator" aria-label="Navegar entre áreas">
    <label htmlFor="domain-area-switch">Ir para outra área</label>
    <select id="domain-area-switch" value={current.id} onChange={event => onSelect(event.target.value)}>{DOMAIN_ELEMENTS.map(element => <optgroup label={ELEMENTS[element].name} key={element}>{areas.filter(area => area.elementId === element).map(area => <option key={area.id} value={area.id}>{area.name}</option>)}</optgroup>)}</select>
    <div className="domain-neighbors">
      {previous ? <Link to={`/dominios/${previous.id}`} state={{ domainsReturnSearch: returnSearch }} aria-label={`Área anterior: ${previous.name}`}><ArrowLeft size={17} aria-hidden="true" /><span>{previous.name}</span></Link> : <span />}
      <small>{index + 1} de {siblings.length} em {ELEMENTS[current.elementId].name}</small>
      {next ? <Link to={`/dominios/${next.id}`} state={{ domainsReturnSearch: returnSearch }} aria-label={`Próxima área: ${next.name}`}><span>{next.name}</span><ArrowRight size={17} aria-hidden="true" /></Link> : <span />}
    </div>
  </nav>;
}
