// ============================================
// CONSELHO ELEMENTAL - TIPOS TYPESCRIPT
// ============================================

// ============================================
// ELEMENTOS
// ============================================
export type ElementId = 'terra' | 'fogo' | 'agua' | 'ar';

export interface Element {
  id: ElementId;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  glow: string;
  lightColor: string;
  domain: string;
  description: string;
}

// ============================================
// ÁREAS
// ============================================
export interface Area {
  id: string;
  name: string;
  description: string;
  elementId: ElementId;
  color: string;
  parentId: string | null;
  subareas: Area[];
  isUserSelected: boolean;
  isCustom: boolean;
}

// ============================================
// TIPOS DE LIFECYCLE
// ============================================
export type LifecycleType = 'ACTION' | 'HABIT' | 'QUEST' | 'PROJECT' | 'MISSION' | 'DRAFT';
export type ActionLifecycleType = 'ACTION' | 'HABIT';
export type MasteryTitle = 'Iniciado' | 'Aprendiz' | 'Adepto' | 'Especialista' | 'Mestre' | 'Grão-Mestre' | 'Ancião' | 'Lenda';

// ============================================
// TIPOS SEMÂNTICOS DE ITENS
// ============================================
export type SemanticType = 'VALUABLE' | 'VALUELESS' | 'NOTE' | 'valuable' | 'structural' | 'text';
export type LegacySemanticType = 'valuable' | 'structural' | 'text';

// ============================================
// STATUS
// ============================================
export type Status = 'active' | 'completed' | 'archived';

// ============================================
// ITEM BASE (para hierarquia)
// ============================================
export interface BaseItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Hierarquia
  parentId: string | null;
  children: string[]; // IDs dos filhos
  
  // Agregação
  isAggregator: boolean;
  aggregatedScore: number;
}

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
/** Months are 1–12. Missing fields are retained for legacy, unconfigured schedules. */
export interface RecurrenceConfig {
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  month?: number;
  day?: number;
  /** Inclusive local date, YYYY-MM-DD; absent means no end date. */
  until?: string;
}

// ============================================
// ACTION: linha raiz ou descendente da tabela actions, ligada por parentId.
export interface Action extends BaseItem {
  /** Optional local date YYYY-MM-DD, independent of creation time and device time zone. */
  dueDate?: string | null;
  sourceModule?: 'modulo_treino';
  sourceRefId?: string;
  type: 'TASK' | 'HABIT' | 'TASK_ITEM';
  lifecycleType: ActionLifecycleType | null;
  semanticType: SemanticType | LegacySemanticType | null;
  parentId: string | null;
  baseValue: number | null;
  effortLevel: number | null;
  plannedTimeMinutes: number | null;
  actualTimeMinutes: number | null;
  completedScore?: number | null;
  completionXp?: { amount: number; elementId: ElementId; ruleset: 'ritual-leaf-xp-v1' };
  completedAt?: Date | null;
  areaPrimaryId: string | null;
  areaSecondaryId1: string | null;
  areaSecondaryId2: string | null;
  subareaPrimaryId: string | null;
  subareaSecondaryId1: string | null;
  subareaSecondaryId2: string | null;
  elementId: ElementId;
  isInProgress: boolean;
  elapsedSeconds: number;
  lastStartedAt: Date | null;
  isExpanded: boolean;
  displayOrder: number;
  recurrenceType?: RecurrenceType;
  recurrenceConfig?: RecurrenceConfig;
  completions?: HabitCompletion[];
  dailyTracking?: HabitDailyTracking;
  dailyEntries?: HabitDailyEntry[];
  controlledBySequenceId?: string | null;
  areaId?: string;
  subareaId?: string | null;
  name?: string;
  childItems?: TaskItem[]; // projeção de interface legada; estrutura persistida usa parentId
  areaTertiaryId1?: string | null;
  areaTertiaryId2?: string | null;
  subareaTertiaryId1?: string | null;
  subareaTertiaryId2?: string | null;
  plannedPoints?: number;
  streak?: number;
  longestStreak?: number;
  lastCompletedAt?: Date | null;
  childHabits?: Habit[]; // projeção temporária para UI antiga
}

/** @deprecated View legado temporário; não corresponde a tabela ou entidade de domínio separada. */
export interface TaskItem extends Action {
  type: 'TASK_ITEM';
  lifecycleType: null;
  semanticType: SemanticType | LegacySemanticType;
  taskId: string;
  sortOrder: number;
  childItems: TaskItem[];
}


export interface Task extends Action {
  type: 'TASK';
  lifecycleType: 'ACTION';
  semanticType: null;
  childItems: TaskItem[];
}

/** Optional quantitative diary; entries do not award points or complete the habit. */
export interface HabitDailyTracking { target: number; step: number; unit: string }
export interface HabitDailyEntry { id: string; dateKey: string; quantity: number; unit: string; recordedAt: string }

/** @deprecated View legado temporário; Habit canônico é uma Action com lifecycleType HABIT. */
export interface Habit extends Action {
  type: 'HABIT';
  lifecycleType: 'HABIT';
  semanticType: SemanticType | LegacySemanticType | null;
  name: string;
  areaId: string;
  plannedTimeMinutes: number;
  plannedPoints: number;
  recurrenceType: RecurrenceType;
  recurrenceConfig: RecurrenceConfig;
  streak: number;
  longestStreak: number;
  lastCompletedAt: Date | null;
  completions: HabitCompletion[];
  childHabits: Habit[];
  /** Campos mantidos para leituras do estado local e views anteriores durante a migração. */
  startDate?: Date;
  sortOrder?: number;
  semanticValueBackup?: { plannedPoints: number; plannedTimeMinutes: number } | null;
  semanticStructuralBackup?: { plannedPoints: number; plannedTimeMinutes: number } | null;
}

// SEQUENCIA DE CICLOS
// ============================================
export interface CycleSequence {
  /** Date of explicit cursor selection; skipping never changes completion history. */
  cursorDate?: Date;
  /** Shared planning/execution entity; absent status means a legacy Core sequence. */
  status?: 'PLANNING' | 'ACTIVE' | 'PAUSED';
  memberRestriction?: 'ANY' | 'WORKOUT';
  templateIds?: string[];
  sourceModule?: 'modulo_treino';
  sourceRefId?: string;
  description?: string;
  id: string;
  name: string;
  displayOrder: number;
  recurrenceType: RecurrenceType;
  recurrenceConfig: RecurrenceConfig;
  currentPosition: number;
  lastCompletedDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CommitmentRecurrence = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Commitment {
  id: string;
  title: string;
  date: Date;
  recurrence: CommitmentRecurrence;
  untilDate?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SequenceMembership {
  id: string;
  sequenceId: string;
  habitId: string;
  position: number;
  addedAt: Date;
}

// ============================================
// COMPLETION DE HÁBITO
// ============================================
export interface HabitCompletion {
  id: string;
  habitId: string;
  completionDate: Date;
  timeSpentMinutes: number;
  scoreEarned: number;
  /** Actual XP credited by this receipt. Absent on historical, unreconciled completions. */
  xpAwarded?: number;
  xpElementId?: ElementId;
  xpRuleset?: 'cycle-xp-v1' | 'cycle-xp-recovery-v1';
  plannedScoreAtCompletion?: number;
  executedScore?: number;
  actualEffortLevel?: number;
  presenceBonusApplied?: number;
  timeMultiplierApplied?: number;
  formulaVersion?: string;
  startedAtCycleSeconds?: number;
  endedAtCycleSeconds?: number;
}

// ============================================
// MISSÃO (fase de projeto)
// ============================================
export interface Mission extends BaseItem {
  type: 'MISSION';
  lifecycleType: 'MISSION';
  projectId: string;
  
  // Elemento e Área (herdados do projeto)
  elementId: ElementId;
  areaId: string;
  
  // Status - missões usam isCompleted
  status: 'active' | 'completed';
  
  // Progresso
  progress: number;
  
  // Conteúdo
  tasks: Task[];
  habits: Habit[];
  
  // Data limite opcional
  dueDate: Date | null;
}

// ============================================
// QUEST / JORNADA
// ============================================
export interface Quest extends BaseItem {
  type: 'QUEST';
  lifecycleType: 'QUEST';
  
  // Elemento e Área
  elementId: ElementId;
  areaId: string;
  
  // Status
  status: 'active' | 'completed';
  
  // Progresso
  progress: number;
  
  // Conteúdo (ordenado)
  tasks: Task[];
  habits: Habit[];
  itemOrder: string[]; // IDs na ordem de exibição
  
  // Data limite opcional
  dueDate: Date | null;
  
  // Recompensa
  reward?: string;
  xpBonus: number;
  completionBonus?: AchievementBonus;
}

export interface AchievementBonus {
  id: string;
  amount: number;
  elementId: ElementId;
  completedAt: string;
  ruleset: 'achievement-bonus-v1';
}

// ============================================
// PROJETO / GRANDE OBRA
// ============================================
export interface Project extends BaseItem {
  type: 'PROJECT';
  lifecycleType: 'PROJECT';
  
  // Elemento e Área
  elementId: ElementId;
  areaId: string;
  
  // Status
  status: Status;
  
  // Progresso
  progress: number;
  
  // Conteúdo
  missions: Mission[];
  quests: Quest[];
  tasks: Task[];
  habits: Habit[];
  
  // Data limite opcional
  dueDate: Date | null;
  
  // Recompensa
  reward?: string;
  xpBonus: number;
  completionBonus?: AchievementBonus;
}

// ============================================
// RAScUNHO / FORJA
// ============================================
export interface Draft {
  id: string;
  title: string;
  notes?: string;
  createdAt: Date;
  
  // Para triagem posterior
  suggestedType?: LifecycleType;
  suggestedElementId?: ElementId;
}

// ============================================
// LOG DE EXECUÇÃO
// ============================================
export interface ExecutionLog {
  rotationBefore?: { id: string; currentPosition: number; lastCompletedDate: Date | null; cursorDate?: Date };
  durationSource?: 'MEASURED' | 'DECLARED_PLANNED' | 'ESTIMATED_ACTIVE' | 'MIXED_ACTIVE';
  sourceModule?: 'modulo_treino';
  sourceRefId?: string;
  baseValue?: number;
  rawValue?: number;
  effortCap?: number;
  pranaDeltaApplied?: number;
  ruleVersion?: string;
  id: string;
  subjectId: string; // UUID v4; persisted as subject_id
  subjectType: LifecycleType; // persisted as subject_type
  timestamp: Date;
  actualTimeMinutes: number;
  actualEffortLevel: number;
  completedItemIds: string[];
  executedValue: number;
  fullCompletion: boolean;
  bonusApplied: number;
}

// ============================================
// USUÁRIO
// ============================================
export interface User {
  /** Optional local alert metadata; retained by the existing full-progress archive. */
  reminderState?: import('@/lib/reminders/profile-reminders').ProfileReminders;
  /** Energia canônica; perfis anteriores iniciam em 100 ao primeiro despacho. */
  pranaLevel?: number;
  id: string;
  name: string;
  avatar: string;
  xp_fire: number;
  xp_earth: number;
  xp_water: number;
  xp_air: number;
  /** Campos derivados antigos; novos fluxos devem usar getLevelProgress(). */
  level?: number;
  experience?: number;
  experienceToNextLevel?: number;
  totalScore: number;
  streak: number;
  longestStreak: number;
  joinedAt: Date;
}

// ============================================
// PONTUAÇÃO POR ELEMENTO
// ============================================
export interface ElementScore {
  elementId: ElementId;
  score: number;
  percentage: number;
  taskCount: number;
  habitCount: number;
}

// ============================================
// PONTUAÇÃO POR ÁREA
// ============================================
export interface AreaScore {
  areaId: string;
  score: number;
  taskCount: number;
  habitCount: number;
}

// ============================================
// ESTADO DO TIMER
// ============================================
export interface TimerState {
  entityId: string | null;
  entityType: 'TASK' | 'HABIT' | null;
  isRunning: boolean;
  elapsedSeconds: number;
  startedAt: Date | null;
  /** Local selected day; operational timer metadata, excluded from backups. */
  activityDate?: string;
}

// ============================================
// NAVEGAÇÃO
// ============================================
export interface NavItem {
  icon: string;
  label: string;
  route: string;
  isAction?: boolean;
}

// ============================================
// FILTROS
// ============================================
export interface TaskFilters {
  elementId?: ElementId;
  areaId?: string;
  status?: 'pending' | 'completed' | 'all';
  search?: string;
}

// ============================================
// ONBOARDING
// ============================================
export interface OnboardingState {
  step: number;
  selectedAreas: string[];
  avatar: string;
  isComplete: boolean;
}

// ============================================
// CARD DO DIA (Ciclos)
// ============================================
export interface DayCard {
  date: Date;
  dayOfWeek: string;
  moonPhase: string;
  season: string;
  habits: Habit[];
  completedHabitIds: string[];
}

// ============================================
// TIPO UNION PARA ENTIDADES
// ============================================
export type Entity = Task | Habit | Mission | Quest | Project | Draft;

// ============================================
// TIPO PARA CRIAÇÃO RÁPIDA
// ============================================
export interface QuickCreateInput {
  title: string;
  type: 'ACTION' | 'HABIT' | 'DRAFT';
}
