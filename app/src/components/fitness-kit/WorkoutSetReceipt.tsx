import { useEffect, useRef } from 'react';
import { Check, SkipForward } from 'lucide-react';
import type { PerformedSet } from '@/types/workout';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { isNewSetCompletion } from './set-receipt';

/** Reads a motion token from the stylesheet, so the seal keeps the app's own beats instead of numbers typed here. */
const token = (element: Element, name: string) => getComputedStyle(element).getPropertyValue(name).trim();

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
    // The seal settles with the short spring of the app (the "conjure" curve), with no delay.
    // Guarded: the receipt's own animation is the one that matters if the browser cannot find the seal.
    const seal = receipt.current.querySelector?.('.fitness-set-receipt-seal') ?? null;
    const sealAnimation = seal?.animate?.(
      [{ transform: 'scale(.5)', opacity: 0.4 }, { transform: 'scale(1.14)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: Number.parseFloat(token(seal, '--ds-duration-settle')) || undefined, easing: token(seal, '--ds-ease-conjure') || 'ease-out' },
    );
    return () => { animation.cancel(); sealAnimation?.cancel(); };
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
    {done && <div ref={receipt} className="fitness-set-receipt treino-recibo" data-skipped={Boolean(skipped)}>
      <span className="fitness-set-receipt-seal" aria-hidden="true">
        {skipped ? <SkipForward size={22} /> : <Check size={24} strokeWidth={2.75} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="treino-recibo-titulo">{activity ? 'Bloco' : 'Série'} {set.setNumber} · {skipped ? 'Pulado' : 'Registrado'}</p>
        {skipped
          ? <p className="treino-recibo-nota">Sem registro de execução.</p>
          : metrics.length
            ? <ul className="treino-recibo-metricas">{metrics.map((metric) => <li key={String(metric)}>{metric}</li>)}</ul>
            : <p className="treino-recibo-nota">Execução concluída.</p>}
      </div>
    </div>}
  </div>;
}
