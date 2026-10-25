import { useId, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChevronDown, Settings2 } from 'lucide-react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS } from '@/constants';
import type { Area, ElementId } from '@/types';
import { DOMAIN_ELEMENTS } from './DomainPresentation';

interface Props {
  areas: Area[];
  scores: { areaId: string; score: number; taskCount: number }[];
  activeAreas: Set<string>;
  selectedElement: ElementId | null;
  expanded?: ElementId | null;
  searching: boolean;
  returnSearch: string;
  onExpand: (element: ElementId | null) => void;
  onToggle: (areaId: string) => void;
}
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** Compact discovery; linking is an explicit management mode using existing commands. */
export function DomainCatalogue({ areas, scores, activeAreas, selectedElement, expanded, searching, returnSearch, onExpand, onToggle }: Props) {
  const instance = useId();
  const [managing, setManaging] = useState(false);
  const manageRef = useRef<HTMLButtonElement>(null);
  const revealResults = searching || !!selectedElement;
  const groups = DOMAIN_ELEMENTS.map(element => ({ element, areas: areas.filter(area => area.elementId === element) })).filter(group => group.areas.length);
  const scoreById = new Map(scores.map(score => [score.areaId, score]));

  return <div className="domain-catalogue">
    <div className="domain-catalogue-tools"><p>{managing ? 'Vincule ou desvincule áreas da sua rotina.' : !areas.length ? 'Nenhuma área corresponde aos filtros atuais.' : revealResults ? 'Toque em uma área para abrir.' : 'Abra um grupo e escolha a área que procura.'}</p><button ref={manageRef} type="button" aria-pressed={managing} onClick={() => setManaging(!managing)}>{managing ? <Check size={17} aria-hidden="true" /> : <Settings2 size={17} aria-hidden="true" />}{managing ? 'Concluir organização' : 'Gerenciar vínculos'}</button></div>
    <div className="domain-catalogue-groups">{groups.map(group => {
      const open = revealResults || expanded === group.element;
      const panelId = `${instance}-${group.element}`;
      const title = <><ElementIcon element={group.element} size={25} /><span><strong>{ELEMENTS[group.element].name}</strong><small>{group.areas.length} {group.areas.length === 1 ? 'área' : 'áreas'}{!open && ` · ${group.areas.slice(0, 3).map(area => area.name).join(', ')}`}</small></span></>;
      return <section key={group.element} className="domain-catalogue-group" data-open={open} style={{ '--catalogue-accent': `var(--element-${group.element})` } as CSSProperties}>
        {revealResults ? <h3 className="domain-catalogue-heading">{title}</h3> : <h3><button type="button" className="domain-catalogue-heading" aria-expanded={open} aria-controls={panelId} onClick={() => onExpand(open ? null : group.element)}>{title}<ChevronDown size={19} aria-hidden="true" /></button></h3>}
        <div id={panelId} hidden={!open} className="domain-catalogue-content"><ul>{group.areas.map(area => {
          const score = scoreById.get(area.id);
          const active = activeAreas.has(area.id);
          return <li key={area.id} className="domain-catalogue-row">
            <Link to={`/dominios/${area.id}`} state={{ domainsReturnSearch: returnSearch }} className="domain-catalogue-link" aria-label={`Abrir ${area.name}`}><span><strong>{area.name}</strong><small>{format(score?.score || 0)} pts · {score?.taskCount || 0} rituais{area.isCustom ? ' · Personalizada' : ''}</small></span><ArrowUpRight size={18} aria-hidden="true" /></Link>
            {managing && <button type="button" className="domain-catalogue-toggle" aria-label={`${active ? 'Desvincular' : 'Vincular'} ${area.name}`} onClick={() => { onToggle(area.id); manageRef.current?.focus({ preventScroll: true }); }}>{active ? 'Desvincular' : 'Vincular'}</button>}
          </li>;
        })}</ul></div>
      </section>;
    })}</div>
  </div>;
}
