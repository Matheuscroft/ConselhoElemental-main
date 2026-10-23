import { Body, Illumination, KM_PER_AU, MoonPhase, NextMoonQuarter, SearchMoonQuarter } from 'astronomy-engine';

const PHASE_NAMES = ['Lua Nova', 'Lua Crescente', 'Quarto Crescente', 'Gibosa Crescente', 'Lua Cheia', 'Gibosa Minguante', 'Quarto Minguante', 'Lua Balsâmica'];
const QUARTERS = ['Lua Nova', 'Quarto Crescente', 'Lua Cheia', 'Quarto Minguante'];

/** Read-only ephemeris for the lunar page; never consumed by game rules. */
export function lunarSnapshot(date: Date) {
  const longitude = MoonPhase(date);
  const illumination = Illumination(Body.Moon, date);
  return {
    at: date,
    longitude,
    phaseAngle: illumination.phase_angle,
    illuminated: illumination.phase_fraction,
    distanceKm: illumination.geo_dist * KM_PER_AU,
    waxing: longitude < 180,
    name: PHASE_NAMES[Math.round(longitude / 45) % 8],
  };
}
export type LunarSnapshot = ReturnType<typeof lunarSnapshot>;

export function nextLunarQuarters(date: Date) {
  let event = SearchMoonQuarter(date);
  return Array.from({ length: 4 }, () => {
    const result = { name: QUARTERS[event.quarter], quarter: event.quarter, at: event.time.date };
    event = NextMoonQuarter(event);
    return result;
  });
}

/** Camera looks along -Z. Waxing light is +X in the north-up reference view. */
export function lunarLightDirection(phaseAngle: number, waxing: boolean): [number, number, number] {
  const angle = phaseAngle * Math.PI / 180;
  return [Math.sin(angle) * (waxing ? 1 : -1), 0, Math.cos(angle)];
}

/** Visible illuminated outline of a unit sphere, projected orthographically. */
export function lunarDiscPath(phaseAngle: number) {
  const cosine = Math.cos(phaseAngle * Math.PI / 180);
  const terminatorRadius = Math.abs(cosine) * 48;
  return `M 50 2 A 48 48 0 0 1 50 98 A ${Math.max(.0001, terminatorRadius)} 48 0 0 ${cosine >= 0 ? 1 : 0} 50 2 Z`;
}
