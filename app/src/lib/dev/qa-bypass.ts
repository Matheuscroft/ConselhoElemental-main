/**
 * A way past the account gate, for looking at screens while sign-in is being
 * worked on. It exists so QA can see the app; it is not a login.
 *
 * Two conditions, both required:
 *
 *   1. The app is running under the Vite dev server (`import.meta.env.DEV`).
 *      In a production build Vite replaces that with `false`, so the branch is
 *      dead code and the minifier removes it. There is nothing to switch on.
 *   2. Someone asked for it by name, in a file that is not versioned
 *      (`app/.env.local`: `VITE_QA_BYPASS_AUTH=true`). `.env.example` must
 *      never carry it, so copying the example cannot turn it on.
 *
 * It only skips the route gate. It creates no session, reads no credentials
 * and touches no account, store, sync or backup code: what a screen shows
 * is what a local, signed-out profile would hold.
 */

export interface AmbienteQa {
  readonly DEV?: unknown;
  readonly VITE_QA_BYPASS_AUTH?: unknown;
}

/** The rule on its own, so it can be tested without a bundler. */
export function permiteBypass(ambiente: AmbienteQa): boolean {
  // Strict on both: the string 'true' and the boolean true, nothing truthy.
  return ambiente.DEV === true && ambiente.VITE_QA_BYPASS_AUTH === 'true';
}

let avisou = false;

export function qaBypassAuth(): boolean {
  if (!permiteBypass(import.meta.env)) return false;
  if (!avisou) {
    avisou = true;
    console.warn('[QA] login ignorado: modo de desenvolvimento, só para ver as telas.');
  }
  return true;
}
