import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkoutStore } from '@/stores/workoutStore';
import { mergeFitnessHistory } from './activity-history';

export function useFitnessHistory() {
  const legacy = useWorkoutStore(useShallow(state => state.getWorkoutHistory()));
  const native = useWorkoutStore(state => state.nativeHistory);
  return useMemo(() => mergeFitnessHistory(legacy, native), [legacy, native]);
}
