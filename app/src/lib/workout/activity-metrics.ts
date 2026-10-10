import type { WorkoutSession } from '@/types/workout';
export const activityMetrics = (session:WorkoutSession) => {
 const sets=session.exerciseResults.flatMap((result)=>result.sets).filter((set)=>set.completed&&!set.skipped);
 const observed=sets.filter((set)=>set.perceivedExertion && set.durationSeconds);
 const seconds=observed.reduce((sum,set)=>sum+(set.durationSeconds??0),0);
 const load=observed.reduce((sum,set)=>sum+(set.activityLoad??0),0);
 return {seconds,load,distance:sets.reduce((sum,set)=>sum+(set.distanceMeters??0),0),effort:seconds?load/(seconds/60):undefined, observations:observed.length};
};
