import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { LevelingCalculatorService, type LevelProgress } from '@/services/leveling-calculator';
import { taskRewardEvents, reconcileTaskRewards, type TaskRewardEvent } from './task-reward-events';
import { RewardNotice } from './RewardNotice';

type Receipt = { events: TaskRewardEvent[]; fromLevel: number; progress: LevelProgress };

/** Mounted only in the list: the QuestHub owns its modal receipt independently. */
export function TaskCompletionFeedback() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [dismissVersion, setDismissVersion] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let hydrating = false;
    let pending: TaskRewardEvent[] = [];
    let fromLevel = 1;
    const clear = () => { clearTimeout(timeout); pending = []; setReceipt(null); };
    const stopHydration = useAppStore.persist?.onHydrate(() => { hydrating = true; clear(); });
    const stopFinish = useAppStore.persist?.onFinishHydration(() => { hydrating = false; });
    const unsubscribe = useAppStore.subscribe((next, previous) => {
      if (next.currentAccountId !== previous.currentAccountId) { clear(); return; }
      if (hydrating || next.tasks === previous.tasks) return;
      const incoming = taskRewardEvents(previous.tasks, next.tasks);
      const updated = reconcileTaskRewards(pending, incoming, next.tasks);
      if (!incoming.length && updated.length === pending.length) return;
      if (!pending.length && incoming.length) fromLevel = LevelingCalculatorService.calculateAvatar(previous.user).level;
      pending = updated;
      setReceipt(updated.length ? { events: updated, fromLevel, progress: LevelingCalculatorService.calculateAvatar(next.user) } : null);
      if (incoming.length || !updated.length) clearTimeout(timeout);
      if (incoming.length) timeout = setTimeout(clear, 5000);
    });
    return () => { clearTimeout(timeout); unsubscribe(); stopHydration?.(); stopFinish?.(); };
  }, [dismissVersion]);
  return <div role="status" aria-live="polite" aria-atomic="true" className="elemental-reward-region">
    {receipt && <RewardNotice title={receipt.events.length > 1 ? `${receipt.events.length} etapas registradas` : 'Ritual registrado'} name={receipt.events.at(-1)?.name}
      xp={receipt.events.reduce((sum,e) => sum + e.xp,0)} elements={receipt.events.map(e => ({ element: e.element, amount: e.xp }))}
      progress={receipt.progress} fromLevel={receipt.fromLevel}
      onDismiss={() => { setReceipt(null); setDismissVersion(v => v + 1); }} />}
  </div>;
}
