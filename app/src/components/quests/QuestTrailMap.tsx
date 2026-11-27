import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { QuestStep, QuestTrail } from './quest-path';
import { VitroKey } from '@/components/vitro/VitroKey';
import { ACENTO } from '@/lib/design/palette';
import './quests-uau.css';

const OFFSETS = [0, 1, 0, -1];
export function QuestTrailMap({ trail, selectedKey, onSelect, detail }: {
  trail: QuestTrail; selectedKey?: string; onSelect: (key: string) => void; detail: (step: QuestStep) => ReactNode;
}) {
  const progresso = trail.total > 0 ? trail.done / trail.total : 0;
  const marcos = Math.min(trail.total, 12);
  const feitos = trail.total > 0 ? Math.round((trail.done / trail.total) * marcos) : 0;
  return <div className="quest-map" data-element={trail.element} style={{ '--passo-total': Math.min(trail.steps.length, 14) } as CSSProperties}>
    <ol className="quest-path" aria-label={`Etapas de ${trail.title}`}>
      {trail.steps.map((step, index) => {
        const selected = selectedKey === step.key;
        const next = trail.next?.key === step.key;
        const detailId = `quest-detail-${encodeURIComponent(trail.key)}-${index}`;
        const offset = OFFSETS[index % OFFSETS.length];
        const delta = OFFSETS[(index + 1) % OFFSETS.length] - offset;
        return <li key={step.key} style={{ '--step-offset': offset, '--step-direction': delta, '--passo': Math.min(index, 14), '--prog': progresso } as CSSProperties} data-complete={step.available && step.completed} data-next={next} data-available={step.available} data-selected={selected}>
          {index < trail.steps.length - 1 && <svg className="quest-connector" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 C0 50 100 50 100 100" /></svg>}
          <button type="button" className="quest-step" onClick={() => onSelect(step.key)} aria-expanded={selected} aria-controls={selected ? detailId : undefined} aria-current={next ? 'step' : undefined}>
            <PedraDaEtapa concluida={step.available && step.completed} proxima={next} xp={step.xp ?? 0}>
              <VitroKey comoFace proporcao={1} flutuar={next} tom={ACENTO[trail.element]} estado={!step.available ? 'bloqueado' : step.completed ? 'feito' : 'normal'} rotulo={!step.available ? '!' : step.completed ? '✓' : String(index + 1)} />
            </PedraDaEtapa>
            <span className="quest-step-label"><small className="ds-meta">{step.chapter && <span>{step.chapter}</span>}<span>Etapa {index + 1}</span></small><strong>{step.title}</strong><span>{!step.available ? 'Indisponível' : step.completed ? (step.xp ? <>Concluído <b className="quest-xp-chip">+{Number.isInteger(step.xp) ? step.xp : step.xp.toFixed(1)} XP</b></> : 'Concluído') : step.kind === 'habit' ? 'Ciclo recorrente' : next ? 'Próxima etapa' : 'Disponível'}</span></span>
            <ArcaneIcon name="chevron" className="quest-step-chevron" size={17} />
          </button>
          {selected && <div id={detailId} className="quest-step-detail">{detail(step)}</div>}
        </li>;
      })}
    </ol>
    {trail.steps.length > 0 && <div className="quest-finish-line" data-completa={trail.total > 0 && trail.done === trail.total ? '' : undefined}><span><ArcaneIcon name="conquista" size={26} /></span><div><strong>{trail.total > 0 && trail.done === trail.total ? 'Rituais da trilha concluídos' : 'Sua conquista, passo a passo'}</strong><p>{trail.reward || 'Cada etapa faz parte da sua jornada.'}</p></div><ElementIcon element={trail.element} size={23} /></div>}
    {trail.total > 0 && <div className="quest-subida" data-completa={trail.done === trail.total ? '' : undefined}>
      <span className="quest-subida-rotulo">{trail.done === trail.total ? 'Trilha completa' : `Subindo · etapa ${trail.done + 1} de ${trail.total}`}</span>
      <span className="quest-subida-degraus" aria-hidden="true">{Array.from({ length: marcos }, (_, i) => <i key={i} data-feito={i < feitos} data-atual={i === feitos && trail.done < trail.total} style={{ '--i': i } as CSSProperties} />)}</span>
    </div>}
  </div>;
}

/** The stone of one step. When the step becomes done while it is on screen, it leaps and bursts sparks;
 *  mounting an already finished step celebrates nothing. Hooks live here so the map stays a plain function. */
function PedraDaEtapa({ concluida, proxima, xp = 0, children }: { concluida: boolean; proxima: boolean; xp?: number; children: ReactNode }) {
  const [antes, setAntes] = useState(concluida);
  const [acabou, setAcabou] = useState(false);
  // Adjusted while rendering (React's own pattern for state that follows a prop), not in an effect.
  if (concluida !== antes) { setAntes(concluida); if (concluida) setAcabou(true); }
  useEffect(() => {
    if (!acabou) return;
    const fim = window.setTimeout(() => setAcabou(false), 2200);
    return () => window.clearTimeout(fim);
  }, [acabou]);
  return <span className="quest-step-stone" aria-hidden="true" data-acabou={acabou ? '' : undefined}>
    {proxima && <span className="quest-step-raios" />}
    {proxima && <svg className="quest-step-anel" viewBox="0 0 100 100"><circle className="quest-step-anel-trilho" cx="50" cy="50" r="46" pathLength="1" /><circle className="quest-step-anel-fio" cx="50" cy="50" r="46" pathLength="1" /><circle className="quest-step-anel-brilho" cx="50" cy="50" r="46" pathLength="1" /></svg>}
    {proxima && <span className="quest-step-dica">Começar</span>}
    {acabou && <span className="quest-step-fagulhas">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => <i key={n} data-tom={n % 3} style={{ '--faisca': n } as CSSProperties} />)}</span>}
    {acabou && xp > 0 && <span className="quest-step-xp">+{Number.isInteger(xp) ? xp : xp.toFixed(1)} XP</span>}
    {children}
  </span>;
}
