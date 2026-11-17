/**
 * The vocabulary of the animated exercise figures.
 *
 * There are 373 exercises and nobody is going to film them. What an exercise
 * *looks like* is a movement pattern (a squat is a squat with or without a
 * barbell), so each exercise maps to one of a few dozen patterns and each
 * pattern is a short loop of poses of one drawn figure.
 *
 * Angles are DEGREES, ABSOLUTE (measured against the world, never against the
 * parent segment, so a pose can be written down without adding angles up), and
 * measured clockwise on the screen. The drawing space is a 100 x 100 box, y down.
 *
 *  - trunk, neck: 0 points straight UP (hip -> neck). 90 leans toward screen right.
 *  - arm, forearm, thigh, shin: 0 points straight DOWN. 90 points toward screen
 *    right, 180 straight up, -90 toward screen left.
 *
 * Side view ('lado'): the figure faces screen right. The near limbs ('E') are
 * drawn in front, the far limbs ('D') behind and dimmer. Front view ('frente'):
 * the shoulders and hips are drawn with a width and the left/right limbs spread
 * to either side of the trunk.
 */

export type Junta =
  | 'tronco' | 'pescoco'
  | 'bracoE' | 'antebracoE' | 'bracoD' | 'antebracoD'
  | 'coxaE' | 'canelaE' | 'coxaD' | 'canelaD';

export interface Pose {
  /** Where the hips are, in the 100 x 100 box. */
  readonly raiz: { readonly x: number; readonly y: number };
  /** Absolute angle of every segment, in degrees. */
  readonly ang: Readonly<Record<Junta, number>>;
}

export interface Quadro {
  /** 0..1 along one half of the loop; the loop plays forward then back (ping-pong). */
  readonly t: number;
  readonly pose: Pose;
}

/** What the hands hold (or the figure sits on) while the pattern plays. */
export type Equipamento =
  | 'nenhum' | 'barra' | 'halteres' | 'barra-fixa' | 'cabo' | 'maquina'
  | 'bicicleta' | 'banco' | 'argolas' | 'bola' | 'corda' | 'luvas';

export interface PadraoDef {
  readonly id: string;
  /** Short name in Portuguese, shown as the figure's accessible label. */
  readonly rotulo: string;
  readonly vista: 'lado' | 'frente';
  readonly equipamento: Equipamento;
  /** Seconds for one full loop (there and back). */
  readonly duracaoS: number;
  /** At least two, from t = 0 to t = 1, in order. */
  readonly quadros: readonly Quadro[];
  /** Draw a floor line under the lowest foot (default true). */
  readonly chao?: boolean;
  /**
   * 'vai-e-volta' (padrão): o loop vai do primeiro ao último quadro e volta. 'ciclo': t volta
   * ao início sem inverter (correr, pedalar, nadar); o último quadro deve ser igual ao primeiro.
   */
  readonly modo?: 'vai-e-volta' | 'ciclo';
  /** For lying or hanging figures: where the support is drawn (a bench under the hips, a bar above the hands). */
  readonly apoio?: 'banco-deitado' | 'barra-acima' | 'nenhum';
}
