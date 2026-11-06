import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';
import type { LevelProgress } from '@/services/leveling-calculator';

export interface ElementReward { element: ElementId; amount: number }
const names = { terra: 'Terra', fogo: 'Fogo', agua: 'Água', ar: 'Ar' };
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** Pure receipt: never infers XP from points, time or progress, and never writes rewards. */
export function RewardSummary({ xp, elements = [], progress, fromLevel, animate = false }: {
  xp: number | null; elements?: readonly ElementReward[]; progress?: LevelProgress; fromLevel?: number; animate?: boolean;
}) {
  const amount = typeof xp === 'number' && Number.isFinite(xp) ? xp : null;
  const levelUp = amount !== null && amount > 0 && progress && Number.isInteger(fromLevel) && fromLevel! > 0 && Number.isInteger(progress.level) && progress.level > fromLevel!;
  const validProgress = progress && Number.isFinite(progress.xpToNextLevel) && progress.xpToNextLevel > 0 && Number.isFinite(progress.xpTotal) && Number.isFinite(progress.xpAtLevelStart);
  const levelXp = validProgress ? Math.max(0, Math.min(progress.xpToNextLevel, progress.xpTotal - progress.xpAtLevelStart)) : 0;
  return <div className={`elemental-reward-summary${animate ? ' is-fresh' : ''}${levelUp ? ' is-level-up' : ''}${amount !== null && amount < 0 ? ' is-reversal' : ''}`}>
    <div className="elemental-reward-value"><span className="elemental-reward-sigil" aria-hidden="true"><ArcaneIcon name={levelUp ? 'conquista' : 'grimorio'} size={28} /></span>
      <div><span className="elemental-reward-label">{amount !== null && amount < 0 ? 'Ajuste registrado' : 'XP registrado'}</span>
        <strong>{amount === null ? 'XP indisponível' : amount === 0 ? 'Conclusão registrada' : `${amount > 0 ? '+' : '−'}${format(Math.abs(amount))} XP`}</strong>
        {amount === 0 && <small>Sem XP adicional</small>}
      </div>
    </div>
    {amount !== null && amount !== 0 && <div className="elemental-reward-elements">{(Object.keys(names) as ElementId[]).map(element => {
      const earned = elements.filter(e => e.element === element && Number.isFinite(e.amount)).reduce((sum,e) => sum + e.amount,0);
      return earned !== 0 ? <span key={element} data-element={element}><ElementIcon element={element} />{names[element]} {earned > 0 ? '+' : '−'}{format(Math.abs(earned))}</span> : null;
    })}</div>}
    {levelUp && <div className="elemental-reward-level"><span>Você avançou de nível</span><strong>Você chegou ao nível {progress.level}!</strong></div>}
    {validProgress && <div className="elemental-reward-progress"><div><span>Nível {progress.level}</span><span>{format(levelXp)} / {format(progress.xpToNextLevel)} XP</span></div>
      <div className="elemental-reward-track" role="progressbar" aria-label="Experiência para o próximo nível" aria-valuemin={0} aria-valuemax={progress.xpToNextLevel} aria-valuenow={levelXp}>
        <span style={{ transform: `scaleX(${levelXp / progress.xpToNextLevel})` }} />
      </div>
    </div>}
  </div>;
}
