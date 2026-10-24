import type { CSSProperties, ReactNode } from 'react';
import { Check, ChevronDown, CircleHelp } from 'lucide-react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { QuestRune } from './QuestRune';
import type { QuestStep, QuestTrail } from './quest-path';

const OFFSETS = [0, 1, 0, -1];
export function QuestTrailMap({ trail, selectedKey, onSelect, detail }: {
  trail: QuestTrail; selectedKey?: string; onSelect: (key: string) => void; detail: (step: QuestStep) => ReactNode;
}) {
  return <div className="quest-map" data-element={trail.element}>
    <ol className="quest-path" aria-label={`Etapas de ${trail.title}`}>
      {trail.steps.map((step, index) => {
        const selected = selectedKey === step.key;
        const next = trail.next?.key === step.key;
        const detailId = `quest-detail-${encodeURIComponent(trail.key)}-${index}`;
        const offset = OFFSETS[index % OFFSETS.length];
        const delta = OFFSETS[(index + 1) % OFFSETS.length] - offset;
        return <li key={step.key} style={{ '--step-offset': offset, '--step-direction': delta } as CSSProperties} data-complete={step.available && step.completed} data-next={next} data-available={step.available} data-selected={selected}>
          {index < trail.steps.length - 1 && <svg className="quest-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 C0 50 100 50 100 100" /></svg>}
          <button type="button" className="quest-step" onClick={() => onSelect(step.key)} aria-expanded={selected} aria-controls={selected ? detailId : undefined} aria-current={next ? 'step' : undefined}>
            <span className="quest-step-stone" aria-hidden="true"><span className="quest-step-face">{!step.available ? <CircleHelp size={27} /> : step.completed ? <Check size={27} /> : step.kind === 'habit' ? <ArcaneIcon name="ciclo" size={27} /> : <QuestRune element={trail.element} size={46} />}</span></span>
            <span className="quest-step-label"><small>{step.chapter ? `${step.chapter} · ` : ''}Etapa {index + 1}</small><strong>{step.title}</strong><span>{!step.available ? 'Indisponível' : step.completed ? 'Concluído' : step.kind === 'habit' ? 'Ciclo recorrente' : next ? 'Próxima etapa' : 'Disponível'}</span></span>
            <ChevronDown className="quest-step-chevron" size={17} aria-hidden="true" />
          </button>
          {selected && <div id={detailId} className="quest-step-detail">{detail(step)}</div>}
        </li>;
      })}
    </ol>
    {trail.steps.length > 0 && <div className="quest-finish-line"><span><ArcaneIcon name="conquista" size={26} /></span><div><strong>{trail.total > 0 && trail.done === trail.total ? 'Rituais da trilha concluídos' : 'Sua conquista, passo a passo'}</strong><p>{trail.reward || 'Cada etapa faz parte da sua jornada.'}</p></div><ElementIcon element={trail.element} size={23} /></div>}
  </div>;
}
