import { Body, Equator, Horizon, Illumination, MoonPhase, Observer } from 'astronomy-engine';
import { getHemisphereFromLatitude, getSeason, type Hemisphere } from '@/constants';
import type { SanctuaryCity } from '@/lib/temporal/sanctuary-city';

/**
 * Read-only sky for the awakening scene: where the Sun and the Moon actually are
 * for a hand-picked city, and which season that city is in. Never consumed by game rules.
 */

export interface SanctuaryBody {
  /** Degrees above the horizon, corrected for refraction. Negative means below. */
  readonly altitude: number;
  /** Degrees clockwise from true north. */
  readonly azimuth: number;
  readonly aboveHorizon: boolean;
}

export interface SanctuaryMoon extends SanctuaryBody {
  readonly phaseName: string;
  readonly phaseAngle: number;
  readonly illuminated: number;
  readonly waxing: boolean;
}

/** Coarse light mood. Boundaries follow the usual twilight definitions. */
export type SanctuaryDaylight = 'day' | 'golden' | 'dusk' | 'night';

export interface SanctuarySky {
  readonly at: Date;
  readonly city: SanctuaryCity;
  readonly hemisphere: Hemisphere;
  readonly season: { name: string; icon: string };
  readonly sun: SanctuaryBody;
  readonly moon: SanctuaryMoon;
  readonly daylight: SanctuaryDaylight;
}

const PHASE_NAMES = [
  'Lua Nova',
  'Lua Crescente',
  'Quarto Crescente',
  'Gibosa Crescente',
  'Lua Cheia',
  'Gibosa Minguante',
  'Quarto Minguante',
  'Lua Balsâmica',
];

const observerFor = (city: SanctuaryCity) => new Observer(city.latitude, city.longitude, city.elevation);

const horizonFor = (body: Body, date: Date, observer: Observer): SanctuaryBody => {
  const equatorial = Equator(body, date, observer, true, true);
  const horizontal = Horizon(date, observer, equatorial.ra, equatorial.dec, 'normal');
  return {
    altitude: horizontal.altitude,
    azimuth: horizontal.azimuth,
    aboveHorizon: horizontal.altitude > 0,
  };
};

const daylightFor = (sunAltitude: number): SanctuaryDaylight => {
  if (sunAltitude > 10) return 'day';
  if (sunAltitude > 0) return 'golden';
  if (sunAltitude > -6) return 'dusk';
  return 'night';
};

export function sanctuarySky(date: Date, city: SanctuaryCity): SanctuarySky {
  const observer = observerFor(city);
  const sun = horizonFor(Body.Sun, date, observer);
  const moonPosition = horizonFor(Body.Moon, date, observer);
  const longitude = MoonPhase(date);
  const illumination = Illumination(Body.Moon, date);
  const hemisphere = getHemisphereFromLatitude(city.latitude);

  return {
    at: date,
    city,
    hemisphere,
    season: getSeason(date, { hemisphere }),
    sun,
    moon: {
      ...moonPosition,
      phaseName: PHASE_NAMES[Math.round(longitude / 45) % 8],
      phaseAngle: illumination.phase_angle,
      illuminated: illumination.phase_fraction,
      waxing: longitude < 180,
    },
    daylight: daylightFor(sun.altitude),
  };
}

/**
 * The scene is a fixed camera, not a planetarium. These two constants were picked
 * so the computed anchors land where the concept art already placed the Sun and the
 * Moon: looking south, a late-afternoon Sun to the west sits on the right-hand side.
 */
export const CAMERA_BEARING = 180;
export const HORIZONTAL_FIELD = 220;
export const VERTICAL_FIELD = 90;
/** Matches `ancoras.horizonte.y` in the scene manifest. */
export const HORIZON_Y = 0.47;

export interface SanctuaryAnchor {
  /** Fraction of the plate width; 0.5 is the centre of the camera. */
  readonly x: number;
  /** Fraction of the plate height; HORIZON_Y is the horizon line. */
  readonly y: number;
  /** False when the body is below the horizon, or outside the camera's arc. */
  readonly visible: boolean;
}

const signedBearing = (azimuth: number): number => {
  const delta = ((azimuth - CAMERA_BEARING) % 360 + 540) % 360 - 180;
  return delta;
};

/** Where to draw a body on the plate. The caller still decides whether to draw it. */
export function sanctuaryAnchor(body: SanctuaryBody): SanctuaryAnchor {
  const bearing = signedBearing(body.azimuth);
  const x = 0.5 + bearing / HORIZONTAL_FIELD;
  const y = HORIZON_Y - (body.altitude / VERTICAL_FIELD) * HORIZON_Y;
  return {
    x,
    y,
    visible: body.aboveHorizon && Math.abs(bearing) <= HORIZONTAL_FIELD / 2,
  };
}

/**
 * Where the painting puts the Sun and the Moon, from `camadas` in the scene
 * manifest. The plate was composited with both removed, so the app draws them.
 *
 * The scene uses these rather than `sanctuaryAnchor`, because a live position
 * fights the artwork: the plate is one late afternoon, lit from the Sun on the
 * right, and at 07:35 the real Sun sits on the left edge beside the Moon. The
 * manifest says as much — the anchor is the default and the sky is composed.
 *
 * What stays real is everything the eye cannot place: the Moon's phase and
 * illuminated fraction, the season for the city's hemisphere, and the light of
 * the moment. The caption names all three, and says so when the real Moon is
 * below the horizon, which is the artistic licence the plan asked be declared.
 */
export const COMPOSED_SUN: SanctuaryAnchor = { x: 0.835, y: 0.411, visible: true };
export const COMPOSED_MOON: SanctuaryAnchor = { x: 0.396, y: 0.075, visible: true };

/**
 * What the scene can honestly say about the sky it is showing: the season for
 * the city's own hemisphere, the city, and the Moon's real phase. When the
 * real Moon is below the horizon the sentence says so, because the scene
 * draws it regardless and the plan asked that the licence be declared.
 */
export function sanctuaryCaption(sky: SanctuarySky): string {
  const phase = sky.moon.phaseName.toLocaleLowerCase('pt-BR');
  const horizon = sky.moon.aboveHorizon ? '' : ', abaixo do horizonte agora';
  return `${sky.season.name} em ${sky.city.name}, ${phase}${horizon}`;
}
