import { X } from 'lucide-react';
import { useRef, type ComponentProps, type CSSProperties, type KeyboardEvent, type TouchEvent } from 'react';
import { CycleSigil } from '@/components/cycles/CycleSigil';
import { ExperienceIcon } from './ExperienceIcon';
import { RewardSummary } from './RewardSummary';
import './recompensa-uau.css';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;
/** A downward drag longer than this closes the notice, like a toast being swiped away. */
const DESLIZE_PARA_FECHAR = 36;

/** Presentation only: the receipt, its lifetime and its dismissal all belong to the callers. */
export function RewardNotice({ title, name, onDismiss, ...reward }: ComponentProps<typeof RewardSummary> & {
  title: string; name?: string; onDismiss: () => void;
}) {
  const inicio = useRef<number | null>(null);
  // The seal wears the colour of the last element that was paid; a reversal or an unpaid receipt keeps the neutral gold.
  const paid = reward.elements?.filter(e => Number.isFinite(e.amount) && e.amount > 0).at(-1)?.element;
  const celebrates = typeof reward.xp === 'number' && reward.xp > 0;
  const aoTocar = (e: TouchEvent) => { inicio.current = e.touches[0]?.clientY ?? null; };
  const aoSoltar = (e: TouchEvent) => {
    const y = e.changedTouches[0]?.clientY;
    if (inicio.current !== null && y !== undefined && y - inicio.current > DESLIZE_PARA_FECHAR) onDismiss();
    inicio.current = null;
  };
  const aoTeclar = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
  return <div className="elemental-reward-notice ds-glass-float" data-element={paid} data-celebra={celebrates || undefined} onTouchStart={aoTocar} onTouchEnd={aoSoltar} onKeyDown={aoTeclar}>
    <div className="elemental-reward-heading">
      <span className="rec-selo" aria-hidden="true">
        <svg className="rec-anel" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" pathLength="1" /></svg>
        {celebrates && FAISCAS.map(i => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
        {paid ? <CycleSigil element={paid} size="card" filled /> : <ExperienceIcon size={26} />}
      </span>
      <div><strong>{title}</strong>{name && <small>{name}</small>}</div>
      <button type="button" onClick={onDismiss} aria-label="Fechar recompensa"><X size={20} /></button>
    </div>
    <RewardSummary {...reward} animate />
    <span key={String(reward.xp)} className="rec-tempo" aria-hidden="true" />
  </div>;
}
