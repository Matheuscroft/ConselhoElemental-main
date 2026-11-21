import { useEffect, useState, type CSSProperties } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ExperienceIcon } from './ExperienceIcon';
import { ACENTO, AURA } from '@/lib/design/palette';
import './recibo-uau.css';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';
import type { LevelProgress } from '@/services/leveling-calculator';

export interface ElementReward { element: ElementId; amount: number }
const names = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' };
const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7] as const;
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** Pure receipt: never infers XP from points, time or progress, and never writes rewards. */
export function RewardSummary({ xp, elements = [], progress, fromLevel, animate = false }: {
  xp: number | null; elements?: readonly ElementReward[]; progress?: LevelProgress; fromLevel?: number; animate?: boolean;
}) {
  const reduced = useMotionPreference();
  const amount = typeof xp === 'number' && Number.isFinite(xp) ? xp : null;
  const levelUp = amount !== null && amount > 0 && progress && Number.isInteger(fromLevel) && fromLevel! > 0 && Number.isInteger(progress.level) && progress.level > fromLevel!;
  const validProgress = progress && Number.isFinite(progress.xpToNextLevel) && progress.xpToNextLevel > 0 && Number.isFinite(progress.xpTotal) && Number.isFinite(progress.xpAtLevelStart);
  const levelXp = validProgress ? Math.max(0, Math.min(progress.xpToNextLevel, progress.xpTotal - progress.xpAtLevelStart)) : 0;
  // The figure is seen counting: it starts at zero and moves on the next frame. The exact value stays in the text for assistive tech.
  const counts = animate && !reduced && amount !== null && amount !== 0;
  const [target, setTarget] = useState(0);
  useEffect(() => {
    if (!counts) return;
    const frame = requestAnimationFrame(() => setTarget(Math.abs(amount as number)));
    return () => cancelAnimationFrame(frame);
  }, [counts, amount]);
  // The receipt takes the colour of the element that earned the most; with none it stays gold.
  const dominante = (Object.keys(names) as ElementId[])
    .map((element) => ({ element, total: elements.filter((e) => e.element === element && Number.isFinite(e.amount)).reduce((soma, e) => soma + Math.max(0, e.amount), 0) }))
    .sort((a, b) => b.total - a.total)[0];
  const cor = amount !== null && amount > 0 && dominante && dominante.total > 0 ? dominante.element : null;
  const estilo = cor ? ({ '--rec-cor': ACENTO[cor], '--rec-aura': AURA[cor] } as CSSProperties) : undefined;
  // Where the XP just earned sits on the bar, so it can glow there.
  const ganhoIni = validProgress && amount !== null && amount > 0 ? Math.max(0, levelXp - amount) / progress.xpToNextLevel : 0;
  const ganhoLarg = validProgress && amount !== null && amount > 0 ? (levelXp / progress.xpToNextLevel) - ganhoIni : 0;
  const exact = amount === null ? 'XP indisponível' : amount === 0 ? 'Conclusão registrada' : `${amount > 0 ? '+' : '−'}${format(Math.abs(amount))} XP`;
  return <div style={estilo} className={`elemental-reward-summary${animate ? ' is-fresh' : ''}${levelUp ? ' is-level-up' : ''}${amount !== null && amount < 0 ? ' is-reversal' : ''}`}>
    <div className="elemental-reward-value"><span className="elemental-reward-sigil" aria-hidden="true">
        {animate ? <><svg className="elemental-reward-anel" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" pathLength="1" /></svg>{SPARKS.map((k) => <i key={k} style={{ '--k': k } as CSSProperties} />)}</> : null}
        {levelUp ? <ArcaneIcon name="conquista" size={28}/> : <ExperienceIcon size={32}/>}</span>
      <div><span className="elemental-reward-label">{amount !== null && amount < 0 ? 'Ajuste registrado' : 'XP registrado'}</span>
        {counts ? <strong><span className="sr-only">{exact}</span><span aria-hidden="true">{amount! > 0 ? '+' : '−'}<Contagem valor={target} beat="conjure" formatar={format} /> XP</span></strong> : <strong>{exact}</strong>}
        {amount === 0 && <small>Sem XP adicional</small>}
      </div>
    </div>
    {amount !== null && amount !== 0 && <div className="elemental-reward-elements">{(Object.keys(names) as ElementId[]).map((element, index) => {
      const earned = elements.filter(e => e.element === element && Number.isFinite(e.amount)).reduce((sum,e) => sum + e.amount,0);
      return earned !== 0 ? <span key={element} data-element={element} style={{ '--i': index } as CSSProperties}><ElementIcon element={element} size={22} />{names[element]} {earned > 0 ? '+' : '−'}{format(Math.abs(earned))}</span> : null;
    })}</div>}
    {levelUp && <div className="elemental-reward-level"><i className="elemental-reward-raios" aria-hidden="true" /><span>Você avançou de nível</span><strong>Você chegou ao nível {progress.level}!</strong></div>}
    {validProgress && <div className="elemental-reward-progress"><div><span>Nível {progress.level}</span><span>{format(levelXp)} / {format(progress.xpToNextLevel)} XP</span></div>
      <div className="elemental-reward-track" role="progressbar" aria-label="Experiência para o próximo nível" aria-valuemin={0} aria-valuemax={progress.xpToNextLevel} aria-valuenow={levelXp}>
        <span style={{ transform: `scaleX(${levelXp / progress.xpToNextLevel})` }} />
        {ganhoLarg > 0.002 ? <i className="elemental-reward-ganho" style={{ '--ini': ganhoIni, '--larg': ganhoLarg } as CSSProperties} aria-hidden="true" /> : null}
      </div>
    </div>}
  </div>;
}
