import { preserveCycleDateScroll } from '@/components/cycles/cycle-date-navigation';
import { preserveTemporalScroll } from '@/components/temporal/temporal-navigation';
import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { preserveQuestStepScroll } from '@/components/quests/quest-navigation';
import { preserveAreaFilterScroll } from '@/components/elemental/navigation';
import { preserveDiscoveryScroll } from './discovery-scroll';

/** Navegação começa no topo; editar filtros da mesma página elemental preserva a posição. */
export function ScrollToTop() {
  const { key, pathname, search, state } = useLocation();
  const previousPath = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    const preserve = preserveCycleDateScroll(previousPath.current, pathname, state)
      || preserveTemporalScroll(previousPath.current, pathname, state)
      || preserveDiscoveryScroll(previousPath.current, pathname, state)
      || preserveAreaFilterScroll(previousPath.current, pathname, state)
      || preserveQuestStepScroll(previousPath.current, pathname, state);
    previousPath.current = pathname;
    if (!preserve) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [key, pathname, search, state]);

  return null;
}
