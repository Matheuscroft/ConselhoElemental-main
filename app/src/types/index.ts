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
export type SemanticType = 'VALUABLE' | 'VALUELESS' | 'NOTE';
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

// ============================================
// ACTION: linha raiz ou descendente da tabela actions, ligada por parentId.
export interface Action extends BaseItem {
  type: 'TASK' | 'HABIT';
  lifecycleType: ActionLifecycleType | null;
  semanticType: SemanticType | LegacySemanticType | null;
  parentId: string | null;
  baseValue: number | null;
  effortLevel: number | null;
  plannedTimeMinutes: number | null;
  actualTimeMinutes: number | null;
  completedScore?: number | null;
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
  recurrenceType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceConfig?: { daysOfWeek?: number[]; daysOfMonth?: number[] };
  completions?: HabitCompletion[];
  controlledBySequenceId?: string | null;
  areaId?: string;
  subareaId?: string | null;
  name?: string;
  childItems?: TaskItem[]; // projeção de interface legada; estrutura persistida usa parentId
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
}


export interface Task extends Action {
  type: 'TASK';
  lifecycleType: 'ACTION';
  semanticType: null;
  childItems: TaskItem[];
}

/** @deprecated View legado temporário; Habit canônico é uma Action com lifecycleType HABIT. */
export interface Habit extends Action {
  type: 'HABIT';
  lifecycleType: 'HABIT';
  semanticType: SemanticType | LegacySemanticType | null;
  name: string;
  areaId: string;
  plannedTimeMinutes: number;
  plannedPoints: number;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceConfig: { daysOfWeek?: number[]; daysOfMonth?: number[] };
  streak: number;
  longestStreak: number;
  lastCompletedAt: Date | null;
  completions: HabitCompletion[];
  childHabits: Habit[];
}

// SEQUENCIA DE CICLOS
// ============================================
export interface CycleSequence {
  id: string;
  name: string;
  displayOrder: number;
  recurrenceType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  recurrenceConfig: {
    daysOfWeek?: number[];
    daysOfMonth?: number[];
  };
  currentPosition: number;
  lastCompletedDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CommitmentRecurrence = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Commitment {
  id: string;
  title: string;
  date: Date;
  recurrence: CommitmentRecurrence;
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
  id: string;
  name: string;
  avatar: string;
  xp_fire: number;
  xp_earth: number;
  xp_water: number;
  xp_air: number;
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
