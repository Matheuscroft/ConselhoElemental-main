import type { LevelProgress } from '@/services/leveling-calculator';
import { RewardNotice } from '@/components/rewards/RewardNotice';
import type { CycleCompletionEvent } from './completion-event';

/** Existing receipt subscription owns lifetime and deduplication; presentation is shared. */
export function CycleRewardNotice({ events, fromLevel, progress, onDismiss }: {
  events: readonly CycleCompletionEvent[]; fromLevel: number; progress: LevelProgress; onDismiss: () => void;
}) {
  return <RewardNotice title="Mais um passo na sua evolução" name={events.at(-1)?.name}
    xp={events.reduce((sum,e) => sum + e.xp,0)}
    elements={events.flatMap(e => e.elementId ? [{ element: e.elementId, amount: e.xp }] : [])}
    fromLevel={fromLevel} progress={progress} onDismiss={onDismiss} />;
}
