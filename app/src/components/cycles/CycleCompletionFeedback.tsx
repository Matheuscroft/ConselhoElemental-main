import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { LevelingCalculatorService, type LevelProgress } from '@/services/leveling-calculator';
import { cycleCompletionEvents, reconcileCompletionBurst, type CycleCompletionEvent } from './completion-event';
import { CycleRewardNotice } from './CycleRewardNotice';

type Receipt = { events: CycleCompletionEvent[]; fromLevel: number; progress: LevelProgress };

/** Listens to saved receipts, including XP credited atomically with the completion. */
export function CycleCompletionFeedback({ date }: { date: Date }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [dismissVersion, setDismissVersion] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let hydrating = false;
    let pending: CycleCompletionEvent[] = [];
    let fromLevel = 1;
    const clear = () => { clearTimeout(timeout); pending = []; setReceipt(null); };
    const stopHydration = useAppStore.persist?.onHydrate(() => { hydrating = true; clear(); });
    const stopFinish = useAppStore.persist?.onFinishHydration(() => { hydrating = false; });
    const unsubscribe = useAppStore.subscribe((next, previous) => {
      if (next.currentAccountId !== previous.currentAccountId) { clear(); return; }
      if (hydrating || next.habits === previous.habits) return;
      const incoming = cycleCompletionEvents(previous.habits, next.habits, date);
      const updated = reconcileCompletionBurst(pending, incoming, next.habits, date);
      if (!incoming.length && updated.length === pending.length) return;
      if (!pending.length && incoming.length) fromLevel = LevelingCalculatorService.calculateAvatar(previous.user).level;
      pending = updated;
      setReceipt(updated.length ? { events: updated, fromLevel, progress: LevelingCalculatorService.calculateAvatar(next.user) } : null);
      if (incoming.length || !updated.length) clearTimeout(timeout);
      if (incoming.length) timeout = setTimeout(clear, 5000);
    });
    return () => { clearTimeout(timeout); unsubscribe(); stopHydration?.(); stopFinish?.(); };
  }, [date, dismissVersion]);
  return <div role="status" aria-live="polite" aria-atomic="true" className="cycle-completion-region">
    {receipt && <CycleRewardNotice {...receipt} onDismiss={() => { setReceipt(null); setDismissVersion(value => value + 1); }} />}
  </div>;
}
