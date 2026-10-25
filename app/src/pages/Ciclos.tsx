import { CycleCreationForm } from '@/components/cycles/CycleCreationForm';
import { ExpandedDayCard } from '@/components/cycles/ExpandedDayCard';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ElementalTimer } from '@/components/elemental/ElementalTimer';
import { getSequencePositionForDate } from '@/lib/temporal/sequence-position';
import { toast } from 'sonner';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { parseDestinyDate } from '@/components/destiny/destiny-options';
import { CycleSequenceShowcase } from '@/components/cycles/CycleSequenceShowcase';
import { CycleFilters } from '@/components/cycles/CycleFilters';
import { hasCycleFilters, matchesCycleFilters, normalizeCycleSearch, type CycleFilters as CycleFilterState } from '@/components/cycles/cycle-discovery';
import './ciclos.css';
import '@/components/elemental/element-discovery.css';
import { 
  Plus, SkipForward, Search,
  Flame, 
  Calendar,
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Play, 
  Pause, 
  Check,
  X,
  Clock,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Edit2,
  Trash2,
  PlusCircle,
  ListTodo,
  Dumbbell
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { ScoreHierarchyPanel } from '@/components/cards';
import { WorkoutListCard } from '@/components/workout';
import { FitnessHabitWidget } from '@/components/workout/FitnessHabitWidget';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Workout } from '@/types/workout';
import { 
  getAreaById,
  formatDuration, 
  formatTime,
  getMoonPhase, 
  getSeason, 
  WEEKDAYS,
  WEEKDAYS_SHORT,
  ELEMENTS,
  AREAS,
} from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Habit, SemanticType } from '@/types';

type ChildExecutionType = SemanticType;
type HabitSemanticMetadata = Habit & {
  executionType?: ChildExecutionType;
  semanticType?: ChildExecutionType;
  semanticValueBackup?: {
    plannedPoints: number;
    plannedTimeMinutes: number;
  } | null;
  semanticStructuralBackup?: {
    plannedPoints: number;
    plannedTimeMinutes: number;
  } | null;
};

type ExecutionTiming = {
  startedAtCycleSeconds: number;
  endedAtCycleSeconds: number;
  elapsedSeconds: number;
};

const findHabitById = (items: Habit[], id: string): Habit | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.childHabits.length > 0) {
      const found = findHabitById(item.childHabits, id);
      if (found) return found;
    }
  }
  return null;
};

export const Ciclos: React.FC = () => {
  const navigate = useNavigate();
  const [destinyParams] = useSearchParams();
  const destinyAccountId = useAppStore(state => state.currentAccountId);
  const [appliedDestinyIntent, setAppliedDestinyIntent] = useState<string | null>(null);
  const insightsRef = useRef<HTMLDetailsElement>(null);
  const { 
    tasks,
    habits, 
    customAreas,
    customSubareas,
    completeHabit, 
    uncompleteHabit,
    deleteHabit,
    duplicateHabit,
    moveHabitUp,
    moveHabitDown,
    getHabitsForDate,
    cycleSequences,
    sequenceMemberships,
    createCycleSequence,
    updateCycleSequence,
    toggleCycleSequenceActive,
    moveHabitInSequence,
    reorderHabitsInSequence,
    resetCycleSequenceToStart, skipCycleSequence,
    deleteCycleSequence,
    addHabitToSequence,
    removeHabitFromSequence,
    updateHabit,
    updateHabitChild,
    addHabitChild,
    deleteHabitChild,
    completeHabitChild,
    uncompleteHabitChild,
    toggleHabitChildExpansion,
    moveHabitChildUp,
    moveHabitChildDown,
    reorderHabitChildren,
    promoteHabitChildLevel,
    startTimer,
    stopTimer,
    timer,
    addHabit,
  } = useAppStore();
  
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const [selectedDate, setSelectedDate] = useState(() => normalizeDate(new Date()));
  const [visibleDaysCenterDate, setVisibleDaysCenterDate] = useState(() => normalizeDate(new Date()));
  const [activeHabit, setActiveHabit] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showExecutionMode, setShowExecutionMode] = useState(false);
  const [executionCurrentIndex, setExecutionCurrentIndex] = useState(0);
  const [completedHabitId, setCompletedHabitId] = useState<string | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [newChildHabitName, setNewChildHabitName] = useState('');
  const [newChildHabitPoints, setNewChildHabitPoints] = useState(1);
  const [newChildHabitMinutes, setNewChildHabitMinutes] = useState('');
  const [activeAddHabitTarget, setActiveAddHabitTarget] = useState<string | null>(null);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitIsChild, setEditingHabitIsChild] = useState(false);
  const [editName, setEditName] = useState('');
  const [editArea, setEditArea] = useState<string>('none');
  const [editSubarea, setEditSubarea] = useState<string>('none');
  const [editPoints, setEditPoints] = useState(1);
  const [editTimeMinutes, setEditTimeMinutes] = useState<number>(0);
  const [editTimeSeconds, setEditTimeSeconds] = useState<number>(0);
  const [hasTime, setHasTime] = useState(false);
  const [showQuickCreateCycle, setShowQuickCreateCycle] = useState(false);
  const [quickCreateCycleName, setQuickCreateCycleName] = useState('');
  const [quickCreateCycleDaysOfWeek, setQuickCreateCycleDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [showQuickCreateSequence, setShowQuickCreateSequence] = useState(false);
  const [quickCreateSequenceName, setQuickCreateSequenceName] = useState('');
  const [quickSequenceRestriction, setQuickSequenceRestriction] = useState<'ANY' | 'WORKOUT'>('ANY');
  const [quickCreateSequenceDaysOfWeek, setQuickCreateSequenceDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [draggedMixedCard, setDraggedMixedCard] = useState<{ type: 'habit' | 'sequence'; id: string } | null>(null);
  const [dragOverMixedCard, setDragOverMixedCard] = useState<{ type: 'habit' | 'sequence'; id: string } | null>(null);
  const [workspaceView, setWorkspaceView] = useState<'routine' | 'sequences'>('routine');
  const [cycleFilters, setCycleFilters] = useState<CycleFilterState>({ query: '', element: 'all', status: 'all' });
  const [sequenceQuery, setSequenceQuery] = useState('');
  const [cyclesViewMode, setCyclesViewMode] = useState<'ordered' | 'pending-first'>('ordered');
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
  const [sequenceHabitToAdd, setSequenceHabitToAdd] = useState<string>('none');
  const [editDaysOfWeek, setEditDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [draggedSequenceHabitId, setDraggedSequenceHabitId] = useState<string | null>(null);
  const [dragOverSequenceHabitId, setDragOverSequenceHabitId] = useState<string | null>(null);
  const [draggedChildHabit, setDraggedChildHabit] = useState<{ habitId: string; parentId: string } | null>(null);
  const [dragOverChildHabitId, setDragOverChildHabitId] = useState<string | null>(null);
  const [dragOverPromoteParentId, setDragOverPromoteParentId] = useState<string | null>(null);
  const newCycleTriggerRef = useRef<HTMLButtonElement | null>(null);
  const newSequenceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const dayShortcutsContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedDayButtonRef = useRef<HTMLButtonElement | null>(null);
  const [userLatitude, setUserLatitude] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const cachedLatitude = localStorage.getItem('ce:user-latitude');
    if (!cachedLatitude) return null;

    const parsed = Number(cachedLatitude);
    return Number.isNaN(parsed) ? null : parsed;
  });
  const [executionTaskStartCycleSeconds, setExecutionTaskStartCycleSeconds] = useState<number | null>(null);
  const [executionTimings, setExecutionTimings] = useState<Record<string, ExecutionTiming>>({});
  const executionEarnedPointsRef = useRef(0);
  const completionActionLockRef = useRef<Record<string, number>>({});

  const destinyHabitId = destinyParams.get('atividade');
  const destinyDate = destinyParams.get('data');
  const destinyIntent = destinyHabitId ? `${destinyAccountId}:${destinyHabitId}:${destinyDate}` : null;
  if (destinyIntent !== appliedDestinyIntent) {
    const habit = destinyHabitId ? findHabitById(habits, destinyHabitId) : null;
    const date = parseDestinyDate(destinyDate);
    if (!destinyIntent || (habit && date)) {
      setAppliedDestinyIntent(destinyIntent);
      if (habit && date) {
        setSelectedDate(date);
        setVisibleDaysCenterDate(date);
        setWorkspaceView('routine');
        setCycleFilters({ query: habit.name || habit.title, element: 'all', status: 'all' });
      }
    }
  }

  const dayShortcuts = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const dayWindowShift = 7;

  const toggleWeekday = (
    day: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setter((current) => {
      const hasDay = current.includes(day);
      if (hasDay) {
        // Mantem ao menos um dia selecionado.
        if (current.length <= 1) return current;
        return current.filter((item) => item !== day);
      }
      return [...current, day].sort((a, b) => a - b);
    });
  };

  useEffect(() => {
    // Keep the horizontal rail in view without moving the page or stealing focus.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      const rail = dayShortcutsContainerRef.current;
      const day = selectedDayButtonRef.current;
      if (!rail || !day) return;
      rail.scrollTo({ left: day.offsetLeft - (rail.clientWidth - day.clientWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
    }, reduced ? 0 : 260);
    return () => window.clearTimeout(timeout);
  }, [selectedDate, visibleDaysCenterDate]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        setUserLatitude(latitude);
        localStorage.setItem('ce:user-latitude', String(latitude));
      },
      () => {},
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 1000 * 60 * 60 * 6,
      }
    );
  }, []);

  const handleQuickCreateCycle = () => {
    if (!quickCreateCycleName.trim()) return;

    const creationDate = new Date(selectedDate);

    addHabit({
      name: quickCreateCycleName.trim(),
      title: quickCreateCycleName.trim(),
      areaId: 'sem-categoria',
      elementId: 'terra',
      startDate: creationDate,
      recurrenceType: 'DAILY',
      recurrenceConfig: { daysOfWeek: quickCreateCycleDaysOfWeek },
      plannedPoints: 1,
      plannedTimeMinutes: 0,
    });

    setQuickCreateCycleName('');
    setQuickCreateCycleDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setShowQuickCreateCycle(false);
  };

  const handleQuickCreateSequence = () => {
    if (!quickCreateSequenceName.trim()) return;

    const creationDate = new Date(selectedDate);

    createCycleSequence({
      name: quickCreateSequenceName.trim(),
      memberRestriction: quickSequenceRestriction,
      startDate: creationDate,
      recurrenceType: 'DAILY',
      recurrenceConfig: { daysOfWeek: quickCreateSequenceDaysOfWeek },
    });

    setQuickCreateSequenceName('');
    setQuickSequenceRestriction('ANY');
    setQuickCreateSequenceDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setShowQuickCreateSequence(false);
  };

  const handleMixedCardDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    type: 'habit' | 'sequence',
    id: string
  ) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `${type}:${id}`);
    setDraggedMixedCard({ type, id });
  };

  const handleMixedCardDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    targetType: 'habit' | 'sequence',
    targetId: string
  ) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (!draggedMixedCard) return;
    if (draggedMixedCard.type === targetType && draggedMixedCard.id === targetId) return;
    setDragOverMixedCard({ type: targetType, id: targetId });
  };

  const applyMixedCardOrder = (orderedKeys: string[]) => {
    orderedKeys.forEach((key, index) => {
      const [kind, itemId] = key.split(':') as ['habit' | 'sequence', string];
      const nextOrder = index + 1;

      if (kind === 'habit') {
        const targetHabit = habits.find((habit) => habit.id === itemId);
        if (targetHabit && (targetHabit.sortOrder ?? 0) !== nextOrder) {
          updateHabit(itemId, { sortOrder: nextOrder });
        }
        return;
      }

      const targetSequence = cycleSequences.find((sequence) => sequence.id === itemId);
      if (targetSequence && (targetSequence.displayOrder ?? 0) !== nextOrder) {
        updateCycleSequence(itemId, { displayOrder: nextOrder });
      }
    });
  };

  const handleMoveMixedCard = (
    type: 'habit' | 'sequence',
    id: string,
    direction: 'up' | 'down'
  ) => {
    const orderedKeys = mixedCards.map((card) => `${card.type}:${card.id}`);
    const sourceKey = `${type}:${id}`;
    const fromIndex = orderedKeys.findIndex((key) => key === sourceKey);
    if (fromIndex < 0) return;

    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= orderedKeys.length) return;

    const reorderedKeys = [...orderedKeys];
    const [moved] = reorderedKeys.splice(fromIndex, 1);
    reorderedKeys.splice(toIndex, 0, moved);
    applyMixedCardOrder(reorderedKeys);
  };

  const handleMixedCardDrop = (targetType: 'habit' | 'sequence', targetId: string) => {
    if (!draggedMixedCard) {
      setDragOverMixedCard(null);
      return;
    }

    if (draggedMixedCard.type === targetType && draggedMixedCard.id === targetId) {
      setDraggedMixedCard(null);
      setDragOverMixedCard(null);
      return;
    }

    const orderedKeys = mixedCards.map((card) => `${card.type}:${card.id}`);
    const sourceKey = `${draggedMixedCard.type}:${draggedMixedCard.id}`;
    const targetKey = `${targetType}:${targetId}`;

    const fromIndex = orderedKeys.findIndex((key) => key === sourceKey);
    const toIndex = orderedKeys.findIndex((key) => key === targetKey);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedMixedCard(null);
      setDragOverMixedCard(null);
      return;
    }

    const reorderedKeys = [...orderedKeys];
    const [moved] = reorderedKeys.splice(fromIndex, 1);
    reorderedKeys.splice(toIndex, 0, moved);

    applyMixedCardOrder(reorderedKeys);

    setDraggedMixedCard(null);
    setDragOverMixedCard(null);
  };

  const handleMixedCardDragEnd = () => {
    setDraggedMixedCard(null);
    setDragOverMixedCard(null);
  };

  const handleSequenceMemberDragStart = (habitId: string) => {
    setDraggedSequenceHabitId(habitId);
  };

  const handleSequenceMemberDragOver = (habitId: string) => {
    if (draggedSequenceHabitId && draggedSequenceHabitId !== habitId) {
      setDragOverSequenceHabitId(habitId);
    }
  };

  const handleSequenceMemberDrop = (targetHabitId: string) => {
    if (!selectedSequenceSummary || !draggedSequenceHabitId || draggedSequenceHabitId === targetHabitId) {
      setDraggedSequenceHabitId(null);
      setDragOverSequenceHabitId(null);
      return;
    }

    const orderedHabitIds = selectedSequenceMembers.map((item) => item.membership.habitId);
    const fromIndex = orderedHabitIds.findIndex((id) => id === draggedSequenceHabitId);
    const toIndex = orderedHabitIds.findIndex((id) => id === targetHabitId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedSequenceHabitId(null);
      setDragOverSequenceHabitId(null);
      return;
    }

    const nextOrder = [...orderedHabitIds];
    const [moved] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, moved);

    reorderHabitsInSequence(selectedSequenceSummary.sequence.id, nextOrder);

    setDraggedSequenceHabitId(null);
    setDragOverSequenceHabitId(null);
  };

  const handleSequenceMemberDragEnd = () => {
    setDraggedSequenceHabitId(null);
    setDragOverSequenceHabitId(null);
  };

  const handleChildHabitDragStart = (habitId: string, parentId: string) => {
    setDraggedChildHabit({ habitId, parentId });
  };

  const handleChildHabitDragOver = (habitId: string, parentId: string) => {
    if (!draggedChildHabit || draggedChildHabit.parentId !== parentId || draggedChildHabit.habitId === habitId) {
      return;
    }
    setDragOverChildHabitId(habitId);
  };

  const handleChildHabitDrop = (targetHabitId: string, parentId: string, siblingHabits: Habit[]) => {
    if (!draggedChildHabit || draggedChildHabit.parentId !== parentId || draggedChildHabit.habitId === targetHabitId) {
      setDraggedChildHabit(null);
      setDragOverChildHabitId(null);
      setDragOverPromoteParentId(null);
      return;
    }

    const orderedSiblingIds = [...siblingHabits]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((habit) => habit.id);
    const fromIndex = orderedSiblingIds.findIndex((id) => id === draggedChildHabit.habitId);
    const toIndex = orderedSiblingIds.findIndex((id) => id === targetHabitId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedChildHabit(null);
      setDragOverChildHabitId(null);
      setDragOverPromoteParentId(null);
      return;
    }

    const nextOrder = [...orderedSiblingIds];
    const [moved] = nextOrder.splice(fromIndex, 1);
    nextOrder.splice(toIndex, 0, moved);
    reorderHabitChildren(parentId, nextOrder);

    setDraggedChildHabit(null);
    setDragOverChildHabitId(null);
    setDragOverPromoteParentId(null);
  };

  const handlePromoteDragOver = (parentId: string) => {
    if (!draggedChildHabit || draggedChildHabit.parentId !== parentId) return;
    setDragOverPromoteParentId(parentId);
  };

  const handlePromoteDrop = (parentId: string) => {
    if (!draggedChildHabit || draggedChildHabit.parentId !== parentId) {
      setDraggedChildHabit(null);
      setDragOverChildHabitId(null);
      setDragOverPromoteParentId(null);
      return;
    }

    promoteHabitChildLevel(draggedChildHabit.habitId);
    setDraggedChildHabit(null);
    setDragOverChildHabitId(null);
    setDragOverPromoteParentId(null);
  };

  const handleChildHabitDragEnd = () => {
    setDraggedChildHabit(null);
    setDragOverChildHabitId(null);
    setDragOverPromoteParentId(null);
  };

  // Get habits for selected date
  const habitsForDate = getHabitsForDate(selectedDate);

  const { getWorkoutsForDate, getSessionById: getWorkoutSessionById, getSessionRating, startWorkout, activeNativeSession } = useWorkoutStore();
  const workoutsForSelectedDate = getWorkoutsForDate(selectedDate);

  const handleWorkoutCardAction = (workout: Workout) => {
    if (workout.status === 'completed') {
      if (workout.lastSessionId) navigate(`/treinos/resumo/${workout.lastSessionId}`);
      return;
    }
    const session = startWorkout(workout.id);
    if (session) navigate(`/treinos/ativo/${session.id}`);
  };

  // Check if habit is completed for selected date
  const isHabitCompleted = useCallback((habit: Habit) => {
    return habit.completions.some(
      (c) => new Date(c.completionDate).toDateString() === selectedDate.toDateString()
    );
  }, [selectedDate]);

  // Get completion for date
  const getCompletionForDate = useCallback((habit: Habit) => {
    return habit.completions.find(
      (c) => new Date(c.completionDate).toDateString() === selectedDate.toDateString()
    );
  }, [selectedDate]);

  // Navigate days
  const goToPreviousDay = () => {
    const nextCenterDate = new Date(visibleDaysCenterDate);
    nextCenterDate.setDate(nextCenterDate.getDate() - dayWindowShift);
    setVisibleDaysCenterDate(normalizeDate(nextCenterDate));
  };

  const goToNextDay = () => {
    const nextCenterDate = new Date(visibleDaysCenterDate);
    nextCenterDate.setDate(nextCenterDate.getDate() + dayWindowShift);
    setVisibleDaysCenterDate(normalizeDate(nextCenterDate));
  };

  const goToToday = () => {
    const today = normalizeDate(new Date());
    setSelectedDate(today);
    setVisibleDaysCenterDate(today);
  };

  const selectRelativeVisibleDay = (offset: number) => {
    const nextDate = new Date(visibleDaysCenterDate);
    nextDate.setDate(nextDate.getDate() + offset);
    const normalized = normalizeDate(nextDate);
    setSelectedDate(normalized);

  };

  const isSameDay = (a: Date, b: Date) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const formatExecutionSnapshot = (seconds?: number | null) => {
    if (seconds == null) return '--:--:--';
    return formatTime(seconds);
  };

  const beginExecutionTaskTracking = useCallback((task: Habit | null, startCycleSeconds?: number) => {
    if (!task || isHabitCompleted(task)) {
      setExecutionTaskStartCycleSeconds(null);
      return;
    }

    const snapshot = startCycleSeconds ?? timer.elapsedSeconds;
    setExecutionTaskStartCycleSeconds(snapshot);
  }, [isHabitCompleted, timer.elapsedSeconds]);

  const resetExecutionTracking = useCallback(() => {
    setExecutionTaskStartCycleSeconds(null);
    setExecutionTimings({});
    executionEarnedPointsRef.current = 0;
  }, []);

  // Start habit timer
  const handleStartHabit = (habitId: string) => {
    const targetHabit = findHabitById(habits, habitId);
    if (!targetHabit) return;

    const { actionable } = getExecutionChildren(targetHabit);

    // Caso 2: ciclo com filhos acionáveis entra no Execution Mode.
    if (actionable.length > 0) {
      if (activeHabit && activeHabit !== habitId) {
        stopTimer();
      }

      const firstPendingIndex = actionable.findIndex((child) => !isHabitCompleted(child));
      const initialIndex = firstPendingIndex >= 0 ? firstPendingIndex : 0;

      setActiveHabit(habitId);
      setExecutionCurrentIndex(initialIndex);
      startTimer(habitId, 'HABIT');
      const initialTask = actionable[initialIndex] ?? null;
      beginExecutionTaskTracking(initialTask, 0);
      setExecutionTimings({});
      executionEarnedPointsRef.current = 0;
      setShowExecutionMode(true);
      setShowTimer(false);
      return;
    }

    // Caso 1: ciclo sem filhos mantém fluxo simples atual.
    if (activeHabit === habitId && showTimer) {
      stopTimer();
      setShowTimer(false);
      setActiveHabit(null);
      return;
    }

    if (activeHabit && activeHabit !== habitId) {
      stopTimer();
    }

    setActiveHabit(habitId);
    startTimer(habitId, 'HABIT');
    setShowTimer(true);
    setShowExecutionMode(false);
  };

  const closeExecutionMode = useCallback(() => {
    setShowExecutionMode(false);
    setExecutionCurrentIndex(0);
    setActiveHabit(null);
    resetExecutionTracking();
  }, [resetExecutionTracking]);

  const handleExecutionModalChange = (open: boolean) => {
    if (open) {
      setShowExecutionMode(true);
      return;
    }

    if (!activeHabit) {
      setShowExecutionMode(false);
      return;
    }

    const shouldCancel = window.confirm('Deseja cancelar a execucao deste ciclo?');
    if (!shouldCancel) return;

    stopTimer();
    closeExecutionMode();
  };

  const finalizeExecutionCycle = useCallback((pointsOverride?: number) => {
    if (!activeHabit) return;

    const elapsedSeconds = stopTimer();
    const timeSpentMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

    const latestHabit = findHabitById(useAppStore.getState().habits, activeHabit);
    const alreadyCompleted = latestHabit ? isHabitCompleted(latestHabit) : false;
    const completionPoints = alreadyCompleted
      ? 0
      : completeHabit(activeHabit, timeSpentMinutes, selectedDate);
    const accumulatedPoints = pointsOverride ?? executionEarnedPointsRef.current;
    const pointsToShow = accumulatedPoints > 0 ? accumulatedPoints : completionPoints;

    setCompletedHabitId(activeHabit);
    setEarnedPoints(pointsToShow);

    setTimeout(() => {
      setCompletedHabitId(null);
      setEarnedPoints(0);
    }, 3000);

    closeExecutionMode();
  }, [activeHabit, stopTimer, isHabitCompleted, completeHabit, selectedDate, closeExecutionMode]);

  const handleExecutionCompleteCurrentTask = () => {
    if (!activeHabit) return;

    const executionHabit = findHabitById(habits, activeHabit);
    const { actionable } = getExecutionChildren(executionHabit);
    if (actionable.length === 0) {
      finalizeExecutionCycle();
      return;
    }

    const currentTask = actionable[executionCurrentIndex];

    // Se por qualquer motivo o indice atual nao estiver valido, finaliza quando nao houver mais pendencias.
    if (!currentTask) {
      const hasPending = actionable.some((task) => !isHabitCompleted(task));
      if (!hasPending) {
        finalizeExecutionCycle();
      }
      return;
    }

    let nextExecutionEarnedPoints = executionEarnedPointsRef.current;

    const predictedCompletedIds = new Set(
      actionable.filter((task) => isHabitCompleted(task)).map((task) => task.id)
    );

    if (!isHabitCompleted(currentTask)) {
      const endedAtCycleSeconds = timer.elapsedSeconds;
      const startedAtCycleSeconds = executionTaskStartCycleSeconds ?? endedAtCycleSeconds;
      const elapsedSeconds = Math.max(0, endedAtCycleSeconds - startedAtCycleSeconds);
      const timeSpentMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

      const points = completeHabitChild(currentTask.id, timeSpentMinutes, selectedDate, {
        startedAtCycleSeconds,
        endedAtCycleSeconds,
      });
      nextExecutionEarnedPoints += points;
      executionEarnedPointsRef.current = nextExecutionEarnedPoints;

      setExecutionTimings((prev) => ({
        ...prev,
        [currentTask.id]: {
          startedAtCycleSeconds,
          endedAtCycleSeconds,
          elapsedSeconds,
        },
      }));

      predictedCompletedIds.add(currentTask.id);
    }

    const latestExecutionHabit = findHabitById(useAppStore.getState().habits, activeHabit);
    const { actionable: latestActionable } = getExecutionChildren(latestExecutionHabit);

    const currentTaskLatestIndex = latestActionable.findIndex((task) => task.id === currentTask.id);
    const nextPendingAfterCurrent = latestActionable.findIndex(
      (task, index) => index > currentTaskLatestIndex && !isHabitCompleted(task)
    );
    const firstPendingIndex = latestActionable.findIndex((task) => !isHabitCompleted(task));
    const nextPendingIndex = nextPendingAfterCurrent >= 0 ? nextPendingAfterCurrent : firstPendingIndex;

    // Ultima pendencia concluida: encerra o ciclo no mesmo clique.
    if (nextPendingIndex < 0) {
      finalizeExecutionCycle(nextExecutionEarnedPoints);
      return;
    }

    setExecutionCurrentIndex(nextPendingIndex);
    const nextTask = latestActionable[nextPendingIndex] ?? null;
    beginExecutionTaskTracking(nextTask, timer.elapsedSeconds);
  };

  const handleExecutionBackTask = () => {
    setExecutionCurrentIndex((prev) => {
      const nextIndex = Math.max(0, prev - 1);
      const previousTask = executionActionableChildren[nextIndex] ?? null;
      beginExecutionTaskTracking(previousTask);
      return nextIndex;
    });
  };

  const handleExecutionTogglePause = () => {
    if (timer.isRunning) {
      useAppStore.getState().pauseTimer();
      return;
    }
    useAppStore.getState().resumeTimer();
  };

  const handleExecutionCancel = () => {
    if (!activeHabit) return;

    const shouldCancel = window.confirm('Deseja cancelar a execucao deste ciclo?');
    if (!shouldCancel) return;

    stopTimer();
    closeExecutionMode();
  };

  const handleTimerModalChange = (open: boolean) => {
    if (!open && activeHabit) {
      stopTimer();
      setActiveHabit(null);
    }
    setShowTimer(open);
  };

  // Complete habit directly without opening timer.
  const withCompletionLock = (habitId: string, action: () => void) => {
    const lockKey = `${habitId}-${normalizeDate(selectedDate).toDateString()}`;
    const isLocked = (completionActionLockRef.current[lockKey] || 0) > 0;

    if (isLocked) {
      return;
    }

    completionActionLockRef.current[lockKey] = 1;

    action();

    setTimeout(() => {
      delete completionActionLockRef.current[lockKey];
    }, 700);
  };

  const handleQuickCompleteHabit = (habit: Habit) => {
    withCompletionLock(habit.id, () => {
    if (activeHabit === habit.id) {
      stopTimer();
      setShowTimer(false);
      setActiveHabit(null);
    }

    const points = habit.childHabits.length > 0
      ? completeHabitChild(habit.id, habit.plannedTimeMinutes, selectedDate)
      : completeHabit(habit.id, habit.plannedTimeMinutes, selectedDate);
    setEarnedPoints(points);
    setCompletedHabitId(habit.id);

    setTimeout(() => {
      setCompletedHabitId(null);
      setEarnedPoints(0);
    }, 3000);
    });
  };

  const handleQuickUncompleteHabit = (habit: Habit) => {
    withCompletionLock(habit.id, () => {
      uncompleteHabit(habit.id, selectedDate);
    });
  };

  const handleQuickCompleteChildHabit = (child: Habit) => {
    withCompletionLock(child.id, () => {
      completeHabitChild(child.id, child.plannedTimeMinutes, selectedDate);
    });
  };

  const handleQuickUncompleteChildHabit = (child: Habit) => {
    withCompletionLock(child.id, () => {
      uncompleteHabitChild(child.id, selectedDate);
    });
  };

  // Stop and complete habit from simple timer modal.
  const handleStopAndComplete = () => {
    if (!activeHabit) return;

    const elapsedSeconds = stopTimer();
    const timeSpentMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));

    const points = completeHabit(activeHabit, timeSpentMinutes, selectedDate);
    setEarnedPoints(points);
    setCompletedHabitId(activeHabit);
    setShowTimer(false);
    setActiveHabit(null);

    setTimeout(() => {
      setCompletedHabitId(null);
      setEarnedPoints(0);
    }, 3000);
  };

  const handleAddChildHabit = (parentHabitId: string) => {
    if (!newChildHabitName.trim()) return;

    const parsedMinutes = newChildHabitMinutes.trim() ? Number(newChildHabitMinutes) : null;

    addHabitChild(parentHabitId, {
      name: newChildHabitName.trim(),
      title: newChildHabitName.trim(),
      semanticType: 'valuable',
      plannedPoints: newChildHabitPoints > 0 ? newChildHabitPoints : 1,
      plannedTimeMinutes: parsedMinutes && parsedMinutes > 0 ? parsedMinutes : undefined,
    });

    setNewChildHabitName('');
    setNewChildHabitPoints(1);
    setNewChildHabitMinutes('');
    setActiveAddHabitTarget(null);
  };



  const getChildExecutionType = (child: Habit): ChildExecutionType => {
    const metadata = child as HabitSemanticMetadata;
    const explicitType = metadata.semanticType ?? metadata.executionType;
    if (explicitType) return explicitType;

    // Compatibilidade: itens legados sem tipo explícito continuam como valuable.
    return 'valuable';
  };

  const handleConvertChildType = (childId: string, targetType: ChildExecutionType) => {
    const child = findHabitById(habits, childId);
    if (!child) return;

    const metadata = child as HabitSemanticMetadata;
    const currentType = getChildExecutionType(child);
    if (currentType === targetType) return;

    const currentSnapshot = {
      plannedPoints: Math.max(0, child.plannedPoints ?? 0),
      plannedTimeMinutes: Math.max(0, child.plannedTimeMinutes ?? 0),
    };

    const updates: Partial<Habit> & {
      semanticType?: ChildExecutionType;
      semanticValueBackup?: HabitSemanticMetadata['semanticValueBackup'];
      semanticStructuralBackup?: HabitSemanticMetadata['semanticStructuralBackup'];
    } = {
      semanticType: targetType,
      semanticValueBackup: metadata.semanticValueBackup ?? null,
      semanticStructuralBackup: metadata.semanticStructuralBackup ?? null,
    };

    if (currentType === 'valuable') {
      updates.semanticValueBackup = currentSnapshot;
    }

    if (currentType === 'structural') {
      updates.semanticStructuralBackup = currentSnapshot;
    }

    if (targetType === 'valuable') {
      const restored = updates.semanticValueBackup
        ?? metadata.semanticValueBackup
        ?? {
          plannedPoints: Math.max(1, child.plannedPoints || 1),
          plannedTimeMinutes: Math.max(0, child.plannedTimeMinutes || 0),
        };

      updates.plannedPoints = Math.max(1, restored.plannedPoints || 1);
      updates.plannedTimeMinutes = Math.max(0, restored.plannedTimeMinutes || 0);
      updates.semanticValueBackup = restored;
      updateHabitChild(childId, updates);
      return;
    }

    if (targetType === 'structural') {
      const restored = updates.semanticStructuralBackup
        ?? metadata.semanticStructuralBackup
        ?? { plannedPoints: 0, plannedTimeMinutes: 0 };

      updates.plannedPoints = Math.max(0, restored.plannedPoints || 0);
      updates.plannedTimeMinutes = 0;
      updates.semanticStructuralBackup = restored;
      updateHabitChild(childId, updates);
      return;
    }

    // text/nota: item puramente textual (sem checkbox, sem valor, sem tempo)
    updates.plannedPoints = 0;
    updates.plannedTimeMinutes = 0;
    updateHabitChild(childId, updates);
  };

  const getExecutionChildren = (habit: Habit | null) => {
    if (!habit) {
      return {
        actionable: [] as Habit[],
        textItems: [] as Habit[],
      };
    }

    const orderedChildren = [...habit.childHabits].sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });

    const actionable = orderedChildren.filter((child) => {
      const type = getChildExecutionType(child);
      return type === 'valuable' || type === 'structural';
    });
    const textItems = orderedChildren.filter((child) => getChildExecutionType(child) === 'text');

    return { actionable, textItems };
  };

  const getMembersForSequence = (sequenceId: string) => {
    return sequenceMemberships
      .filter((membership) => membership.sequenceId === sequenceId)
      .sort((a, b) => a.position - b.position);
  };
  const canSkipSequence = (sequence: typeof cycleSequences[number]) => {
    const members = getMembersForSequence(sequence.id);
    return selectedDate.toDateString() === new Date().toDateString() && sequence.isActive && members.length > 0 &&
      (!sequence.lastCompletedDate || new Date(sequence.lastCompletedDate).toDateString() !== selectedDate.toDateString()) &&
      !members.some((member) => {
        const habit = findHabitById(habits, member.habitId);
        return habit?.completions.some((completion) => new Date(completion.completionDate).toDateString() === selectedDate.toDateString()) ||
          habit?.isInProgress || (activeNativeSession && (activeNativeSession.coreHabitId === member.habitId || (!activeNativeSession.coreHabitId && activeNativeSession.templateId === habit?.sourceRefId)));
      });
  };
  const handleSkipSequence = (sequenceId: string) => {
    const sequence = cycleSequences.find((item) => item.id === sequenceId);
    if (!sequence || !canSkipSequence(sequence)) return;
    try { skipCycleSequence(sequenceId, selectedDate); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível pular a vez.'); }
  };

  const sequenceSummaries = cycleSequences.filter((sequence) => sequence.status !== 'PLANNING').map((sequence, index) => {
    const members = getMembersForSequence(sequence.id);
    const totalMembers = members.length;
    const displayPosition = getSequencePositionForDate(sequence, totalMembers, selectedDate);
    const currentMembership = totalMembers > 0
      ? members[displayPosition]
      : null;
    const currentHabit = currentMembership ? findHabitById(habits, currentMembership.habitId) : null;

    return {
      sequence,
      displayOrder: sequence.displayOrder ?? habits.length + index + 1,
      totalMembers,
      currentHabit,
      currentHabitName: currentHabit?.name || 'Sem ciclo atual',
      currentPositionLabel: totalMembers > 0
        ? `${displayPosition + 1}/${totalMembers}`
        : '0/0',
    };
  }).sort((a, b) => a.displayOrder - b.displayOrder);

  const selectedSequenceSummary = selectedSequenceId
    ? sequenceSummaries.find((item) => item.sequence.id === selectedSequenceId) || null
    : null;

  const selectedSequenceMembers = selectedSequenceSummary
    ? getMembersForSequence(selectedSequenceSummary.sequence.id).map((membership) => ({
        membership,
        habit: findHabitById(habits, membership.habitId),
      }))
    : [];

  const availableStandaloneHabits = habits
    .filter((habit) => !habit.controlledBySequenceId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const standaloneHabitsForDate = useMemo(() => {
    const seenIds = new Set<string>();

    return habitsForDate
      .filter((habit) => !habit.controlledBySequenceId)
      .filter((habit) => {
        if (seenIds.has(habit.id)) {
          return false;
        }
        seenIds.add(habit.id);
        return true;
      });
  }, [habitsForDate]);
  const visibleSequenceIdsForDate = useMemo(() => new Set(
    habitsForDate
      .map((habit) => habit.controlledBySequenceId)
      .filter((sequenceId): sequenceId is string => Boolean(sequenceId))
  ), [habitsForDate]);

  const mixedCards = (() => {
    const habitCards = standaloneHabitsForDate.map((habit) => ({
      type: 'habit' as const,
      id: habit.id,
      order: habit.sortOrder ?? 0,
      habit,
    }));

    const sequenceCards = sequenceSummaries
      .filter((summary) => summary.sequence.isActive && visibleSequenceIdsForDate.has(summary.sequence.id))
      .map((summary) => ({
        type: 'sequence' as const,
        id: summary.sequence.id,
        order: summary.displayOrder,
        summary,
      }));

    return [...habitCards, ...sequenceCards].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      if (a.type === b.type) return a.id.localeCompare(b.id);
      return a.type === 'sequence' ? -1 : 1;
    });
  })();

  const isMixedCardCompleted = (card: (typeof mixedCards)[number]): boolean => {
    if (card.type === 'habit') {
      return isHabitCompleted(card.habit);
    }

    const currentHabit = card.summary?.currentHabit;
    if (!currentHabit) return false;
    return isHabitCompleted(currentHabit);
  };

  const displayedMixedCards = cyclesViewMode === 'ordered'
    ? mixedCards
    : [
      ...mixedCards.filter((card) => !isMixedCardCompleted(card)),
      ...mixedCards.filter((card) => isMixedCardCompleted(card)),
    ];

  const allAreasForEdit = useMemo(() => {
    const elementOrder = ['terra', 'fogo', 'agua', 'ar'] as const;

    return elementOrder.flatMap((elementId) => [
      ...AREAS.filter((area) => area.elementId === elementId),
      ...customAreas.filter((area) => area.elementId === elementId),
    ]);
  }, [customAreas]);

  const getMergedSubareasForArea = (areaId: string) => {
    const selectedArea = allAreasForEdit.find((area) => area.id === areaId);
    const builtInSubareas = (selectedArea?.subareas || []).filter((subarea) => subarea.parentId === areaId);
    const persistedSubareas = customSubareas[areaId] || [];

    const uniqueById = new Map(
      [...builtInSubareas, ...persistedSubareas].map((subarea) => [subarea.id, subarea])
    );

    return Array.from(uniqueById.values());
  };

  const handleOpenEditHabit = (habitId: string, isChild = false) => {
    const habit = findHabitById(habits, habitId);
    if (!habit) return;

    setEditingHabitId(habitId);
    setEditingHabitIsChild(isChild);
    setEditName(habit.name);
    setEditArea(habit.areaId || 'none');
    setEditSubarea(habit.subareaId || 'none');
    setEditPoints(habit.plannedPoints || 1);
    setEditDaysOfWeek(habit.recurrenceConfig.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]);
    const totalMinutes = habit.plannedTimeMinutes || 0;
    setEditTimeMinutes(Math.floor(totalMinutes));
    setEditTimeSeconds(Math.round((totalMinutes % 1) * 60));
    setHasTime(totalMinutes > 0);
    setShowQuickEdit(true);
  };

  const handleSaveEdit = () => {
    if (!editingHabitId || !editName.trim()) return;

    const habit = findHabitById(habits, editingHabitId);
    if (!habit) return;

    const isAggregatorLocked = habit.childHabits.length > 0;
    const nextPlannedTimeMinutes = isAggregatorLocked
      ? habit.plannedTimeMinutes
      : (hasTime && (editTimeMinutes > 0 || editTimeSeconds > 0)
        ? editTimeMinutes + (editTimeSeconds / 60)
        : 0);

    const nextAreaId = editArea === 'none' ? habit.areaId : editArea;
    const nextSubareaId = isAggregatorLocked
      ? habit.subareaId
      : (editSubarea === 'none' ? null : editSubarea || null);
    
    const payload: Partial<Habit> = {
      name: editName.trim(),
      title: editName.trim(),
      areaId: nextAreaId,
      subareaId: nextSubareaId,
      recurrenceType: 'DAILY',
      recurrenceConfig: {
        ...habit.recurrenceConfig,
        daysOfWeek: editDaysOfWeek,
      },
      plannedPoints: isAggregatorLocked ? habit.plannedPoints : Math.max(1, editPoints),
      plannedTimeMinutes: nextPlannedTimeMinutes,
      elementId: (allAreasForEdit.find((area) => area.id === nextAreaId)?.elementId || habit.elementId),
    };

    if (editingHabitIsChild) {
      updateHabitChild(editingHabitId, payload);
    } else {
      updateHabit(editingHabitId, payload);
    }

    setShowQuickEdit(false);
    setEditingHabitId(null);
    setEditingHabitIsChild(false);
    setEditName('');
    setEditArea('none');
    setEditSubarea('none');
    setEditDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setEditPoints(1);
    setEditTimeMinutes(0);
    setEditTimeSeconds(0);
    setHasTime(false);
  };

  // Get active habit data
  const activeHabitData = activeHabit ? findHabitById(habits, activeHabit) : null;
  const executionChildren = getExecutionChildren(activeHabitData);
  const executionActionableChildren = executionChildren.actionable;
  const executionTextChildren = executionChildren.textItems;
  const executionCurrentTask = executionActionableChildren[executionCurrentIndex] || null;
  const executionPreviousTask = executionCurrentIndex > 0
    ? executionActionableChildren[executionCurrentIndex - 1]
    : null;
  const executionPreviousTaskCompletion = executionPreviousTask
    ? getCompletionForDate(executionPreviousTask)
    : undefined;
  const executionPreviousTimingFromSession = executionPreviousTask
    ? executionTimings[executionPreviousTask.id]
    : undefined;
  const executionNextTask = executionActionableChildren.find(
    (task, index) => index > executionCurrentIndex && !isHabitCompleted(task)
  ) || null;
  const executionCompletedCount = executionActionableChildren.filter((child) => isHabitCompleted(child)).length;
  const executionProgressPercent = executionActionableChildren.length > 0
    ? (executionCompletedCount / executionActionableChildren.length) * 100
    : 0;
  const executionTaskElapsedSeconds = useMemo(() => {
    if (!showExecutionMode || executionTaskStartCycleSeconds == null) return 0;
    return Math.max(0, timer.elapsedSeconds - executionTaskStartCycleSeconds);
  }, [showExecutionMode, executionTaskStartCycleSeconds, timer.elapsedSeconds]);

  useEffect(() => {
    if (!showExecutionMode || executionActionableChildren.length === 0) return;

    const hasPending = executionActionableChildren.some((task) => !isHabitCompleted(task));
    if (!hasPending) {
      finalizeExecutionCycle(executionEarnedPointsRef.current);
      return;
    }

    const currentTask = executionActionableChildren[executionCurrentIndex];
    if (currentTask && !isHabitCompleted(currentTask)) return;

    const nextPendingAfterCurrent = executionActionableChildren.findIndex(
      (task, index) => index > executionCurrentIndex && !isHabitCompleted(task)
    );

    const firstPending = executionActionableChildren.findIndex(
      (task) => !isHabitCompleted(task)
    );

    const nextIndex = nextPendingAfterCurrent >= 0 ? nextPendingAfterCurrent : firstPending;
    if (nextIndex >= 0 && nextIndex !== executionCurrentIndex) {
      setExecutionCurrentIndex(nextIndex);
      const nextTask = executionActionableChildren[nextIndex] ?? null;
      beginExecutionTaskTracking(nextTask, timer.elapsedSeconds);
    }
  }, [
    showExecutionMode,
    executionActionableChildren,
    executionCurrentIndex,
    timer.elapsedSeconds,
    beginExecutionTaskTracking,
    finalizeExecutionCycle,
    isHabitCompleted,
  ]);

  // Moon phase and season
  const moonPhase = getMoonPhase(selectedDate);
  const season = getSeason(selectedDate, { latitude: userLatitude });

  // Stats
  const completedToday = habitsForDate.filter(isHabitCompleted).length;
  const totalToday = habitsForDate.length;
  const progressToday = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // Top streaks
  const topStreaks = [...habits]
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3)
    .filter((h) => h.streak > 0);

  const isAddTargetForHabit = (habitId: string) => activeAddHabitTarget === habitId;

  const renderChildHabits = (childHabits: Habit[], depth = 0, parentHabitId?: string) => {
    const sortedHabits = [...childHabits].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Helper para renderizar badges de área/subárea de um child
    const renderChildAreaBadges = (child: Habit) => {
      const childType = getChildExecutionType(child);
      const childArea = allAreasForEdit.find((area) => area.id === child.areaId) || getAreaById(child.areaId);
      const childAreaDisplayName = childArea?.name || 'Sem Categoria';
      const childSubarea = child.subareaId ? getAreaById(child.subareaId) : undefined;
      const childHasChildren = child.childHabits.length > 0;
      
      // Se tem filhos, calcula e mostra badges agregados dos netos
      if (childHasChildren && child.areaId) {
        const getChildAggregatedAreas = (habits: Habit[]): Record<string, { points: number; subareaId?: string | null }> => {
          const areaTotals: Record<string, { points: number; subareaIds: Set<string | null> }> = {};
          const processHabit = (h: Habit) => {
            if (h.childHabits.length > 0) {
              h.childHabits.forEach(processHabit);
            } else {
              const value = h.plannedPoints || 0;
              if (h.areaId && value > 0) {
                if (!areaTotals[h.areaId]) {
                  areaTotals[h.areaId] = { points: 0, subareaIds: new Set() };
                }
                areaTotals[h.areaId].points += value;
                areaTotals[h.areaId].subareaIds.add(h.subareaId || null);
              }
            }
          };
          habits.forEach(processHabit);
          
          // Converter para formato final: se há apenas uma subarea única, incluir; senão, sem subarea
          const result: Record<string, { points: number; subareaId?: string | null }> = {};
          for (const [areaId, data] of Object.entries(areaTotals)) {
            result[areaId] = {
              points: data.points,
              subareaId: data.subareaIds.size === 1 ? Array.from(data.subareaIds)[0] : undefined
            };
          }
          return result;
        };
        
        const childAggregatedAreas = getChildAggregatedAreas(child.childHabits);
        const childAggregatedAreaList = Object.entries(childAggregatedAreas)
          .sort((a, b) => {
            if (a[0] === 'sem-categoria') return 1;
            if (b[0] === 'sem-categoria') return -1;
            return b[1].points - a[1].points;
          });

        return childAggregatedAreaList.map(([areaId, data]) => {
          const aggArea = allAreasForEdit.find((a) => a.id === areaId) || AREAS.find((a) => a.id === areaId);
          const aggSubarea = data.subareaId ? getAreaById(data.subareaId) : undefined;
          if (!aggArea) return null;
          const badgeLabel = `+${Math.round(data.points)} ${aggArea.name}${aggSubarea ? ` | ${aggSubarea.name}` : ''}`;
          return (
            <Badge 
              key={areaId}
              variant="outline"
              className="text-[9px] truncate max-w-full sm:max-w-xs"
              style={{ 
                backgroundColor: `${aggArea.color}10`, 
                borderColor: `${aggArea.color}50`,
                color: aggArea.color 
              }}
              title={badgeLabel}
            >
              {badgeLabel}
            </Badge>
          );
        });
      }
      
      // Se não tem filhos, mostra badge próprio
      if (child.areaId && childType === 'valuable') {
        const badgeLabel = `+${Math.round(child.plannedPoints)} ${childAreaDisplayName}${childSubarea ? ` | ${childSubarea.name}` : ''}`;
        return (
          <Badge
            key="own-area"
            variant="outline"
            className="text-[9px] truncate max-w-full sm:max-w-xs"
            style={{
              backgroundColor: `${(childArea?.color || '#808080')}20`,
              borderColor: `${(childArea?.color || '#808080')}80`,
              color: childArea?.color || '#808080',
            }}
            title={badgeLabel}
          >
            {badgeLabel}
          </Badge>
        );
      }
      return null;
    };

    return (
      <div className={depth > 0 ? 'ml-4 border-l border-white/10 pl-3' : ''}>
        {parentHabitId && draggedChildHabit?.parentId === parentHabitId && (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              handlePromoteDragOver(parentHabitId);
            }}
            onDrop={(event) => {
              event.preventDefault();
              handlePromoteDrop(parentHabitId);
            }}
            className={`mb-2 rounded-lg border border-dashed px-3 py-1.5 text-[11px] transition-colors ${
              dragOverPromoteParentId === parentHabitId
                ? 'border-mystic-gold/70 bg-mystic-gold/15 text-mystic-gold'
                : 'border-white/20 text-white/50'
            }`}
          >
            Solte aqui para mover para o mesmo nivel do pai
          </div>
        )}
        {sortedHabits.map((child) => {
          const childType = getChildExecutionType(child);
          const childIsCheckable = childType === 'valuable' || childType === 'structural';
          const childCompleted = isHabitCompleted(child);
          const childCompletion = getCompletionForDate(child);
          const hasChildren = child.childHabits.length > 0;
          const childExpanded = child.isExpanded ?? false;

          return (
            <div key={child.id} className="space-y-2">
              <div
                draggable
                onDragStart={() => {
                  if (parentHabitId) {
                    handleChildHabitDragStart(child.id, parentHabitId);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (parentHabitId) {
                    handleChildHabitDragOver(child.id, parentHabitId);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (parentHabitId) {
                    handleChildHabitDrop(child.id, parentHabitId, sortedHabits);
                  }
                }}
                onDragEnd={handleChildHabitDragEnd}
                className={`flex items-center gap-2 p-2 rounded-lg bg-black/20 cursor-grab active:cursor-grabbing ${
                  dragOverChildHabitId === child.id ? 'border border-mystic-gold/60 bg-mystic-gold/10' : ''
                }`}
              >
                {childIsCheckable ? (
                  !childCompleted ? (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleQuickCompleteChildHabit(child);
                      }}
                      className="w-5 h-5 rounded border flex items-center justify-center border-white/30 hover:border-white/50"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleQuickUncompleteChildHabit(child);
                      }}
                      className="w-5 h-5 rounded border flex items-center justify-center bg-mystic-gold border-mystic-gold hover:bg-mystic-gold/80"
                      aria-label="Desmarcar conclusão" title="Desmarcar"
                    >
                      <X className="w-3 h-3 text-black" />
                    </button>
                  )
                ) : (
                  <span className="w-5 h-5" aria-hidden="true" />
                )}

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${childCompleted ? 'line-through text-white/50' : 'text-white'}`}>
                    {child.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                    {renderChildAreaBadges(child)}

                    {childType === 'valuable' && child.plannedTimeMinutes > 0 && (
                      <Badge variant="outline" className="bg-white/5 text-white/60 text-[9px]">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(child.plannedTimeMinutes)}
                      </Badge>
                    )}
                  </div>
                  {childIsCheckable && childCompleted && childCompletion && childCompletion.timeSpentMinutes > 0 && (
                    <div className="mt-1 text-[10px] text-mystic-gold">
                      Completado em {childCompletion.timeSpentMinutes}min
                    </div>
                  )}
                </div>

                {hasChildren && (
                  <button
                    onClick={() => toggleHabitChildExpansion(child.id)}
                    className="text-white/40 hover:text-white/70"
                  >
                    {childExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}

                <div className="flex items-center gap-1">
                  {childType !== 'text' && (
                    <button
                      onClick={() => setActiveAddHabitTarget(child.id)}
                      className="text-white/40 hover:text-white/70"
                      title="Adicionar subitem"
                    >
                      <PlusCircle className="w-3 h-3" />
                    </button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-white/10" title="Mais opções">
                        <MoreVertical className="w-3 h-3 text-white/40" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="cycle-menu bg-mystic-purple border-white/10">
                      <DropdownMenuItem onClick={() => handleOpenEditHabit(child.id, true)}>
                        <Edit2 className="w-3 h-3 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => moveHabitChildUp(child.id)}>
                        <ArrowUp className="w-3 h-3 mr-2" />
                        Mover para cima
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => moveHabitChildDown(child.id)}>
                        <ArrowDown className="w-3 h-3 mr-2" />
                        Mover para baixo
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleConvertChildType(child.id, 'valuable')}>
                        Definir como Pontuável
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleConvertChildType(child.id, 'structural')}>
                        Definir como Checklist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleConvertChildType(child.id, 'text')}>
                        Definir como Nota
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteHabitChild(child.id)} className="text-red-400">
                        <Trash2 className="w-3 h-3 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {childType !== 'text' && isAddTargetForHabit(child.id) && (
                <div className="flex flex-wrap items-center gap-2 pl-7">
                  <Input
                    aria-label="Nome do subitem" value={newChildHabitName}
                    onChange={(e) => setNewChildHabitName(e.target.value)}
                    placeholder="Novo subciclo..."
                    className="flex-1 h-8 text-sm bg-white/5 border-white/10"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddChildHabit(child.id);
                      if (e.key === 'Escape') setActiveAddHabitTarget(null);
                    }}
                  />
                  <Input
                    type="number"
                    min={1}
                    aria-label="Pontos planejados do subitem" value={newChildHabitPoints}
                    onChange={(e) => setNewChildHabitPoints(Number(e.target.value))}
                    placeholder="Pts"
                    className="w-20 h-8 text-sm bg-white/5 border-white/10"
                  />
                  <Input
                    type="number"
                    min={0}
                    aria-label="Minutos planejados do subitem" value={newChildHabitMinutes}
                    onChange={(e) => setNewChildHabitMinutes(e.target.value)}
                    placeholder="Min"
                    className="w-20 h-8 text-sm bg-white/5 border-white/10"
                  />
                  <Button size="sm" className="h-8 px-2" onClick={() => handleAddChildHabit(child.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {hasChildren && childExpanded && (
                <div className="mt-2">
                  {renderChildHabits(child.childHabits, depth + 1, child.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Computed variables for edit form
  const editingHabit = editingHabitId ? findHabitById(habits, editingHabitId) : null;
  const isEditAggregatorLocked = Boolean(editingHabit?.childHabits.length);
  const selectedAreaForEdit = editArea !== 'none' ? allAreasForEdit.find((area) => area.id === editArea) : null;
  const dynamicSubareasForEdit = selectedAreaForEdit ? getMergedSubareasForArea(selectedAreaForEdit.id) : [];

  // Presentation filters never change the scheduled collection or its stored order.
  const visibleCycleCards = displayedMixedCards.filter((card) => {
    const habit = card.type === 'habit' ? card.habit : card.summary.currentHabit;
    const area = habit ? allAreasForEdit.find((entry) => entry.id === habit.areaId) : undefined;
    return matchesCycleFilters({
      text: [habit?.name, habit?.description, area?.name, card.type === 'sequence' ? card.summary.sequence.name : ''].filter(Boolean).join(' '),
      element: area?.elementId ?? habit?.elementId,
      completed: isMixedCardCompleted(card),
    }, cycleFilters);
  });
  const visibleSequenceSummaries = sequenceSummaries.filter((item) => normalizeCycleSearch([item.sequence.name, item.sequence.description, item.currentHabitName].filter(Boolean).join(' ')).includes(normalizeCycleSearch(sequenceQuery)));
  const canReorderVisibleCards = !hasCycleFilters(cycleFilters) && cyclesViewMode === 'ordered';

  return (
    <AppLayout showAura={false}>
      <MotionConfig reducedMotion="user">
      <div className="cycles-workspace">
      <header className="cycles-header">
        <div className="cycles-heading"><span className="cycles-emblem"><ArcaneIcon name="ciclo" size={30} /></span><div><h2>Ciclos</h2><p>Hábitos que aparecem nos dias da sua recorrência.</p><small>{habits.length} ciclos cadastrados</small></div></div>
        <Button ref={newCycleTriggerRef} onClick={() => setShowQuickCreateCycle(true)} className="cycle-primary"><Plus size={18} aria-hidden="true" />Novo ciclo</Button>
      </header>
      <button type="button" className="cycle-insights-shortcut" onClick={() => {
        const section = insightsRef.current;
        if (!section) return;
        section.open = true;
        section.querySelector('summary')?.focus({ preventScroll: true });
        section.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      }}><ArcaneIcon name="conquista" size={19} />Ver pontuação elemental<ChevronDown size={18} aria-hidden="true" /></button>
      {/* Day Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cycle-day-panel"
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 bg-mystic-gold/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-24 h-24 bg-mystic-arcane/10 rounded-full blur-2xl" />
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Mostrar sete dias anteriores" onClick={goToPreviousDay}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <button 
            onClick={goToToday}
            aria-label={`Data selecionada: ${selectedDate.toLocaleDateString('pt-BR')}. Voltar para hoje`}
            className="text-center hover:opacity-80 transition-opacity"
          >
            <p className="text-xs text-white/50 uppercase tracking-wider">{WEEKDAYS[selectedDate.getDay()]}</p>
            <p className="font-mystic text-lg text-mystic-gold">
              {selectedDate.getDate()} {selectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </p><small className="text-xs text-white/60">Voltar para hoje</small>
          </button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Mostrar próximos sete dias" onClick={goToNextDay}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Day shortcuts + full date picker */}
        <div ref={dayShortcutsContainerRef} className="cycle-calendar-rail" role="group" aria-label="Dias do calendário: selecione para expandir">
          {dayShortcuts.map((offset) => {
            const date = new Date(visibleDaysCenterDate);
            date.setDate(date.getDate() + offset);
            const active = isSameDay(selectedDate, date);
            const isTodayShortcut = isSameDay(date, new Date());

            return <ExpandedDayCard key={date.toDateString()} date={date} selected={active} today={isTodayShortcut}
              completed={completedToday} total={totalToday} preview={active ? displayedMixedCards.slice(0, 2).map(card => card.type === 'habit' ? card.habit.name : card.summary.sequence.name) : []} onSelect={() => selectRelativeVisibleDay(offset)}
              buttonRef={active ? selectedDayButtonRef : null} />;
          })}
        </div>
        <div className="cycle-calendar-tools">
          <span>Escolha um dia para abrir sua rotina</span>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="cycle-calendar-picker"
                aria-label="Selecionar qualquer data"
              >
                <Calendar className="w-3.5 h-3.5" />
                Escolher data
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-white/10 bg-void/95" align="end">
              <DatePickerCalendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  const normalized = normalizeDate(date);
                  setSelectedDate(normalized);
                  setVisibleDaysCenterDate(normalized);
                }}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Moon Phase & Season */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <button
            type="button"
            onClick={() => navigate('/lua')}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5 transition-colors text-left"
            title="Abrir pagina da Lua"
          >
            <span className="text-2xl"><ArcaneIcon name="lua" /></span>
            <div className="text-left">
              <p className="text-[10px] text-white/40">Fase Lunar</p>
              <p className="text-xs">{moonPhase.name}</p>
            </div>
          </button>
          <div className="w-px h-8 bg-white/10" />
          <button
            type="button"
            onClick={() => navigate('/estacoes')}
            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5 transition-colors text-left"
            title="Abrir pagina da Estacao"
          >
            <span className="text-2xl"><ArcaneIcon name="estacoes" /></span>
            <div className="text-left">
              <p className="text-[10px] text-white/40">Estação</p>
              <p className="text-xs">{season.name}</p>
            </div>
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Ciclos concluídos nesta data</span>
            <span className="text-mystic-gold">{completedToday}/{totalToday} ciclos</span>
          </div>
          <div role="progressbar" aria-label="Conclusão dos ciclos da data selecionada" aria-valuemin={0} aria-valuemax={totalToday || 1} aria-valuenow={completedToday} className="h-2 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToday}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-mystic-gold to-orange-400"
            />
          </div>
        </div>
      </motion.div>

      <div className="cycles-view-switch" role="group" aria-label="Visão de Ciclos">
        <button type="button" aria-pressed={workspaceView === 'routine'} aria-controls="cycle-routine-panel" onClick={() => setWorkspaceView('routine')}><ArcaneIcon name="ritual" size={20} />Rotina<span>{displayedMixedCards.length}</span></button>
        <button type="button" aria-pressed={workspaceView === 'sequences'} aria-controls="cycle-library-panel" onClick={() => setWorkspaceView('sequences')}><ArcaneIcon name="ciclo" size={20} />Sequências<span>{sequenceSummaries.length}</span></button>
      </div>
      <section id="cycle-routine-panel" aria-label="Rotina da data selecionada" hidden={workspaceView !== 'routine'}>
      {/* Treinos do dia (módulo de Treino/Fitness) */}
      {workoutsForSelectedDate.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mystic text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-mystic-gold" />
              Treinos do dia
            </h3>
            <Badge variant="outline" className="bg-white/5">
              {workoutsForSelectedDate.length} {workoutsForSelectedDate.length === 1 ? 'treino' : 'treinos'}
            </Badge>
          </div>
          <div className="space-y-2">
            {workoutsForSelectedDate.map((workout) => (
              <WorkoutListCard
                key={workout.id}
                workout={workout}
                session={workout.lastSessionId ? getWorkoutSessionById(workout.lastSessionId) : undefined}
                rating={workout.lastSessionId ? getSessionRating(workout.lastSessionId) : undefined}
                onAction={() => handleWorkoutCardAction(workout)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Habits List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {displayedMixedCards.length > 0 && <div className="cycle-list-heading">
          <h3 className="font-mystic text-lg">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? 'Ciclos de Hoje' 
              : `Ciclos de ${selectedDate.toLocaleDateString('pt-BR')}`}
          </h3>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-white/15 bg-white/5 p-0.5 flex items-center gap-0.5">
              <button
                type="button"
                aria-pressed={cyclesViewMode === 'ordered'} onClick={() => setCyclesViewMode('ordered')}
                className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                  cyclesViewMode === 'ordered'
                    ? 'bg-mystic-gold/20 text-mystic-gold border border-mystic-gold/30'
                    : 'text-white/65 hover:bg-white/10'
                }`}
              >
                Ordem
              </button>
              <button
                type="button"
                aria-pressed={cyclesViewMode === 'pending-first'} onClick={() => setCyclesViewMode('pending-first')}
                className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                  cyclesViewMode === 'pending-first'
                    ? 'bg-mystic-gold/20 text-mystic-gold border border-mystic-gold/30'
                    : 'text-white/65 hover:bg-white/10'
                }`}
              >
                Pendentes primeiro
              </button>
            </div>

            <Badge variant="outline" className="bg-white/5">
              {displayedMixedCards.length} {displayedMixedCards.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
        </div>

        }
        {displayedMixedCards.length > 0 && <CycleFilters filters={cycleFilters} onChange={setCycleFilters} shown={visibleCycleCards.length} total={displayedMixedCards.length} />}
        {displayedMixedCards.length > 0 && !canReorderVisibleCards && <p className="cycle-reorder-hint">Para reorganizar, limpe os filtros e selecione Ordem.</p>}
        <AnimatePresence mode="popLayout">
          {visibleCycleCards.length > 0 ? (
            <div className="space-y-3">
              {visibleCycleCards.map((card) => {
                if (card.type === 'sequence') {
                  const item = card.summary;
                  if (!item) return null;
                  const sequenceHabit = item.currentHabit;

                  if (!sequenceHabit) {
                    return (
                      <motion.div
                        key={`sequence-${item.sequence.id}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable={canReorderVisibleCards}
                        onDragStart={(event) => handleMixedCardDragStart(event as unknown as React.DragEvent<HTMLDivElement>, 'sequence', item.sequence.id)}
                        onDragOver={(event) => handleMixedCardDragOver(event as unknown as React.DragEvent<HTMLDivElement>, 'sequence', item.sequence.id)}
                        onDrop={() => canReorderVisibleCards && handleMixedCardDrop('sequence', item.sequence.id)}
                        onDragEnd={handleMixedCardDragEnd}
                        className={`cycle-routine-card relative p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                          dragOverMixedCard?.type === 'sequence' && dragOverMixedCard.id === item.sequence.id
                            ? 'border-mystic-gold/60 bg-mystic-gold/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-white/80">{item.sequence.name}</p>
                          <Badge variant="outline" className="bg-white/5 text-[10px]">
                            Sem ciclo atual
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  }

                  const isFitnessSequence = sequenceHabit.sourceModule === 'modulo_treino';
                  const completed = isHabitCompleted(sequenceHabit);
                  const completion = getCompletionForDate(sequenceHabit);
                  const childHabits = sequenceHabit.childHabits || [];
                  const completedChildHabits = childHabits.filter(isHabitCompleted).length;
                  const seqArea = allAreasForEdit.find((entry) => entry.id === sequenceHabit.areaId) || getAreaById(sequenceHabit.areaId);
                  const seqAreaDisplayName = seqArea?.name || 'Sem Categoria';
                  const seqSubarea = sequenceHabit.subareaId ? getAreaById(sequenceHabit.subareaId) : undefined;
                  const seqElement = seqArea ? ELEMENTS[seqArea.elementId] : ELEMENTS[sequenceHabit.elementId];
                  const showSequenceElementBadge = sequenceHabit.areaId !== 'sem-categoria';

                  return (
                    <motion.div
                      key={`sequence-${item.sequence.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable={canReorderVisibleCards && !isFitnessSequence}
                      onDragStart={(event) => handleMixedCardDragStart(event as unknown as React.DragEvent<HTMLDivElement>, 'sequence', item.sequence.id)}
                      onDragOver={(event) => handleMixedCardDragOver(event as unknown as React.DragEvent<HTMLDivElement>, 'sequence', item.sequence.id)}
                      onDrop={() => canReorderVisibleCards && handleMixedCardDrop('sequence', item.sequence.id)}
                      onDragEnd={handleMixedCardDragEnd}
                      className={`cycle-routine-card relative p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                        dragOverMixedCard?.type === 'sequence' && dragOverMixedCard.id === item.sequence.id
                          ? 'border-mystic-gold/60 bg-mystic-gold/10'
                          : completed
                            ? 'bg-mystic-gold/5 border-mystic-gold/20'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                      } ${
                        draggedMixedCard?.type === 'sequence' && draggedMixedCard.id === item.sequence.id
                          ? 'opacity-50 scale-[0.99]'
                          : ''
                      }`}
                    >
                      {sequenceHabit.streak > 0 && (
                        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold z-10">
                          <Flame className="w-3 h-3" />
                          {sequenceHabit.streak}
                        </div>
                      )}

                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="break-words font-medium">{item.sequence.name}</p><p className="mt-1 text-xs text-white/50">Passo {item.currentPositionLabel}</p></div>
                        <button type="button" title="Pular a vez" aria-label={`Pular a vez de ${item.sequence.name}`} disabled={!canSkipSequence(item.sequence)} onClick={() => handleSkipSequence(item.sequence.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-violet-300 hover:bg-white/5 disabled:opacity-30"><SkipForward size={15} /></button>{isFitnessSequence && <DropdownMenu><DropdownMenuTrigger asChild><button aria-label={`Ações de ${item.sequence.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-white/10"><MoreVertical size={17} /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="cycle-menu bg-mystic-purple border-white/10"><DropdownMenuItem onClick={() => navigate('/fitness')}><Edit2 size={16} className="mr-2" />Editar sequência em Treinos</DropdownMenuItem><DropdownMenuItem className="text-red-400" onClick={() => navigate('/fitness')}><Trash2 size={16} className="mr-2" />Excluir sequência em Treinos</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
                      </div>
                      {isFitnessSequence ? <FitnessHabitWidget habit={sequenceHabit} date={selectedDate} embedded showAdministrativeActions={false} /> : (
                      <div className="flex items-start gap-3">
                        {!completed ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleQuickCompleteHabit(sequenceHabit);
                            }}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-mystic-gold/20 flex items-center justify-center flex-shrink-0 transition-colors"
                            aria-label="Marcar ciclo como completo" title="Marcar como completo"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleQuickUncompleteHabit(sequenceHabit);
                            }}
                            className="w-8 h-8 rounded-lg bg-mystic-gold/20 hover:bg-mystic-gold/30 flex items-center justify-center flex-shrink-0"
                            aria-label="Desmarcar conclusão" title="Desmarcar"
                          >
                            <X className="w-4 h-4 text-mystic-gold" />
                          </button>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium ${completed ? 'line-through text-white/50' : 'text-white'}`}>
                                {sequenceHabit.name}
                              </p>
                              {sequenceHabit.description && (
                                <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{sequenceHabit.description}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {showSequenceElementBadge && (
                                <span
                                  className="w-7 h-7 rounded-full border flex items-center justify-center text-base leading-none"
                                  style={{
                                    backgroundColor: `${seqElement.color}1f`,
                                    borderColor: `${seqElement.color}66`,
                                  }}
                                  title={seqElement.name}
                                >
                                  <ElementIcon element={seqElement.id} />
                                </span>
                              )}
                              {!completed && (
                                <button
                                  onClick={() => setActiveAddHabitTarget(sequenceHabit.id)}
                                  className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70"
                                  title="Adicionar subitem"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                </button>
                              )}

                              {!completed && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button aria-label="Mais ações do ciclo" className="p-1 rounded-lg hover:bg-white/10">
                                      <MoreVertical className="w-4 h-4 text-white/40" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="cycle-menu bg-mystic-purple border-white/10">
                                    <DropdownMenuItem
                                      disabled={!canReorderVisibleCards} onClick={() => handleMoveMixedCard('sequence', item.sequence.id, 'up')}
                                    >
                                      <ArrowUp className="w-4 h-4 mr-2" />
                                      Mover para cima
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      disabled={!canReorderVisibleCards} onClick={() => handleMoveMixedCard('sequence', item.sequence.id, 'down')}
                                    >
                                      <ArrowDown className="w-4 h-4 mr-2" />
                                      Mover para baixo
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => removeHabitFromSequence(item.sequence.id, sequenceHabit.id)}
                                    >
                                      <X className="w-4 h-4 mr-2" />
                                      Remover da sequência
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => duplicateHabit(sequenceHabit.id)}>
                                      <ListTodo className="w-4 h-4 mr-2" />
                                      Duplicar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleOpenEditHabit(sequenceHabit.id)}>
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => deleteHabit(sequenceHabit.id)} className="text-red-400">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] min-w-0">
                            <Badge variant="outline" className="bg-mystic-arcane/20 border-mystic-arcane/40 text-mystic-gold text-[10px] truncate max-w-full sm:max-w-xs">
                              Sequência: {item.sequence.name} ({item.currentPositionLabel})
                            </Badge>
                            {seqAreaDisplayName && (
                              <Badge
                                variant="outline"
                                className="text-[10px] truncate max-w-full sm:max-w-xs"
                                style={{
                                  backgroundColor: `${(seqArea?.color || '#808080')}20`,
                                  borderColor: `${(seqArea?.color || '#808080')}80`,
                                  color: seqArea?.color || '#808080',
                                }}
                                title={`+${Math.round(sequenceHabit.plannedPoints || 0)} ${seqAreaDisplayName}${seqSubarea ? ` | ${seqSubarea.name}` : ''}`}
                              >
                                +{Math.round(sequenceHabit.plannedPoints || 0)} {seqAreaDisplayName}
                                {seqSubarea ? ` | ${seqSubarea.name}` : ''}
                              </Badge>
                            )}
                            {sequenceHabit.plannedTimeMinutes > 0 && (
                              <Badge variant="outline" className="bg-white/5 text-white/60 text-[10px] flex-shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(sequenceHabit.plannedTimeMinutes)}
                              </Badge>
                            )}
                          </div>

                          {!completed && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                onClick={() => handleStartHabit(sequenceHabit.id)}
                                className="h-7 px-2 text-xs bg-mystic-arcane hover:bg-mystic-arcane/80"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Iniciar
                              </Button>
                            </div>
                          )}

                          {childHabits.length > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => toggleHabitChildExpansion(sequenceHabit.id)}
                                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/70"
                              >
                                {sequenceHabit.isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                                {completedChildHabits}/{childHabits.length} subitens
                              </button>
                              <div className="flex-1 h-1 bg-black/30 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-mystic-arcane rounded-full"
                                  style={{
                                    width: `${childHabits.length > 0 ? (completedChildHabits / childHabits.length) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="mt-2">
                            {isAddTargetForHabit(sequenceHabit.id) && (
                              <div className="flex flex-wrap items-center gap-2">
                                <Input
                                  aria-label="Nome do subitem" value={newChildHabitName}
                                  onChange={(e) => setNewChildHabitName(e.target.value)}
                                  placeholder="Novo subciclo..."
                                  className="flex-1 h-8 text-sm bg-white/5 border-white/10"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddChildHabit(sequenceHabit.id);
                                    if (e.key === 'Escape') setActiveAddHabitTarget(null);
                                  }}
                                />
                                <Input
                                  type="number"
                                  min={1}
                                  aria-label="Pontos planejados do subitem" value={newChildHabitPoints}
                                  onChange={(e) => setNewChildHabitPoints(Number(e.target.value))}
                                  placeholder="Pts"
                                  className="w-20 h-8 text-sm bg-white/5 border-white/10"
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  aria-label="Minutos planejados do subitem" value={newChildHabitMinutes}
                                  onChange={(e) => setNewChildHabitMinutes(e.target.value)}
                                  placeholder="Min"
                                  className="w-20 h-8 text-sm bg-white/5 border-white/10"
                                />
                                <Button size="sm" className="h-8 px-2" onClick={() => handleAddChildHabit(sequenceHabit.id)}>
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {childHabits.length > 0 && sequenceHabit.isExpanded && (
                            <div className="mt-3 space-y-2">
                              {renderChildHabits(childHabits, 0, sequenceHabit.id)}
                            </div>
                          )}

                          {completed && completion?.timeSpentMinutes && completion.timeSpentMinutes > 0 && (
                            <div className="mt-2 text-[10px] text-mystic-gold">
                              Completado em {completion.timeSpentMinutes}min
                            </div>
                          )}
                        </div>
                      </div>
                      )}
                      {isFitnessSequence && <ol aria-label="Fila de treinos" className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-white/10 pt-2">{sequenceMemberships.filter((membership) => membership.sequenceId === item.sequence.id).sort((a, b) => a.position - b.position).map((membership, index) => { const member = findHabitById(habits, membership.habitId); return <li key={membership.id} aria-current={membership.habitId === sequenceHabit.id ? 'step' : undefined} className={`flex min-w-0 items-center gap-2 text-xs ${membership.habitId === sequenceHabit.id ? 'font-medium text-emerald-300' : 'text-white/50'}`}>{index > 0 && <span aria-hidden="true" className="text-white/30">→</span>}<span className="break-words">{member?.title || member?.name || 'Treino indisponível'}</span></li>; })}</ol>}
                    </motion.div>
                  );
                }

                const habit = card.habit;
                if (!habit) return null;
                const completed = isHabitCompleted(habit);
                const childHabits = habit.childHabits || [];
                const completedChildHabits = childHabits.filter(isHabitCompleted).length;
                const area = allAreasForEdit.find((item) => item.id === habit.areaId) || getAreaById(habit.areaId);
                const areaDisplayName = area?.name || 'Sem Categoria';
                const subarea = habit.subareaId ? getAreaById(habit.subareaId) : undefined;
                const element = area ? ELEMENTS[area.elementId] : ELEMENTS[habit.elementId];
                const showElementBadge = habit.areaId !== 'sem-categoria';
                
                // Calcular áreas agregadas dos filhos (com subareas)
                const getAggregatedAreas = (habits: Habit[]): Record<string, { points: number; subareaId?: string | null }> => {
                  const areaTotals: Record<string, { points: number; subareaIds: Set<string | null> }> = {};
                  const processHabit = (h: Habit) => {
                    if (h.childHabits.length > 0) {
                      h.childHabits.forEach(processHabit);
                    } else {
                      const value = h.plannedPoints || 0;
                      if (h.areaId && value > 0) {
                        if (!areaTotals[h.areaId]) {
                          areaTotals[h.areaId] = { points: 0, subareaIds: new Set() };
                        }
                        areaTotals[h.areaId].points += value;
                        areaTotals[h.areaId].subareaIds.add(h.subareaId || null);
                      }
                    }
                  };
                  habits.forEach(processHabit);
                  
                  // Converter para formato final: se há apenas uma subarea única, incluir; senão, sem subarea
                  const result: Record<string, { points: number; subareaId?: string | null }> = {};
                  for (const [areaId, data] of Object.entries(areaTotals)) {
                    result[areaId] = {
                      points: data.points,
                      subareaId: data.subareaIds.size === 1 ? Array.from(data.subareaIds)[0] : undefined
                    };
                  }
                  return result;
                };
                
                const hasChildren = childHabits.length > 0;
                const aggregatedAreas = hasChildren ? getAggregatedAreas(childHabits) : {};
                const aggregatedAreaList = Object.entries(aggregatedAreas)
                  .sort((a, b) => {
                    if (a[0] === 'sem-categoria') return 1;
                    if (b[0] === 'sem-categoria') return -1;
                    return b[1].points - a[1].points;
                  });
                
                if (habit.sourceModule === 'modulo_treino') return <FitnessHabitWidget key={habit.id} habit={habit} date={selectedDate} />;
                const primaryAreaBadgeLabel = !hasChildren && habit.areaId
                  ? `+${Math.round(habit.plannedPoints)} ${areaDisplayName}${subarea ? ` | ${subarea.name}` : ''}`
                  : null;

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable={canReorderVisibleCards && !completed && !habit.controlledBySequenceId}
                    onDragStart={(event) => handleMixedCardDragStart(event as unknown as React.DragEvent<HTMLDivElement>, 'habit', habit.id)}
                    onDragOver={(event) => handleMixedCardDragOver(event as unknown as React.DragEvent<HTMLDivElement>, 'habit', habit.id)}
                    onDrop={() => canReorderVisibleCards && handleMixedCardDrop('habit', habit.id)}
                    onDragEnd={handleMixedCardDragEnd}
                    className={`cycle-routine-card relative p-4 rounded-2xl border transition-all ${
                      completed
                        ? 'bg-mystic-gold/5 border-mystic-gold/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    } ${
                      dragOverMixedCard?.type === 'habit' && dragOverMixedCard.id === habit.id
                        ? 'border-mystic-gold/60 bg-mystic-gold/10'
                        : ''
                    }`}
                  >
                    {/* Streak badge */}
                    {habit.streak > 0 && (
                      <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 
                                    bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold z-10">
                        <Flame className="w-3 h-3" />
                        {habit.streak}
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      {!completed && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleQuickCompleteHabit(habit);
                          }}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-mystic-gold/20 flex items-center justify-center flex-shrink-0 transition-colors"
                          aria-label="Marcar ciclo como completo" title="Marcar como completo"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {completed && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleQuickUncompleteHabit(habit);
                          }}
                          className="w-8 h-8 rounded-lg bg-mystic-gold/20 hover:bg-mystic-gold/30 flex items-center justify-center flex-shrink-0"
                          aria-label="Desmarcar conclusão" title="Desmarcar"
                        >
                          <X className="w-4 h-4 text-mystic-gold" />
                        </button>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium ${completed ? 'line-through text-white/50' : 'text-white'}`}>
                              {habit.name}
                            </p>
                            {habit.description && (
                              <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{habit.description}</p>
                            )}
                          </div>

                          {!completed && (
                            <div className="flex items-center gap-1">
                              {showElementBadge && (
                                <span
                                  className="w-7 h-7 rounded-full border flex items-center justify-center text-base leading-none"
                                  style={{
                                    backgroundColor: `${element.color}1f`,
                                    borderColor: `${element.color}66`,
                                  }}
                                  title={element.name}
                                >
                                  <ElementIcon element={element.id} />
                                </span>
                              )}

                              <button
                                onClick={() => setActiveAddHabitTarget(habit.id)}
                                className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70"
                                title="Adicionar subitem"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button aria-label="Mais ações do ciclo" className="p-1 rounded-lg hover:bg-white/10">
                                    <MoreVertical className="w-4 h-4 text-white/40" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="cycle-menu bg-mystic-purple border-white/10">
                                  {!habit.controlledBySequenceId && (
                                    <>
                                      <DropdownMenuItem disabled={!canReorderVisibleCards} onClick={() => moveHabitUp(habit.id)}>
                                        <ArrowUp className="w-4 h-4 mr-2" />
                                        Mover para cima
                                      </DropdownMenuItem>
                                      <DropdownMenuItem disabled={!canReorderVisibleCards} onClick={() => moveHabitDown(habit.id)}>
                                        <ArrowDown className="w-4 h-4 mr-2" />
                                        Mover para baixo
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}

                                  {habit.controlledBySequenceId ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => removeHabitFromSequence(habit.controlledBySequenceId!, habit.id)}
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Remover da sequência
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  ) : (
                                    cycleSequences.length > 0 && (
                                      <>
                                        {cycleSequences.filter((sequence) => sequence.status !== 'PLANNING' &&
                                          (sequence.memberRestriction !== 'WORKOUT' || habit.sourceModule === 'modulo_treino')).map((sequence) => (
                                          <DropdownMenuItem
                                            key={`${habit.id}-${sequence.id}`}
                                            onClick={() => addHabitToSequence(sequence.id, habit.id)}
                                          >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adicionar em: {sequence.name}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                      </>
                                    )
                                  )}

                                  <DropdownMenuItem onClick={() => duplicateHabit(habit.id)}>
                                    <ListTodo className="w-4 h-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleOpenEditHabit(habit.id)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteHabit(habit.id)} className="text-red-400">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-start justify-between gap-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                            {habit.controlledBySequenceId && (
                              <Badge variant="outline" className="bg-mystic-gold/10 border-mystic-gold/40 text-mystic-gold text-[10px] truncate max-w-full sm:max-w-xs">
                                Em sequência
                              </Badge>
                            )}

                            {primaryAreaBadgeLabel && (
                              <Badge
                                variant="outline"
                                className="text-[10px] min-w-0 max-w-[calc(100vw-13rem)] sm:max-w-xs"
                                style={{
                                  backgroundColor: `${(area?.color || element.color)}15`,
                                  borderColor: `${(area?.color || element.color)}40`,
                                  color: area?.color || element.color,
                                }}
                                title={primaryAreaBadgeLabel}
                              >
                                <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {primaryAreaBadgeLabel}
                                </span>
                              </Badge>
                            )}

                            {/* Badges de áreas agregadas dos filhos */}
                            {hasChildren && aggregatedAreaList.map(([areaId, data]) => {
                              const aggArea = allAreasForEdit.find((a) => a.id === areaId) || AREAS.find((a) => a.id === areaId);
                              const aggSubarea = data.subareaId ? getAreaById(data.subareaId) : undefined;
                              if (!aggArea) return null;
                              const badgeLabel = `+${Math.round(data.points)} ${aggArea.name}${aggSubarea ? ` | ${aggSubarea.name}` : ''}`;
                              return (
                                <Badge 
                                  key={areaId}
                                  variant="outline"
                                  className="text-[10px] min-w-0 max-w-[calc(100vw-13rem)] sm:max-w-xs"
                                  style={{ 
                                    backgroundColor: `${aggArea.color}10`, 
                                    borderColor: `${aggArea.color}50`,
                                    color: aggArea.color 
                                  }}
                                  title={badgeLabel}
                                >
                                  <span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {badgeLabel}
                                  </span>
                                </Badge>
                              );
                            })}

                            {habit.plannedTimeMinutes > 0 && (
                              <Badge variant="outline" className="bg-white/5 text-white/60 text-[10px] flex-shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(habit.plannedTimeMinutes)}
                              </Badge>
                            )}
                          </div>

                          {!completed && (
                            <Button
                              size="sm"
                              onClick={() => handleStartHabit(habit.id)}
                              className="h-7 px-2 text-xs bg-mystic-arcane hover:bg-mystic-arcane/80 shrink-0"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Iniciar
                            </Button>
                          )}
                        </div>

                      {childHabits.length > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => toggleHabitChildExpansion(habit.id)}
                            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/70"
                          >
                            {habit.isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            {completedChildHabits}/{childHabits.length} subitens
                          </button>
                          <div className="flex-1 h-1 bg-black/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mystic-arcane rounded-full"
                              style={{
                                width: `${childHabits.length > 0 ? (completedChildHabits / childHabits.length) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-2">
                        {isAddTargetForHabit(habit.id) && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Input
                              aria-label="Nome do subitem" value={newChildHabitName}
                              onChange={(e) => setNewChildHabitName(e.target.value)}
                              placeholder="Novo subciclo..."
                              className="flex-1 h-8 text-sm bg-white/5 border-white/10"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddChildHabit(habit.id);
                                if (e.key === 'Escape') setActiveAddHabitTarget(null);
                              }}
                            />
                            <Input
                              type="number"
                              min={1}
                              aria-label="Pontos planejados do subitem" value={newChildHabitPoints}
                              onChange={(e) => setNewChildHabitPoints(Number(e.target.value))}
                              placeholder="Pts"
                              className="w-20 h-8 text-sm bg-white/5 border-white/10"
                            />
                            <Input
                              type="number"
                              min={0}
                              aria-label="Minutos planejados do subitem" value={newChildHabitMinutes}
                              onChange={(e) => setNewChildHabitMinutes(e.target.value)}
                              placeholder="Min"
                              className="w-20 h-8 text-sm bg-white/5 border-white/10"
                            />
                            <Button size="sm" className="h-8 px-2" onClick={() => handleAddChildHabit(habit.id)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {childHabits.length > 0 && habit.isExpanded && (
                        <div className="mt-3 space-y-2">
                          {renderChildHabits(childHabits, 0, habit.id)}
                        </div>
                      )}
                    </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            displayedMixedCards.length > 0 ? <div className="cycle-filter-empty"><Search size={28} aria-hidden="true" /><h3>Nenhum ciclo corresponde aos filtros</h3><p>Altere a busca ou veja todos os itens desta data.</p><button type="button" onClick={() => setCycleFilters({ query: '', element: 'all', status: 'all' })}>Ver todos os ciclos do dia</button></div> : <EmptyState onCreate={() => setShowQuickCreateCycle(true)} />
          )}
        </AnimatePresence>
      </motion.div>

      </section>
      <section id="cycle-library-panel" aria-label="Biblioteca de sequências" hidden={workspaceView !== 'sequences'}>
      {/* Sequences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="cycle-library"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mystic text-sm">Sequências</h3>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            ref={newSequenceTriggerRef}
            onClick={() => { setSequenceQuery(''); setShowQuickCreateSequence((prev) => !prev); }}
          >
            <Plus className="w-3 h-3 mr-1" />
            Nova Sequência
          </Button>
        </div>

        <Dialog open={showQuickCreateSequence} onOpenChange={setShowQuickCreateSequence}>
          <DialogContent className="cycle-dialog cycle-composer-dialog" onCloseAutoFocus={(event) => { event.preventDefault(); newSequenceTriggerRef.current?.focus(); }} aria-labelledby="cycle-new-sequence-title" aria-describedby="cycle-new-sequence-description">
            <DialogHeader><DialogTitle id="cycle-new-sequence-title">Criar sequência</DialogTitle><DialogDescription id="cycle-new-sequence-description">Dê um ritmo aos seus ciclos, um passo por vez.</DialogDescription></DialogHeader>
            <CycleCreationForm kind="sequence" name={quickCreateSequenceName} onNameChange={setQuickCreateSequenceName} days={quickCreateSequenceDaysOfWeek} onToggleDay={day => toggleWeekday(day, setQuickCreateSequenceDaysOfWeek)} startLabel={selectedDate.toLocaleDateString('pt-BR')} onSubmit={handleQuickCreateSequence} onCancel={() => setShowQuickCreateSequence(false)}>
              <label className="cycle-composer-name">Quais ciclos entram nesta sequência?<select value={quickSequenceRestriction} onChange={event => setQuickSequenceRestriction(event.target.value as 'ANY' | 'WORKOUT')}><option value="ANY">Geral — qualquer ciclo</option><option value="WORKOUT">Treinos — apenas treinos</option></select></label>
            </CycleCreationForm>
          </DialogContent>
        </Dialog>

        {sequenceSummaries.length > 0 && <><label className="cycle-search mb-4"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar sequências</span><input type="search" value={sequenceQuery} onChange={event => setSequenceQuery(event.target.value)} placeholder="Buscar sequência ou ciclo atual" /></label>
        <p className="cycle-library-count" role="status">{visibleSequenceSummaries.length} de {sequenceSummaries.length} sequências</p></>}
        {sequenceSummaries.length > 0 && visibleSequenceSummaries.length === 0 && <div className="cycle-filter-empty"><p>Nenhuma sequência encontrada.</p><button type="button" onClick={() => setSequenceQuery('')}>Limpar busca</button></div>}
        {sequenceSummaries.length === 0 ? (
          <div className="cycle-welcome-showcase"><span className="cycle-welcome-art" aria-hidden="true"><ArcaneIcon name="ciclo" size={50} /></span><div><h3>Um passo leva ao próximo</h3><p>Reúna seus ciclos em uma sequência e acompanhe qual está na vez.</p><Button onClick={() => setShowQuickCreateSequence(true)} className="cycle-primary"><Plus size={18} aria-hidden="true" />Criar sequência</Button></div></div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-white/45">Abra uma sequência para ver os passos e gerenciar sua execução. A ordem da rotina é ajustada na aba Rotina.</p>
            {visibleSequenceSummaries.map((item) => (
              <CycleSequenceShowcase key={item.sequence.id} active={item.sequence.isActive} onOpen={() => item.sequence.memberRestriction === 'WORKOUT' || item.currentHabit?.sourceModule === 'modulo_treino' ? navigate(`/fitness?sequence=${encodeURIComponent(item.sequence.id)}`) : setSelectedSequenceId(item.sequence.id)} name={item.sequence.name} description={item.sequence.description}
                headerExtra={<Badge variant="outline" className="shrink-0 bg-white/5 text-[10px]">Passo {item.currentPositionLabel}</Badge>}
                members={getMembersForSequence(item.sequence.id).map((membership) => {
                  const member = findHabitById(habits, membership.habitId);
                  return { id: membership.id, name: member?.title || member?.name || 'Ciclo indisponível', current: member?.id === item.currentHabit?.id };
                })}>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" title="Pular a vez" aria-label={`Pular a vez de ${item.sequence.name}`} disabled={!canSkipSequence(item.sequence)} onClick={() => handleSkipSequence(item.sequence.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-fitness-primary hover:bg-white/5 disabled:opacity-30"><SkipForward size={15} /></button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-white/10 px-2.5 text-xs" onClick={() => toggleCycleSequenceActive(item.sequence.id)}>{item.sequence.isActive ? 'Pausar' : 'Retomar'}</Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-white/10 px-2.5 text-xs" onClick={() => resetCycleSequenceToStart(item.sequence.id)}>Reiniciar</Button>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg border-white/10 px-2.5 text-xs" onClick={() => item.sequence.memberRestriction === 'WORKOUT' || item.currentHabit?.sourceModule === 'modulo_treino' ? navigate(`/fitness?sequence=${encodeURIComponent(item.sequence.id)}`) : setSelectedSequenceId(item.sequence.id)}>Detalhes</Button>
                </div>
              </CycleSequenceShowcase>
            ))}
          </div>
        )}
      </motion.div>

      </section>
      <details ref={insightsRef} className="cycles-insights"><summary><ArcaneIcon name="conquista" size={22} /><span>Sua evolução<small>Distribuição dos pontos e constância</small></span><ChevronDown size={20} aria-hidden="true" /></summary><div>
        <div className="cycle-score-showcase"><ScoreHierarchyPanel presentation="explorer" tasks={tasks} habits={habits} customAreas={customAreas} customSubareas={customSubareas} /></div>
      {/* Top Streaks */}
      {topStreaks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="font-mystic text-sm">Sequências de constância</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {topStreaks.map((habit) => (
              <motion.div
                key={habit.id}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20
                          border border-orange-500/30"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-orange-400">{habit.streak}</span>
                  <span className="text-xs text-white/60 truncate max-w-[100px]">{habit.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      </div></details>
      {/* Timer Modal */}
      <Dialog open={showTimer} onOpenChange={handleTimerModalChange}>
        <DialogContent aria-labelledby="cycles-timer-title" aria-describedby="cycles-timer-description" className="cycle-dialog elemental-timer-dialog max-w-sm">
          <DialogHeader>
            <DialogTitle id="cycles-timer-title" className="font-mystic text-center text-xl">
              Ciclo em Andamento
            </DialogTitle>
          <DialogDescription id="cycles-timer-description">Acompanhe o tempo e conclua quando terminar o ciclo.</DialogDescription>
          </DialogHeader>
          
          {activeHabitData && <ElementalTimer
              title={activeHabitData.name}
              element={activeHabitData.elementId}
              time={formatTime(timer.elapsedSeconds)}
              running={timer.isRunning}
              plannedLabel={formatDuration(activeHabitData.plannedTimeMinutes)}
              onToggle={() => timer.isRunning ? useAppStore.getState().pauseTimer() : useAppStore.getState().resumeTimer()}
              onComplete={handleStopAndComplete}
            />}
        </DialogContent>
      </Dialog>

      {/* Execution Mode Modal (ciclo com filhos) */}
      <Dialog open={showExecutionMode} onOpenChange={handleExecutionModalChange}>
        <DialogContent aria-labelledby="cycles-execution-title" aria-describedby="cycles-execution-description" className="cycle-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle id="cycles-execution-title" className="font-mystic text-xl text-center">Executar ciclo</DialogTitle>
          <DialogDescription id="cycles-execution-description">Execute um passo por vez. O tempo total e o tempo da tarefa atual aparecem separados.</DialogDescription>
          </DialogHeader>

          {activeHabitData && (
            <div className="space-y-4 py-2">
              <div className="cycle-execution-clock">
                <ArcaneIcon name="ciclo" size={32} />
                <p>{activeHabitData.name}</p>
                <p role="timer" aria-label="Tempo total do ciclo">{formatTime(timer.elapsedSeconds)}</p>
                <p className="text-[11px] text-white/45 mt-1">Tempo total do ciclo</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-white/60">Progresso</span>
                  <span className="text-mystic-gold">{executionCompletedCount}/{executionActionableChildren.length} tarefas</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mystic-gold to-orange-400"
                    style={{ width: `${executionProgressPercent}%` }}
                  />
                </div>
              </div>

              {executionPreviousTask && (executionPreviousTaskCompletion || executionPreviousTimingFromSession) && (
                <div className="rounded-lg border border-white/10 bg-black/15 px-2.5 py-2 text-[11px] text-white/70">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      Anterior: {executionPreviousTask.name} |
                      {' '}I {formatExecutionSnapshot(
                        executionPreviousTimingFromSession?.startedAtCycleSeconds
                        ?? executionPreviousTaskCompletion?.startedAtCycleSeconds
                      )}
                      {' '}F {formatExecutionSnapshot(
                        executionPreviousTimingFromSession?.endedAtCycleSeconds
                        ?? executionPreviousTaskCompletion?.endedAtCycleSeconds
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-mystic-gold/40 bg-mystic-gold/10 p-3">
                {executionCurrentTask ? (
                  <>
                    <p className="text-[11px] text-white/50">Tarefa atual</p>
                    <h3 className="font-mystic text-base mt-1 leading-tight">{executionCurrentTask.name}</h3>
                    <div className="mt-2 rounded-lg border border-white/15 bg-black/25 px-2.5 py-2">
                      <p className="text-[10px] text-white/55">Tempo da atual</p>
                      <p className="text-lg font-mono font-semibold text-mystic-gold mt-0.5">
                        {formatTime(executionTaskElapsedSeconds)}
                      </p>
                      <p className="text-[10px] text-white/45 mt-1">
                        Início no cronômetro: {formatExecutionSnapshot(executionTaskStartCycleSeconds)}
                      </p>
                    </div>
                    {executionCurrentTask.description && (
                      <p className="text-xs text-white/70 mt-2 leading-snug">{executionCurrentTask.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {executionCurrentTask.plannedTimeMinutes > 0 && (
                        <Badge variant="outline" className="bg-white/5 text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(executionCurrentTask.plannedTimeMinutes)}
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-white/70">Não há tarefas acionáveis neste ciclo.</p>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/15 px-2.5 py-2 text-[11px] text-white/70">
                {executionNextTask ? (
                  <span>
                    Próximo: <span className="text-mystic-gold">{executionNextTask.name}</span>
                  </span>
                ) : (
                  <span className="text-white/45">Próximo: fim da fila</span>
                )}
              </div>

              {executionTextChildren.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs text-white/50 mb-2">Notas e informações</p>
                  <div className="space-y-1.5">
                    {executionTextChildren.map((textItem) => (
                      <div key={textItem.id} className="text-sm text-white/75">
                        {textItem.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <Button
                  onClick={handleExecutionCompleteCurrentTask}
                  className="w-full h-auto min-h-12 whitespace-normal justify-center bg-mystic-gold text-black hover:bg-mystic-gold/90"
                  disabled={!executionCurrentTask}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Concluir
                </Button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={handleExecutionBackTask}
                    variant="outline"
                    className="h-auto min-h-11 whitespace-normal justify-center"
                    disabled={executionCurrentIndex <= 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar
                  </Button>

                  <Button onClick={handleExecutionTogglePause} variant="outline" className="h-auto min-h-11 whitespace-normal justify-center">
                    {timer.isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Continuar
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button onClick={() => finalizeExecutionCycle()} variant="outline" className="h-auto min-h-11 whitespace-normal justify-center">
                    <Check className="w-4 h-4 mr-1" />
                    Finalizar ciclo
                  </Button>

                  <Button onClick={handleExecutionCancel} variant="destructive" className="h-auto min-h-11 whitespace-normal justify-center">
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Habit Modal */}
      <Dialog open={showQuickEdit} onOpenChange={setShowQuickEdit}>
        <DialogContent aria-labelledby="cycles-edit-title" aria-describedby="cycles-edit-description" className="cycle-dialog cycle-editor-dialog max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle id="cycles-edit-title" className="font-mystic text-xl">Editar Ciclo</DialogTitle>
          <DialogDescription id="cycles-edit-description">Ajuste o ciclo e seus dias de execução. Itens com filhos mantêm os valores herdados.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isEditAggregatorLocked && (
              <div className="rounded-md border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-300">
                Este ciclo é agregador (tem filhos). Área, subárea, tempo e pontuação base são herdados/somados dos subitens e não podem ser alterados aqui.
              </div>
            )}

            <div>
              <label className="text-sm text-white/70 mb-2 block">Nome do Ciclo</label>
              <Input
                aria-label="Nome do ciclo" value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editName.trim()) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
                placeholder="Ex: Meditar"
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Área Principal</label>
                <Select 
                  value={editArea} 
                  onValueChange={(value) => {
                    setEditArea(value);
                    if (value === 'none') setEditSubarea('none');
                  }}
                  disabled={isEditAggregatorLocked}
                >
                  <SelectTrigger aria-label="Área principal"
                    className="bg-white/5 border-white/10"
                    style={selectedAreaForEdit ? { borderColor: `${selectedAreaForEdit.color}80` } : undefined}
                  >
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent className="bg-mystic-purple border-white/10">
                    <SelectItem value="none">Manter atual</SelectItem>
                    {allAreasForEdit.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: area.color }} />
                          <span style={{ color: area.color }}>{area.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-white/70 mb-2 block">Subárea Primária</label>
                <Select
                  value={editSubarea}
                  onValueChange={setEditSubarea}
                  disabled={isEditAggregatorLocked || !editArea || editArea === 'none'}
                >
                  <SelectTrigger aria-label="Subárea primária"
                    className="bg-white/5 border-white/10"
                    style={selectedAreaForEdit ? { borderColor: `${selectedAreaForEdit.color}60` } : undefined}
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-mystic-purple border-white/10">
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {dynamicSubareasForEdit.map((subarea) => (
                      <SelectItem key={subarea.id} value={subarea.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full opacity-70"
                            style={{ backgroundColor: selectedAreaForEdit?.color || '#FFFFFF' }}
                          />
                          <span style={{ color: selectedAreaForEdit?.color || '#FFFFFF' }}>{subarea.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Dias da semana</label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS_SHORT.map((label, dayIndex) => {
                  const active = editDaysOfWeek.includes(dayIndex);
                  return (
                    <button
                      key={`edit-habit-day-${dayIndex}`}
                      type="button"
                      onClick={() => toggleWeekday(dayIndex, setEditDaysOfWeek)}
                      className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                        active
                          ? 'bg-mystic-gold/20 border-mystic-gold/50 text-mystic-gold'
                          : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
                      }`}
                      aria-pressed={active} aria-label={WEEKDAYS[dayIndex]} title={WEEKDAYS[dayIndex]}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Pontuação Base</label>
              <Input
                type="number"
                min="1"
                max="100"
                aria-label="Pontuação base" value={editPoints}
                onChange={(e) => setEditPoints(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isEditAggregatorLocked}
                className="bg-white/5 border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {Boolean(editingHabitId && habits.find((h) => h.id === editingHabitId)?.childHabits.length) && (
                <p className="text-xs text-yellow-400/70 mt-1">
                  Este ciclo é agregador (tem subciclos). Pontuação vem dos subitens.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasTimeEditHabit"
                  checked={hasTime}
                  onChange={(e) => setHasTime(e.target.checked)}
                  disabled={isEditAggregatorLocked}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="hasTimeEditHabit" className="text-sm cursor-pointer flex-1 text-white/70">
                  Adicionar tempo estimado
                </label>
              </div>

              {hasTime && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Minutos</label>
                    <Input
                      type="number"
                      min="0"
                      max="300"
                      aria-label="Minutos planejados" value={editTimeMinutes === 0 ? '' : editTimeMinutes}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditTimeMinutes(Math.max(0, Math.min(300, value)));
                      }}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">Segundos</label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      aria-label="Segundos planejados" value={editTimeSeconds === 0 ? '' : editTimeSeconds}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                        setEditTimeSeconds(Math.max(0, Math.min(59, value)));
                      }}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowQuickEdit(false)}
                className="flex-1 border-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={!editName.trim()}
                className="flex-1 bg-mystic-arcane hover:bg-mystic-arcane/80"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sequence Detail Modal */}
      <Dialog
        open={!!selectedSequenceSummary}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSequenceId(null);
            setSequenceHabitToAdd('none');
          }
        }}
      >
        <DialogContent aria-labelledby="cycles-sequence-title" aria-describedby="cycles-sequence-description" className="cycle-dialog cycle-editor-dialog cycle-sequence-editor max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle id="cycles-sequence-title" className="font-mystic text-xl">
              {selectedSequenceSummary?.sequence.name || 'Sequência'}
            </DialogTitle>
          <DialogDescription id="cycles-sequence-description">Organize os passos e os dias. As alterações desta sequência são salvas ao tocar nos controles.</DialogDescription>
          </DialogHeader>

          {selectedSequenceSummary && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Badge variant="outline" className="bg-white/5">
                  {selectedSequenceSummary.sequence.isActive ? 'Ativa' : 'Pausada'}
                </Badge>
                <Badge variant="outline" className="bg-white/5">
                  Posição {selectedSequenceSummary.currentPositionLabel}
                </Badge>
              </div>

              <div className="rounded-xl border border-white/10 p-3 bg-black/20">
                <p className="text-xs text-white/60 mb-2">Dias da semana da sequência</p>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS_SHORT.map((label, dayIndex) => {
                    const selectedDays = selectedSequenceSummary.sequence.recurrenceConfig.daysOfWeek || [0, 1, 2, 3, 4, 5, 6];
                    const active = selectedDays.includes(dayIndex);

                    return (
                      <button
                        key={`sequence-${selectedSequenceSummary.sequence.id}-day-${dayIndex}`}
                        type="button"
                        onClick={() => {
                          const nextDays = active
                            ? (selectedDays.length > 1 ? selectedDays.filter((day) => day !== dayIndex) : selectedDays)
                            : [...selectedDays, dayIndex].sort((a, b) => a - b);

                          updateCycleSequence(selectedSequenceSummary.sequence.id, {
                            recurrenceType: 'DAILY',
                            recurrenceConfig: {
                              ...selectedSequenceSummary.sequence.recurrenceConfig,
                              daysOfWeek: nextDays,
                            },
                          });
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${
                          active
                            ? 'bg-mystic-gold/20 border-mystic-gold/50 text-mystic-gold'
                            : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
                        }`}
                        aria-pressed={active} aria-label={WEEKDAYS[dayIndex]} title={WEEKDAYS[dayIndex]}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 p-3 bg-black/20">
                <p className="text-xs text-white/60 mb-2">Adicionar ciclo independente</p>
                <div className="flex items-center gap-2">
                  <Select value={sequenceHabitToAdd} onValueChange={setSequenceHabitToAdd}>
                    <SelectTrigger aria-label="Ciclo para adicionar à sequência" className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecione um ciclo" />
                    </SelectTrigger>
                    <SelectContent className="bg-mystic-purple border-white/10">
                      <SelectItem value="none">Selecione...</SelectItem>
                      {availableStandaloneHabits.filter((habit) => selectedSequenceSummary.sequence.memberRestriction !== 'WORKOUT' || habit.sourceModule === 'modulo_treino').map((habit) => (
                        <SelectItem key={habit.id} value={habit.id}>{habit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (sequenceHabitToAdd === 'none') return;
                      addHabitToSequence(selectedSequenceSummary.sequence.id, sequenceHabitToAdd);
                      setSequenceHabitToAdd('none');
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-white/60">Membros da sequência</p>
                {selectedSequenceMembers.length === 0 ? (
                  <p className="text-xs text-white/50">Sem ciclos na sequência.</p>
                ) : (
                  selectedSequenceMembers.map(({ membership, habit }) => (
                    <div
                      key={membership.id}
                      draggable
                      onDragStart={() => handleSequenceMemberDragStart(membership.habitId)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        handleSequenceMemberDragOver(membership.habitId);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleSequenceMemberDrop(membership.habitId);
                      }}
                      onDragEnd={handleSequenceMemberDragEnd}
                      className={`cycle-sequence-member rounded-xl border bg-black/20 px-3 py-2 transition-colors ${
                        dragOverSequenceHabitId === membership.habitId
                          ? 'border-mystic-gold/60'
                          : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm">{habit?.name || 'Ciclo removido'}</p>
                          <p className="text-[11px] text-white/50">Posição {membership.position + 1}</p>
                          <p className="text-[10px] text-white/35">Arraste para reordenar</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            aria-label={`Mover ${habit?.name || 'ciclo'} para cima`} onClick={() => moveHabitInSequence(selectedSequenceSummary.sequence.id, membership.habitId, 'up')}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2"
                            aria-label={`Mover ${habit?.name || 'ciclo'} para baixo`} onClick={() => moveHabitInSequence(selectedSequenceSummary.sequence.id, membership.habitId, 'down')}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-red-300"
                            aria-label={`Remover ${habit?.name || 'ciclo'} da sequência`} onClick={() => removeHabitFromSequence(selectedSequenceSummary.sequence.id, membership.habitId)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="border-red-400/40 text-red-300 hover:bg-red-500/10"
                  onClick={() => {
                    deleteCycleSequence(selectedSequenceSummary.sequence.id);
                    setSelectedSequenceId(null);
                  }}
                >
                  Excluir sequência
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSequenceId(null);
                    setSequenceHabitToAdd('none');
                  }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Completion Feedback */}
      <AnimatePresence>
        {completedHabitId && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="min-w-[180px] rounded-xl border border-mystic-gold/30 bg-black/70 px-3 py-2 text-center shadow-md shadow-black/30 backdrop-blur-sm">
              <p className="text-xs font-medium text-mystic-gold">Ciclo concluído {earnedPoints > 0 ? `+${earnedPoints}` : ''}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Create Cycle Modal */}
      <Dialog open={showQuickCreateCycle} onOpenChange={setShowQuickCreateCycle}>
        <DialogContent onCloseAutoFocus={(event) => { event.preventDefault(); newCycleTriggerRef.current?.focus(); }} aria-labelledby="cycles-create-title" aria-describedby="cycles-create-description" className="cycle-dialog cycle-composer-dialog">
          <DialogHeader><DialogTitle id="cycles-create-title">Criar ciclo</DialogTitle><DialogDescription id="cycles-create-description">Transforme uma pequena ação em parte da sua rotina.</DialogDescription></DialogHeader>
          <CycleCreationForm kind="cycle" name={quickCreateCycleName} onNameChange={setQuickCreateCycleName} days={quickCreateCycleDaysOfWeek} onToggleDay={day => toggleWeekday(day, setQuickCreateCycleDaysOfWeek)} startLabel={selectedDate.toLocaleDateString('pt-BR')} onSubmit={() => { handleQuickCreateCycle(); setWorkspaceView('routine'); setCycleFilters({ query: '', element: 'all', status: 'all' }); }} onCancel={() => setShowQuickCreateCycle(false)} />
        </DialogContent>
      </Dialog>
      </div>
      </MotionConfig>
    </AppLayout>
  );
};

interface EmptyStateProps {
  onCreate: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="cycle-welcome-showcase"
  >
    <span className="cycle-welcome-art" aria-hidden="true"><ArcaneIcon name="ritual" size={50} /></span>
    <div>
    <h3 className="font-mystic text-lg mb-2">Seu próximo passo começa aqui</h3>
    <p className="text-white/50 text-sm mb-4">
      Esta data ainda não tem ciclos. Crie um hábito ou escolha outro dia no calendário.
    </p>
    <Button onClick={onCreate}>
      <Plus className="w-4 h-4 mr-2" />
      Criar ciclo
    </Button>
    </div>
  </motion.div>
);
