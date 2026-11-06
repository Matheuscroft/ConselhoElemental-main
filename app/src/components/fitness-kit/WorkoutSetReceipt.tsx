import { useEffect, useRef } from 'react';
import { Check, SkipForward } from 'lucide-react';
import type { PerformedSet } from '@/types/workout';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { isNewSetCompletion } from './set-receipt';

/** Stays mounted while the form is pending, so only a newly recorded set animates. */
export function WorkoutSetReceipt({ set, activity = false }: { set: PerformedSet; activity?: boolean }) {
  const reduced = useMotionPreference();
  const previous = useRef({ id: set.id, completed: set.completed, skipped: set.skipped });
  const receipt = useRef<HTMLDivElement>(null);
  const { id, completed, skipped } = set;
  useEffect(() => {
    const current = { id, completed, skipped };
    const newlyCompleted = isNewSetCompletion(previous.current, current);
    previous.current = current;
    if (!newlyCompleted || reduced || !receipt.current?.animate) return;
    const animation = receipt.current.animate(
      [{ opacity: 0.45, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 240, easing: 'cubic-bezier(.23,1,.32,1)' },
    );
    return () => animation.cancel();
  }, [id, completed, skipped, reduced]);

  const done = completed || skipped;
  const metrics = skipped ? [] : [
    set.reps > 0 && `${set.reps} repetições`,
    set.loadKg > 0 && `${set.loadKg} kg`,
    (set.durationSeconds ?? 0) > 0 && `${((set.durationSeconds ?? 0) / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`,
    (set.distanceMeters ?? 0) > 0 && `${set.distanceMeters} m`,
    set.perceivedExertion && `esforço ${set.perceivedExertion}/10`,
  ].filter(Boolean);

  return <div role="status" aria-live="polite" aria-atomic="true">
    {done && <div ref={receipt} className="fitness-set-receipt" data-skipped={Boolean(skipped)}>
      <span className="fitness-set-receipt-seal" aria-hidden="true">
        {skipped ? <SkipForward size={20} /> : <Check size={20} />}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-fitness-text">{activity ? 'Bloco' : 'Série'} {set.setNumber} · {skipped ? 'Pulado' : 'Registrado'}</p>
        <p className="mt-1 break-words text-xs text-fitness-muted">{skipped ? 'Sem registro de execução.' : metrics.length ? metrics.join(' · ') : 'Execução concluída.'}</p>
      </div>
    </div>}
  </div>;
}
