import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SECTIONS = new Set(['grimoire-character', 'grimoire-elements', 'grimoire-history', 'grimoire-backup']);

/** Runs after the global route reset and after this page's sections mount. */
export function useGrimoireAnchor() {
  const { hash, key } = useLocation();
  useEffect(() => {
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    if (!SECTIONS.has(id)) return;
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(id);
      if (!section) return;
      section.focus({ preventScroll: true });
      section.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);
}
