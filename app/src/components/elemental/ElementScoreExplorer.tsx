import { useId, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { ElementIcon } from './ArcaneIcon';
import { ELEMENTS } from '@/constants';
import type { Area, ElementId } from '@/types';

type ScoredArea = Area & { mergedSubareas: Area[] };
interface Props {
  scores: { elementId: ElementId; score: number }[];
  areas: ScoredArea[];
  areaScores: Map<string, number>;
  subareaScores: Map<string, number>;
  selectedElement: ElementId | null;
  selectedAreaId: string | null;
  onSelectElement: (id: ElementId) => void;
  onSelectArea: (id: string) => void;
}
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** Presentation only: values and selection come from the existing hierarchy panel. */
export function ElementScoreExplorer({ scores, areas, areaScores, subareaScores, selectedElement, selectedAreaId, onSelectElement, onSelectArea }: Props) {
  const id = useId();
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  const maxScore = Math.max(1, ...scores.map(item => item.score));
  return <section className="element-score-explorer" aria-labelledby={`${id}-title`}>
    <header className="element-score-heading"><div><h3 id={`${id}-title`}>Sua energia em cada elemento</h3><p>Pontos acumulados de rituais e ciclos, além do dia selecionado.</p></div><p className="element-score-total"><strong>{format(total)}</strong><span>pontos no total</span></p></header>
    <p className="element-score-hint">Abra um elemento para ver áreas e subáreas. As barras comparam os elementos entre si; não são metas.</p>
    <div className="element-score-cards">{scores.map(({ elementId, score }) => {
      const element = ELEMENTS[elementId];
      const open = selectedElement === elementId;
      const elementAreas = areas.filter(area => area.elementId === elementId);
      return <article key={elementId} className="element-score-card" data-open={open} style={{ '--discovery-accent': `var(--element-${elementId})` } as CSSProperties}>
        <button type="button" className="element-score-trigger" aria-expanded={open} aria-controls={`${id}-${elementId}`} onClick={() => onSelectElement(elementId)}>
          <img src={`/sanctuary/elements/${elementId}-v1.webp`} alt="" width={100} height={100} loading="lazy" />
          <span className="element-score-title"><span><ElementIcon element={elementId} size={18} />{element.name}</span><strong>{format(score)} <small>pontos</small></strong><span className="element-score-bar" aria-hidden="true"><span style={{ width: `${score / maxScore * 100}%` }} /></span></span>
          <ChevronDown size={20} aria-hidden="true" />
        </button>
        <div id={`${id}-${elementId}`} className="discovery-reveal" data-open={open} inert={!open} aria-hidden={!open}><div><div className="element-score-content">
          <p className="element-score-context">{score === 0 ? 'Ainda não há pontos neste elemento. Suas atividades concluídas aparecerão aqui.' : 'Explore onde seus pontos foram registrados.'}</p>
          <h4>Áreas de {element.name}</h4>
          {elementAreas.length === 0 && <p className="element-score-context">Nenhuma área disponível neste elemento.</p>}
          <div className="element-score-areas">{elementAreas.map(area => {
            const areaOpen = open && selectedAreaId === area.id;
            const points = areaScores.get(area.id) || 0;
            return <div className="element-score-area" key={area.id}>
              <button type="button" aria-expanded={areaOpen} aria-controls={`${id}-area-${area.id}`} onClick={() => onSelectArea(area.id)}><span>{area.name}<small>{area.mergedSubareas.length} subáreas</small></span><strong>{format(points)}<small>pontos</small></strong><ChevronDown size={17} aria-hidden="true" /></button>
              <div id={`${id}-area-${area.id}`} hidden={!areaOpen} className="element-score-subareas">
                {area.mergedSubareas.length ? <dl>{area.mergedSubareas.map(subarea => <div key={subarea.id}><dt>{subarea.name}</dt><dd>{format(subareaScores.get(subarea.id) || 0)} <span>pts</span></dd></div>)}</dl> : <p>Esta área ainda não tem subáreas.</p>}
              </div>
            </div>;
          })}</div>
        </div></div></div>
      </article>;
    })}</div>
  </section>;
}
