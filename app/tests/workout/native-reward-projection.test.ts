import { projectTemplateReward } from '../../src/lib/workout/native-reward-preview.ts';
import { projectWorkoutProgress } from '../../src/lib/workout/native-progress-reward.ts';
import { buildNativeWorkoutRewardBlocks, calculateNativeWorkoutReward } from '../../src/lib/core/native-workout-reward.ts';
Deno.test('prévia, check-in e conclusão compartilham regra; duração manual não fabrica trabalho', () => {
 const exercise={sets:[{measureMode:'reps',targetReps:10,reps:10,completed:true,loadFactor:1}]};
 const template={exercises:[exercise],effortLevel:3,durationEstimateMode:'manual',estimatedDurationMinutes:120};
 const preview=projectTemplateReward(template);
 const progress=projectWorkoutProgress([exercise],120,3);
 const blocks=buildNativeWorkoutRewardBlocks([exercise],3);
 const final=calculateNativeWorkoutReward(blocks.blocks,blocks.activeDurationSeconds,3,true);
 if(preview.earthXp!==final.executedValue||progress.earthXp!==final.executedValue)throw Error('Divergent projections');
 if(preview.earthXp!==projectTemplateReward({...template,estimatedDurationMinutes:5}).earthXp)throw Error('Planning inflated XP');
});
