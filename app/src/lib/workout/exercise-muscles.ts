/**
 * Do cadastro de músculos do exercício (ids de MuscleGroupId) para as regiões
 * que a figura ilustrada sabe acender. Só apresentação: não toca em pontuação.
 */

export type RegiaoDaFigura =
  | 'peitoral' | 'costas' | 'ombros' | 'biceps' | 'triceps' | 'antebraco'
  | 'abdomen' | 'gluteos' | 'quadriceps' | 'posteriores' | 'panturrilha';

/** Músculo do cadastro -> região da figura. Quem não tem região visível (ex.: pescoço) fica de fora. */
export const REGIAO_DO_MUSCULO: Readonly<Record<string, RegiaoDaFigura>> = {
  chest: 'peitoral',
  upper_back: 'costas', lats: 'costas', lower_back: 'costas', traps: 'costas', rhomboids: 'costas',
  shoulders: 'ombros', rear_delts: 'ombros',
  biceps: 'biceps', triceps: 'triceps', forearms: 'antebraco',
  core: 'abdomen', obliques: 'abdomen', abs: 'abdomen', serratus: 'abdomen',
  glutes: 'gluteos', adductors: 'quadriceps', abductors: 'gluteos',
  quadriceps: 'quadriceps', hamstrings: 'posteriores', calves: 'panturrilha', tibialis: 'panturrilha',
};

export interface ExercicioComMusculos {
  primaryMuscles?: readonly string[];
  muscleDistribution?: readonly { muscleId: string; percentage: number }[];
}

/** Menor fatia da distribuição que ainda conta como alvo quando não há músculos primários. */
const FATIA_MINIMA = 25;

/** Regiões a acender, sem repetir e na ordem em que aparecem no cadastro. */
export function regioesDoExercicio(ex: ExercicioComMusculos): RegiaoDaFigura[] {
  const ids = ex.primaryMuscles?.length
    ? ex.primaryMuscles
    : (ex.muscleDistribution ?? []).filter((m) => m.percentage >= FATIA_MINIMA).map((m) => m.muscleId);
  const saida: RegiaoDaFigura[] = [];
  for (const id of ids) {
    const regiao = REGIAO_DO_MUSCULO[id];
    if (regiao && !saida.includes(regiao)) saida.push(regiao);
  }
  return saida;
}
