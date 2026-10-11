import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Toda entrada de navegação começa no topo, inclusive abas via query string. */
export function ScrollToTop() {
  const { key, pathname, search } = useLocation();

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [key, pathname, search]);

  return null;
}
