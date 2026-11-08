import { useEffect, useState } from 'react';

/** Cities the sanctuary sky can be anchored to. Chosen by hand; never inferred from IP or account. */
export type SanctuaryCityId = 'recife' | 'olinda';

export interface SanctuaryCity {
  readonly id: SanctuaryCityId;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  /** Metres above sea level, used by the refraction model. */
  readonly elevation: number;
  readonly timeZone: string;
}

export const SANCTUARY_CITIES: readonly SanctuaryCity[] = [
  { id: 'recife', name: 'Recife', latitude: -8.0476, longitude: -34.877, elevation: 4, timeZone: 'America/Recife' },
  { id: 'olinda', name: 'Olinda', latitude: -8.0089, longitude: -34.8553, elevation: 10, timeZone: 'America/Recife' },
];

export const DEFAULT_SANCTUARY_CITY_ID: SanctuaryCityId = 'recife';

const isSanctuaryCityId = (value: unknown): value is SanctuaryCityId => {
  return SANCTUARY_CITIES.some((city) => city.id === value);
};

export const getSanctuaryCity = (id: SanctuaryCityId): SanctuaryCity => {
  return SANCTUARY_CITIES.find((city) => city.id === id) ?? SANCTUARY_CITIES[0];
};

const SANCTUARY_CITY_KEY = 'ce:sanctuary:city';
const SANCTUARY_CITY_EVENT = 'ce:sanctuary:city:changed';

export const getSanctuaryCityPreference = (): SanctuaryCityId => {
  if (typeof window === 'undefined') return DEFAULT_SANCTUARY_CITY_ID;

  const raw = window.localStorage.getItem(SANCTUARY_CITY_KEY);
  return isSanctuaryCityId(raw) ? raw : DEFAULT_SANCTUARY_CITY_ID;
};

export const setSanctuaryCityPreference = (value: SanctuaryCityId): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SANCTUARY_CITY_KEY, value);
  window.dispatchEvent(new CustomEvent<SanctuaryCityId>(SANCTUARY_CITY_EVENT, { detail: value }));
};

export const useSanctuaryCityPreference = () => {
  const [cityId, setCityId] = useState<SanctuaryCityId>(() => getSanctuaryCityPreference());

  useEffect(() => {
    const syncFromStorage = () => {
      setCityId(getSanctuaryCityPreference());
    };

    const onCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<SanctuaryCityId>;
      if (isSanctuaryCityId(customEvent.detail)) {
        setCityId(customEvent.detail);
        return;
      }
      syncFromStorage();
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(SANCTUARY_CITY_EVENT, onCustomEvent);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(SANCTUARY_CITY_EVENT, onCustomEvent);
    };
  }, []);

  const updatePreference = (value: SanctuaryCityId) => {
    setSanctuaryCityPreference(value);
    setCityId(value);
  };

  return {
    cityId,
    city: getSanctuaryCity(cityId),
    setCity: updatePreference,
  };
};
