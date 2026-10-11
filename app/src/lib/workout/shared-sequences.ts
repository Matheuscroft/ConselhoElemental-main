import { useAppStore } from '@/stores/appStore';
import type { CycleSequence } from '@/types';
import type { WorkoutSequence, UUIDv4 } from '@/types/workout';

/** Compatibility DTO for existing Fitness forms; Core is the only authority. */
export function asWorkoutSequence(sequence: CycleSequence): WorkoutSequence {
  return { id: sequence.id as UUIDv4, name: sequence.name, description: sequence.description,
    templateIds: (sequence.templateIds ?? []) as UUIDv4[],
    createdAt: new Date(sequence.createdAt).toISOString(), updatedAt: new Date(sequence.updatedAt).toISOString() };
}

export function saveSharedWorkoutSequence(input: WorkoutSequence): WorkoutSequence {
  const core = useAppStore.getState();
  const existing = core.cycleSequences.find((sequence) => sequence.id === input.id);
  if (existing && existing.status !== 'PLANNING' && existing.isActive) {
    throw new Error('Desative a sequência antes de alterar sua composição.');
  }
  if (existing && core.sequenceMemberships.some((member) => member.sequenceId === existing.id) &&
    JSON.stringify(existing.templateIds) !== JSON.stringify(input.templateIds)) {
    throw new Error('Esta sequência possui histórico de ativação. Preserve sua composição ou crie uma nova sequência.');
  }
  const sequence: CycleSequence = { ...(existing ?? {}), id: input.id, name: input.name,
    description: input.description, templateIds: [...input.templateIds], memberRestriction: 'WORKOUT',
    sourceModule: 'modulo_treino', sourceRefId: input.id, status: existing?.status ?? 'PLANNING',
    isActive: false, displayOrder: existing?.displayOrder ?? core.cycleSequences.length + 1,
    recurrenceType: existing?.recurrenceType ?? 'WEEKLY', recurrenceConfig: existing?.recurrenceConfig ?? {},
    currentPosition: existing?.currentPosition ?? 0, lastCompletedDate: existing?.lastCompletedDate ?? null,
    createdAt: existing?.createdAt ?? new Date(input.createdAt), updatedAt: new Date() };
  useAppStore.setState((state) => ({ cycleSequences: [...state.cycleSequences.filter((item) => item.id !== sequence.id), sequence] }));
  return asWorkoutSequence(sequence);
}

export function deactivateWorkoutSequence(id: string): void {
  useAppStore.setState((state) => ({ cycleSequences: state.cycleSequences.map((sequence) =>
    sequence.id === id && sequence.memberRestriction === 'WORKOUT'
      ? { ...sequence, status: 'PLANNING' as const, isActive: false, updatedAt: new Date() } : sequence) }));
  // Bound habits remain owned: they do not become independent daily occurrences.
}

/** Additive import: preserve IDs of rotations already executed, and their memberships/history. */
export function importLegacyWorkoutSequences(legacy: WorkoutSequence[]): void {
  useAppStore.setState((state) => {
    const sequences = [...state.cycleSequences];
    for (const blueprint of legacy) {
      const index = sequences.findIndex((item) => item.id === blueprint.id ||
        (item.sourceModule === 'modulo_treino' && item.sourceRefId === blueprint.id));
      if (index >= 0) {
        if (!sequences[index].templateIds) sequences[index] = { ...sequences[index],
          templateIds: [...blueprint.templateIds], memberRestriction: 'WORKOUT',
          status: sequences[index].isActive ? 'ACTIVE' : 'PAUSED' };
      } else sequences.push({ id: blueprint.id, name: blueprint.name, description: blueprint.description,
        templateIds: [...blueprint.templateIds], memberRestriction: 'WORKOUT', status: 'PLANNING',
        sourceModule: 'modulo_treino', sourceRefId: blueprint.id, isActive: false,
        displayOrder: sequences.length + 1, recurrenceType: 'WEEKLY', recurrenceConfig: {},
        currentPosition: 0, lastCompletedDate: null, createdAt: new Date(blueprint.createdAt), updatedAt: new Date(blueprint.updatedAt) });
    }
    return { cycleSequences: sequences };
  });
}
