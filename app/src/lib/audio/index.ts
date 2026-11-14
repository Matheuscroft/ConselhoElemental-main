import { conclusao, conquista, nivel, toque, trocaDeElemento, type ElementoSom } from './cues';
import { motor } from './engine';
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
    if (typeof document !== 'undefined' && document.hidden) return;
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    // Browsers refuse vibration until the person has touched the page; asking earlier only logs an error.
    const ativacao = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ativacao && !ativacao.hasBeenActive) return;
    navigator.vibrate(padrao);
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
  vibrar([20, 40, 20, 40, 40]);
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
