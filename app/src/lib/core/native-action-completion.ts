import type { Action, ExecutionLog, Task } from '@/types';

export interface NativeActionCompletion {
  sessionId: string;
  coreEntityId?: string;
  title: string;
  baseValue: number;
  durationSeconds: number;
  completedAt: string;
  effortLevel?: number;
  habitId?: string;
  declaredPlannedExecution?: boolean;
  fullCompletion?: boolean;
}

const effortRules: Record<number, { multiplier: number; cap: number; pranaCost: number }> = {
  1: { multiplier: 1, cap: 10, pranaCost: 5 },
  2: { multiplier: 1.2, cap: 25, pranaCost: 10 },
  3: { multiplier: 1.5, cap: 50, pranaCost: 15 },
  4: { multiplier: 2, cap: 100, pranaCost: 25 },
  5: { multiplier: 2.8, cap: 200, pranaCost: 35 },
};

/** Core: pontua uma folha neutra, conforme o capítulo canônico 02.
 * O Adapter fornece ER consolidado, nunca concede XP nem manipula energia.
 */
export function projectNativeLeafReward(baseValue: number, durationSeconds: number, effortLevel = 1, preview = false) {
  if (!Number.isFinite(baseValue) || baseValue < 0 || !Number.isFinite(durationSeconds) || durationSeconds < 0) throw new Error('Volume ou duração inválidos.');
  if (!Number.isInteger(effortLevel) || effortLevel < 1 || effortLevel > 5) throw new Error('O esforço deve ser um inteiro entre 1 e 5.');
  const rule = effortRules[effortLevel];
  const minutes = durationSeconds / 60;
  const presence = preview ? 0.5 : minutes < 0.5 ? 0 : minutes < 1 ? 0.1 : minutes < 2 ? 0.3 : 0.5;
  const timeMultiplier = minutes < 5 ? 1 : minutes < 16 ? 1.2 : minutes < 31 ? 1.5 : minutes < 61 ? 2 : minutes < 91 ? 2.5 : minutes <= 120 ? 3 : 4;
  const rawValue = baseValue * (1 + presence) * rule.multiplier * timeMultiplier;
  return { rawValue, executedValue: Math.min(rawValue, rule.cap), timeMultiplier,
    presenceMultiplier: 1 + presence, effortMultiplier: rule.multiplier, effortCap: rule.cap, pranaCost: rule.pranaCost };
}

export function buildNativeCompletion(input: NativeActionCompletion, pranaBefore: number, existing?: Action) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.sessionId)) throw new Error('A referência da sessão não é um UUIDv4.');
  if (!Number.isFinite(pranaBefore) || pranaBefore < 0 || pranaBefore > 100) throw new Error('Energia Core inválida.');
  if (!Number.isFinite(input.baseValue) || input.baseValue < 0 || !Number.isFinite(input.durationSeconds) || input.durationSeconds < 0) throw new Error('Volume ou duração inválidos.');
  if (input.baseValue === 0) throw new Error('Uma sessão sem séries realizadas deve ser descartada sem registro ou Prana.');
  const timestamp = new Date(input.completedAt);
  if (Number.isNaN(timestamp.getTime()) || !input.title.trim()) throw new Error('Conclusão inválida.');
  if (existing && (existing.lifecycleType !== 'ACTION' || existing.children.length || existing.isCompleted)) throw new Error('A ocorrência vinculada não pode ser concluída por este fluxo.');
  const minutes = input.durationSeconds / 60;
  const effortLevel = input.effortLevel ?? existing?.effortLevel ?? 1;
  const { rawValue, executedValue, effortCap, pranaCost } = projectNativeLeafReward(input.baseValue, input.durationSeconds, effortLevel, input.declaredPlannedExecution && input.durationSeconds > 0);
  const pranaAfter = Math.max(0, Math.min(100, pranaBefore - pranaCost));
  const action: Task = {
    id: existing?.id ?? crypto.randomUUID(), title: input.title, type: 'TASK', lifecycleType: 'ACTION', semanticType: null,
    sourceModule: 'modulo_treino', sourceRefId: input.sessionId,
    baseValue: input.baseValue, effortLevel, plannedTimeMinutes: null, actualTimeMinutes: minutes,
    completedAt: timestamp, completedScore: executedValue, isCompleted: true,
    createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp, parentId: null, children: [], childItems: [],
    isAggregator: false, aggregatedScore: 0, areaPrimaryId: 'area-saude', areaSecondaryId1: null, areaSecondaryId2: null,
    subareaPrimaryId: null, subareaSecondaryId1: null, subareaSecondaryId2: null, elementId: 'terra',
    isInProgress: false, elapsedSeconds: 0, lastStartedAt: null, isExpanded: false, displayOrder: existing?.displayOrder ?? 0,
  };
  const log: ExecutionLog = {
    id: crypto.randomUUID(), subjectId: action.id, subjectType: 'ACTION', timestamp,
    sourceModule: 'modulo_treino', sourceRefId: input.sessionId, actualTimeMinutes: minutes, actualEffortLevel: effortLevel,
    completedItemIds: [], executedValue, fullCompletion: input.fullCompletion ?? true, bonusApplied: 0,
    durationSource: input.declaredPlannedExecution ? 'DECLARED_PLANNED' : 'MEASURED',
    baseValue: input.baseValue, rawValue, effortCap, pranaDeltaApplied: pranaAfter - pranaBefore,
    ruleVersion: 'core-native-leaf-v3',
  };
  return { action, log, pranaAfter };
}
