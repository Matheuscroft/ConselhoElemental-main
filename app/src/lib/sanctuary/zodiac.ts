import { useEffect, useState } from 'react';
import { Body, Ecliptic, GeoVector } from 'astronomy-engine';
import { ZODIAC_SIGNS } from '@/constants';
import { AURA } from '@/lib/design/palette';

/**
 * The sign behind someone's aura, and the aura's own colour and size.
 *
 * The sign is read from where the Sun actually was, with the same
 * `astronomy-engine` the Astrolábio and the Despertar already use. Fixed date
 * ranges would be a table of approximations: the boundaries move by about a
 * day from year to year, so someone born on the edge would be told the wrong
 * sign. Nothing here feeds a game rule; it decides how a light looks.
 */

export type ZodiacElementId = 'fogo' | 'terra' | 'ar' | 'agua';
export type ZodiacModality = 'cardeal' | 'fixo' | 'mutavel';

export interface ZodiacProfile {
  /** 0 is Áries, which is where the zodiac starts. */
  readonly index: number;
  readonly name: string;
  readonly icon: string;
  readonly element: ZodiacElementId;
  readonly modality: ZodiacModality;
  /** Hex, already the colour the aura burns. */
  readonly colour: string;
}

/**
 * The zodiac's own arithmetic, not a table someone typed out. Counting from
 * Áries the elements repeat every four signs and the modalities every three,
 * so both fall out of the index and can never drift away from it.
 */
const ELEMENTS: readonly ZodiacElementId[] = ['fogo', 'terra', 'ar', 'agua'];
const MODALITIES: readonly ZodiacModality[] = ['cardeal', 'fixo', 'mutavel'];

/** One base colour per element, from the one palette the app paints from. */
const AURA_BASE: Record<ZodiacElementId, string> = AURA;

/** Degrees of hue between the three signs that share an element. */
const TRIAD_HUE_STEP = 14;

export const SIGN_COUNT = ZODIAC_SIGNS.length;
const DEGREES_PER_SIGN = 360 / SIGN_COUNT;

const wrapDegrees = (degrees: number): number => ((degrees % 360) + 360) % 360;

/** Where a sign sits inside its own element's trio: 0, 1 or 2. */
export const triadPosition = (index: number): number => Math.floor(index / ELEMENTS.length);

const hexToHsl = (hex: string): [number, number, number] => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return [0, 0, lightness];

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  return [wrapDegrees(hue * 60), saturation, lightness];
};

const hslToHex = (hue: number, saturation: number, lightness: number): string => {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const sector = wrapDegrees(hue) / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [r, g, b] =
    sector < 1 ? [chroma, second, 0]
    : sector < 2 ? [second, chroma, 0]
    : sector < 3 ? [0, chroma, second]
    : sector < 4 ? [0, second, chroma]
    : sector < 5 ? [second, 0, chroma]
    : [chroma, 0, second];

  const match = lightness - chroma / 2;
  const channel = (component: number) =>
    Math.round(Math.min(255, Math.max(0, (component + match) * 255)))
      .toString(16)
      .padStart(2, '0');

  return `#${channel(r)}${channel(g)}${channel(b)}`;
};

/**
 * The three signs of an element share its colour and part on hue alone, so an
 * Air aura always reads as Air while Gêmeos, Libra and Aquário are still told
 * apart. The middle sign of each trio keeps the base colour untouched.
 */
export function auraColour(index: number): string {
  const element = ELEMENTS[index % ELEMENTS.length];
  const [hue, saturation, lightness] = hexToHsl(AURA_BASE[element]);
  return hslToHex(hue + (triadPosition(index) - 1) * TRIAD_HUE_STEP, saturation, lightness);
}

export function zodiacProfile(index: number): ZodiacProfile {
  const safe = ((index % SIGN_COUNT) + SIGN_COUNT) % SIGN_COUNT;
  const sign = ZODIAC_SIGNS[safe];
  return {
    index: safe,
    name: sign.name,
    icon: sign.icon,
    element: ELEMENTS[safe % ELEMENTS.length],
    modality: MODALITIES[safe % MODALITIES.length],
    colour: auraColour(safe),
  };
}

/** Where the Sun stood, turned into a sign. */
export function signIndexAt(date: Date): number {
  const longitude = Ecliptic(GeoVector(Body.Sun, date, true)).elon;
  return Math.floor(wrapDegrees(longitude) / DEGREES_PER_SIGN);
}

export const zodiacProfileAt = (date: Date): ZodiacProfile => zodiacProfile(signIndexAt(date));

/**
 * How far the aura reaches, by level. Logarithmic, so the first levels are
 * when it visibly grows: that is when someone is deciding whether the app is
 * worth returning to, and a linear curve would give them almost nothing.
 */
export const AURA_MIN_SCALE = 1;
export const AURA_MAX_SCALE = 1.75;
export const AURA_FULL_LEVEL = 50;

export function auraScale(level: number): number {
  const steps = Math.max(0, Math.min(level, AURA_FULL_LEVEL) - 1);
  const growth = Math.log1p(steps) / Math.log1p(AURA_FULL_LEVEL - 1);
  return AURA_MIN_SCALE + (AURA_MAX_SCALE - AURA_MIN_SCALE) * growth;
}

// --- preferência por aparelho -------------------------------------------

const BIRTH_KEY = 'ce:sanctuary:nascimento';
const BIRTH_EVENT = 'ce:sanctuary:nascimento:changed';

/** YYYY-MM-DD, read as local noon so a timezone cannot shift the day. */
export function parseBirthDate(raw: string | null): Date | null {
  if (!raw) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return date;
}

export function getBirthDatePreference(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BIRTH_KEY);
    return parseBirthDate(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function setBirthDatePreference(value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value && parseBirthDate(value)) window.localStorage.setItem(BIRTH_KEY, value);
    else window.localStorage.removeItem(BIRTH_KEY);
    window.dispatchEvent(new CustomEvent<string | null>(BIRTH_EVENT, { detail: value }));
  } catch {
    /* Storage denied: the aura simply keeps its neutral colour. */
  }
}

/** The profile for a stored birth date, or null while nobody has given one. */
export function getZodiacPreference(): ZodiacProfile | null {
  const date = parseBirthDate(getBirthDatePreference());
  return date ? zodiacProfileAt(date) : null;
}

export const useZodiacPreference = () => {
  const [profile, setProfile] = useState<ZodiacProfile | null>(() => getZodiacPreference());

  useEffect(() => {
    const sync = () => setProfile(getZodiacPreference());
    window.addEventListener('storage', sync);
    window.addEventListener(BIRTH_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(BIRTH_EVENT, sync);
    };
  }, []);

  const update = (value: string | null) => {
    setBirthDatePreference(value);
    setProfile(getZodiacPreference());
  };

  return { profile, birthDate: getBirthDatePreference(), setBirthDate: update };
};
