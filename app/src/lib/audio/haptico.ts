/**
 * Touch feedback that works on Android and on iPhone.
 *
 * Android (Chrome, Firefox, most WebViews) has `navigator.vibrate`. Safari on
 * iPhone has no Vibration API at all, so there the only web-reachable haptic is
 * the tick the system gives a native switch: toggling a hidden
 * `<input type="checkbox" switch>` through its label (iOS 17.4 and later). It
 * only fires inside, or just after, a real touch, which is when completions and
 * level-ups happen in this app. It is best effort: older iOS and desktop browsers
 * do nothing, silently.
 */

type PadraoHaptico = readonly number[];

let rotulo: HTMLLabelElement | null = null;

function rotuloDeInterruptor(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (rotulo && rotulo.isConnected) return rotulo;
  const entrada = document.createElement('input');
  entrada.type = 'checkbox';
  entrada.setAttribute('switch', '');
  entrada.setAttribute('aria-hidden', 'true');
  entrada.tabIndex = -1;
  const r = document.createElement('label');
  r.setAttribute('aria-hidden', 'true');
  r.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';
  r.appendChild(entrada);
  document.body.appendChild(r);
  rotulo = r;
  return r;
}

function tiqueDeIos(): void {
  try {
    rotuloDeInterruptor()?.click();
  } catch {
    /* no haptic available */
  }
}

/** Android and desktop browsers that support the Vibration API. */
function temVibrar(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** True on iPhone and iPad, where only the switch tick exists. */
function ehIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const ipadOs = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
  return /iPhone|iPad|iPod/.test(ua) || ipadOs;
}

/**
 * Plays a pattern: on/off durations in ms as `navigator.vibrate` takes them. On iPhone
 * each "on" becomes one switch tick, spaced by the pattern's own timing (capped).
 */
export function dispararHaptico(padrao: PadraoHaptico): void {
  if (typeof document !== 'undefined' && document.hidden) return;
  const ativacao = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (ativacao && !ativacao.hasBeenActive) return;
  try {
    if (temVibrar() && !ehIos()) {
      navigator.vibrate([...padrao]);
      return;
    }
    if (!ehIos()) return;
    let atraso = 0;
    for (let i = 0; i < padrao.length; i += 2) {
      const ligado = padrao[i] ?? 0;
      const pausa = padrao[i + 1] ?? 0;
      if (atraso === 0) tiqueDeIos();
      else window.setTimeout(tiqueDeIos, Math.min(atraso, 600));
      atraso += ligado + pausa;
    }
  } catch {
    /* no haptic available */
  }
}
