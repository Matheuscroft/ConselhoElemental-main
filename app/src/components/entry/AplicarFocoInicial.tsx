import { useEffect } from 'react';
import { clearOpeningAreas, getOpeningAreas } from '@/lib/sanctuary/first-run';
import { sanearAreas } from '@/lib/sanctuary/foco-inicial';
import { useAppStore } from '@/stores/appStore';

/**
 * Hands the areas chosen in the opening (kept on the device before the account existed) to the app, once.
 * It only acts when the app has no areas of its own yet, so it never overwrites a choice the person already made
 * there, and it always clears what it read, so it can never run twice. Renders nothing.
 */
export function AplicarFocoInicial() {
  useEffect(() => {
    const ids = sanearAreas(getOpeningAreas());
    if (ids.length === 0) return;
    const { onboarding, selectArea } = useAppStore.getState();
    if (onboarding.selectedAreas.length === 0) ids.forEach((id) => selectArea(id));
    clearOpeningAreas();
  }, []);
  return null;
}

export default AplicarFocoInicial;
