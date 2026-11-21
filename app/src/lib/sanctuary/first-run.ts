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
const AREAS_KEY = 'ce:inicio:areas';

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

/**
 * The areas of life the person chose to look after, kept on this device until the account exists (the app's own store
 * only loads after sign-in). Ids only, deduplicated and capped; anything that is not a short string is dropped.
 */
export const MAX_OPENING_AREAS = 40;

export function getOpeningAreas(): string[] {
  const raw = read(AREAS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ids = parsed.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 80);
    return [...new Set(ids)].slice(0, MAX_OPENING_AREAS);
  } catch {
    return [];
  }
}

export function setOpeningAreas(ids: readonly string[]): void {
  const limpo = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 80))].slice(0, MAX_OPENING_AREAS);
  if (typeof window === 'undefined') return;
  try {
    if (limpo.length === 0) window.localStorage.removeItem(AREAS_KEY);
    else window.localStorage.setItem(AREAS_KEY, JSON.stringify(limpo));
  } catch {
    // Nothing to recover: the choice is simply asked for again in the app.
  }
}

/** Called once the choice has been handed to the app, so it is never applied twice. */
export function clearOpeningAreas(): void {
  setOpeningAreas([]);
}

/** The steps of the first open, in order. */
export type FirstRunStep = 'despertar' | 'pesquisa' | 'foco' | 'entrada';

/** Someone who has already seen the awakening goes straight to the entry. */
export const initialFirstRunStep = (seen = hasSeenAwakening()): FirstRunStep =>
  seen ? 'entrada' : 'despertar';

export function nextFirstRunStep(step: FirstRunStep): FirstRunStep {
  if (step === 'despertar') return 'pesquisa';
  if (step === 'pesquisa') return 'foco';
  return 'entrada';
}
