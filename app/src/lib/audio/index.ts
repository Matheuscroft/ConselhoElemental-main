import { conclusao, conquista, nivel, toque, trocaDeElemento, type ElementoSom } from './cues';
import { motor } from './engine';
import { dispararHaptico } from './haptico';
import { lerPreferencias, salvarPreferencias } from './preferencias';

export type { ElementoSom } from './cues';
export {
  CHAVE_SOM,
  PADROES_SOM,
  assinarPreferencias,
  lerPreferencias,
  salvarPreferencias,
  type PreferenciasSom,
} from './preferencias';

/** Call from a real gesture (a tap). Creates/resumes the audio context. */
export function ativarSom(): Promise<boolean> {
  return motor.ativarSom();
}

export const silenciado = (): boolean => !lerPreferencias().ligado;
export const definirSilenciado = (mudo: boolean) => salvarPreferencias({ ligado: !mudo });
export const volume = (): number => lerPreferencias().volume;
export const definirVolume = (v: number) => salvarPreferencias({ volume: v });
export const definirHaptico = (ligado: boolean) => salvarPreferencias({ haptico: ligado });

function vibrar(padrao: number[]): void {
  try {
    if (!lerPreferencias().haptico) return;
    dispararHaptico(padrao);
  } catch {
    /* no vibration support */
  }
}

export function tocarConclusao(elemento: ElementoSom, intensidade = 0.5): void {
  motor.tocarConclusao(conclusao(elemento, intensidade));
  vibrar([12]);
}

export function tocarNivel(elemento: ElementoSom, nivelAlcancado = 2): void {
  motor.tocar(nivel(elemento, nivelAlcancado));
  vibrar([20, 70, 20, 70, 60]);
}

export function tocarTrocaDeElemento(de: ElementoSom, para: ElementoSom): void {
  motor.tocar(trocaDeElemento(de, para));
}

export function tocarToque(): void {
  motor.tocar(toque());
}

export function tocarConquista(): void {
  motor.tocar(conquista());
  vibrar([30, 50, 30, 50, 30, 50, 80]);
}

/** For the sound test panel: fires the same pattern a level-up would. */
export const tocarVibracaoDeTeste = (): void => vibrar([20, 70, 20, 70, 60]);
