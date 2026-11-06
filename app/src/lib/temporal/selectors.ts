import { recurrenceMatchesDate, operationalDate } from './recurrence';
import { EFFORT_MULTIPLIERS } from '@/constants';
import type { Commitment, CycleSequence, Habit, Mission, Project, Quest, Task } from '@/types';
import { eachDayOfInterval, isWithinInterval, startOfDay, toDayStamp, toValidDate } from '@/lib/temporal/date';

export interface TemporalEvent {
  id: string;
  sourceType: 'task' | 'habit';
  sourceId: string;
  title: string;
  occurredAt: Date;
  dayStamp: number;
  score: number;
}

export interface TemporalCommitment {
  id: string;
  sourceType: 'task' | 'commitment' | 'habit' | 'project' | 'quest' | 'mission' | 'sequence' | 'google';
  sourceId: string;
  title: string;
  date: Date;
  dayStamp: number;
  kind: 'recurring' | 'due' | 'external';
}

export interface TemporalSnapshot {
  tasks: Task[];
  habits: Habit[];
  cycleSequences: CycleSequence[];
  projects: Project[];
  quests: Quest[];
  commitments?: Commitment[];
}

const toRoundedTaskScore = (task: Task): number => {
  if (typeof task.completedScore === 'number') {
    return Math.max(0, Math.round(task.completedScore));
  }

  const baseValue = task.baseValue ?? 1;
  const effortLevel = task.effortLevel ?? 1;
  const multiplier = EFFORT_MULTIPLIERS[effortLevel] ?? 1;
  return Math.max(0, Math.round(baseValue * multiplier));
};

const walkHabits = (habits: Habit[], visitor: (habit: Habit) => void): void => {
  habits.forEach((habit) => {
    visitor(habit);
    if (habit.childHabits.length > 0) {
      walkHabits(habit.childHabits, visitor);
    }
  });
};


const pushDueCommitment = (
  output: TemporalCommitment[],
  input: {
    sourceType: 'project' | 'quest' | 'mission';
    sourceId: string;
    title: string;
    dueDate: Date | null;
    rangeStart: Date;
    rangeEnd: Date;
  }
): void => {
  if (!input.dueDate) return;
  if (!isWithinInterval(input.dueDate, input.rangeStart, input.rangeEnd)) return;

  const dayStamp = toDayStamp(input.dueDate);
  if (dayStamp == null) return;

  output.push({
    id: `${input.sourceType}:${input.sourceId}:due:${dayStamp}`,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    title: input.title,
    date: startOfDay(input.dueDate),
    dayStamp,
    kind: 'due',
  });
};

const collectMissionDueDates = (project: Project, rangeStart: Date, rangeEnd: Date): TemporalCommitment[] => {
  const output: TemporalCommitment[] = [];

  project.missions.forEach((mission: Mission) => {
    pushDueCommitment(output, {
      sourceType: 'mission',
      sourceId: mission.id,
      title: mission.title,
      dueDate: mission.dueDate,
      rangeStart,
      rangeEnd,
    });
  });

  return output;
};


const commitmentMatchesDate = (commitment: Commitment, targetDate: Date): boolean => {
  const commitmentDate = toValidDate(commitment.date);
  if (!commitmentDate) return false;
  if (commitment.recurrence === 'ONCE') return toDayStamp(commitmentDate) === toDayStamp(targetDate);
  return recurrenceMatchesDate({
    createdAt: commitmentDate, recurrenceType: commitment.recurrence,
    recurrenceConfig: {
      ...(commitment.recurrence === 'WEEKLY' ? { daysOfWeek: [commitmentDate.getDay()] } : {}),
      ...(commitment.recurrence === 'MONTHLY' ? { daysOfMonth: [commitmentDate.getDate()] } : {}),
      ...(commitment.recurrence === 'YEARLY' ? { month: commitmentDate.getMonth() + 1, day: commitmentDate.getDate() } : {}),
      ...(commitment.untilDate ? { until: commitment.untilDate } : {}),
    },
  }, targetDate);
};

export const buildOwnTemporalCommitments = (
  commitments: Commitment[],
  rangeStart: Date,
  rangeEnd: Date
): TemporalCommitment[] => {
  return commitments.flatMap((commitment) => eachDayOfInterval(rangeStart, rangeEnd)
    .filter((day) => commitmentMatchesDate(commitment, day))
    .map((day) => {
      const dayStamp = toDayStamp(day);
      if (dayStamp == null) return null;
      return {
        id: `commitment:${commitment.id}:${dayStamp}`,
        sourceType: 'commitment' as const,
        sourceId: commitment.id,
        title: commitment.title,
        date: startOfDay(day),
        dayStamp,
        kind: commitment.recurrence === 'ONCE' ? 'due' as const : 'recurring' as const,
      };
    })
    .filter((item) => item != null) as TemporalCommitment[]);
};

export const buildTemporalEvents = (snapshot: Pick<TemporalSnapshot, 'tasks' | 'habits'>): TemporalEvent[] => {
  const events: TemporalEvent[] = [];

  snapshot.tasks.forEach((task) => {
    if (!task.isCompleted) return;

    const occurredAt = toValidDate(task.completedAt ?? task.updatedAt);
    const dayStamp = toDayStamp(occurredAt);
    if (!occurredAt || dayStamp == null) return;

    events.push({
      id: `task:${task.id}:${dayStamp}`,
      sourceType: 'task',
      sourceId: task.id,
      title: task.title,
      occurredAt: startOfDay(occurredAt),
      dayStamp,
      score: toRoundedTaskScore(task),
    });
  });

  walkHabits(snapshot.habits, (habit) => {
    habit.completions.forEach((completion) => {
      const occurredAt = toValidDate(completion.completionDate);
      const dayStamp = toDayStamp(occurredAt);
      if (!occurredAt || dayStamp == null) return;

      const score = completion.executedScore ?? completion.scoreEarned ?? completion.plannedScoreAtCompletion ?? habit.plannedPoints;

      events.push({
        id: `habit:${habit.id}:${completion.id}`,
        sourceType: 'habit',
        sourceId: habit.id,
        title: habit.name,
        occurredAt: startOfDay(occurredAt),
        dayStamp,
        score: Math.max(0, Math.round(score)),
      });
    });
  });

  return events.sort((left, right) => left.dayStamp - right.dayStamp);
};

export const buildTemporalCommitments = (
  snapshot: TemporalSnapshot,
  rangeStart: Date,
  rangeEnd: Date
): TemporalCommitment[] => {
  const commitments = buildOwnTemporalCommitments(snapshot.commitments ?? [], rangeStart, rangeEnd);
  const days = eachDayOfInterval(rangeStart, rangeEnd);

  // One commitment per executable root. Substeps inherit it; rotations own their members' agenda.
  snapshot.habits.filter(habit => !habit.controlledBySequenceId).forEach((habit) => {
    days.forEach((day) => {
      if (!recurrenceMatchesDate(habit, day)) return;

      const dayStamp = toDayStamp(day);
      if (dayStamp == null) return;

      commitments.push({
        id: `habit:${habit.id}:recurring:${dayStamp}`,
        sourceType: 'habit',
        sourceId: habit.id,
        title: habit.name,
        date: startOfDay(day),
        dayStamp,
        kind: 'recurring',
      });
    });
  });

  snapshot.cycleSequences
    .filter((sequence) => sequence.isActive)
    .forEach((sequence) => {
      days.forEach((day) => {
        if (!recurrenceMatchesDate(sequence, day)) return;

        const dayStamp = toDayStamp(day);
        if (dayStamp == null) return;

        commitments.push({
          id: `sequence:${sequence.id}:recurring:${dayStamp}`,
          sourceType: 'sequence',
          sourceId: sequence.id,
          title: sequence.name,
          date: startOfDay(day),
          dayStamp,
          kind: 'recurring',
        });
      });
    });

  snapshot.tasks.filter(task => !task.isCompleted).forEach(task => {
    const date = operationalDate(task.dueDate);
    if (!date || !isWithinInterval(date, rangeStart, rangeEnd)) return;
    const dayStamp = toDayStamp(date)!;
    commitments.push({ id: `task:${task.id}:due:${dayStamp}`, sourceType: 'task', sourceId: task.id,
      title: task.title, date: startOfDay(date), dayStamp, kind: 'due' });
  });

  snapshot.projects.forEach((project) => {
    pushDueCommitment(commitments, {
      sourceType: 'project',
      sourceId: project.id,
      title: project.title,
      dueDate: project.dueDate,
      rangeStart,
      rangeEnd,
    });

    collectMissionDueDates(project, rangeStart, rangeEnd).forEach((item) => commitments.push(item));
  });

  snapshot.quests.forEach((quest: Quest) => {
    pushDueCommitment(commitments, {
      sourceType: 'quest',
      sourceId: quest.id,
      title: quest.title,
      dueDate: quest.dueDate,
      rangeStart,
      rangeEnd,
    });
  });

  return commitments.sort((left, right) => {
    if (left.dayStamp !== right.dayStamp) return left.dayStamp - right.dayStamp;
    return left.title.localeCompare(right.title);
  });
};
