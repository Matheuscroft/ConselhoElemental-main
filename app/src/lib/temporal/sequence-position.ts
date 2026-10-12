import type { CycleSequence } from '@/types';
import { toDayStamp } from './date';

export function getSequencePositionForDate(sequence: CycleSequence, totalMembers: number, date: Date | string | number): number {
  if (totalMembers <= 0) return 0;
  const base = ((sequence.currentPosition % totalMembers) + totalMembers) % totalMembers;
  const completed = toDayStamp(sequence.lastCompletedDate);
  const target = toDayStamp(date);
  const cursor = toDayStamp(sequence.cursorDate);
  if (cursor != null && target != null && target >= cursor && (completed == null || cursor > completed)) return base;
  return completed != null && target != null && target > completed ? (base + 1) % totalMembers : base;
}
