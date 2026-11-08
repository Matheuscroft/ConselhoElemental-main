/**
 * What the first open of the app remembers: whether the awakening has been
 * seen, and the two answers the opening survey asks for.
 *
 * All of it is a per-device preference in localStorage, like the week-start
 * preference. None of it touches the account store, the progress archive or
 * scoring, and nothing here is inferred from IP or from an account.
 */

const SEEN_KEY = 'ce:inicio:despertar-visto';
const NAME_KEY = 'ce:inicio:nome';

export const MAX_NAME_LENGTH = 40;

const read = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // A browser with storage denied simply starts over every time.
    return null;
  }
};

const write = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Nothing to recover: the opening just runs again next time.
  }
};

export const hasSeenAwakening = (): boolean => read(SEEN_KEY) === 'sim';

export const rememberAwakeningSeen = (): void => write(SEEN_KEY, 'sim');

/** Settings offers this so the introduction can be watched again. */
export const forgetAwakeningSeen = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    // Same as above: the preference simply stays as it was.
  }
};

/** Trimmed, length-capped, and empty when the person chose not to answer. */
export function normaliseName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

export const getOpeningName = (): string => normaliseName(read(NAME_KEY) ?? '');

export function setOpeningName(raw: string): void {
  const name = normaliseName(raw);
  if (!name) return;
  write(NAME_KEY, name);
}

/** The steps of the first open, in order. */
export type FirstRunStep = 'despertar' | 'pesquisa' | 'entrada';

/** Someone who has already seen the awakening goes straight to the entry. */
export const initialFirstRunStep = (seen = hasSeenAwakening()): FirstRunStep =>
  seen ? 'entrada' : 'despertar';

export function nextFirstRunStep(step: FirstRunStep): FirstRunStep {
  if (step === 'despertar') return 'pesquisa';
  return 'entrada';
}
