import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { version } from '../../../package.json';
import { BACKUP_FORMAT, STORE_KEYS, type ProgressSnapshot } from './progress-backup';

/** Read persist's own projections. Never enumerate localStorage or include auth/session state. */
export function captureProgress(origin: string): ProgressSnapshot {
  if (!useAppStore.persist.hasHydrated() || !useWorkoutStore.persist.hasHydrated()) {
    throw new Error('Aguarde o carregamento do progresso antes de fazer a cópia.');
  }
  const core = useAppStore.persist.getOptions();
  const fitness = useWorkoutStore.persist.getOptions();
  if (!core.partialize || !fitness.partialize || core.name !== STORE_KEYS.core || fitness.name !== STORE_KEYS.fitness) {
    throw new Error('A configuração de armazenamento mudou. A exportação precisa de revisão.');
  }
  return {
    format: BACKUP_FORMAT, schemaVersion: 1, appVersion: version, createdAt: new Date().toISOString(),
    source: { origin, accountId: useAppStore.getState().currentAccountId },
    stores: {
      core: { key: core.name, version: core.version ?? 0, state: core.partialize(useAppStore.getState()) },
      fitness: { key: fitness.name, version: fitness.version ?? 0, state: fitness.partialize(useWorkoutStore.getState()) },
    },
  };
}
