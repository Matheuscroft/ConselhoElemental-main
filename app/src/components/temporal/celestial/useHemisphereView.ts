import { useState } from 'react';
import { getHemisphereFromLatitude, type Hemisphere } from '@/constants';

/** View preference only: reuse existing cached latitude, never request or persist location. */
export function useHemisphereView() {
  return useState<Hemisphere>(() => {
    try {
      const raw = localStorage.getItem('ce:user-latitude');
      const latitude = raw?.trim() ? Number(raw) : null;
      return getHemisphereFromLatitude(latitude !== null && Number.isFinite(latitude) && Math.abs(latitude) <= 90 ? latitude : null);
    } catch { return getHemisphereFromLatitude(null); }
  });
}
