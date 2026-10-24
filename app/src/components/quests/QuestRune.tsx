import type { ElementId } from '@/types';

/** Decorative original artwork; the adjacent text always carries the meaning. */
export function QuestRune({ element, size = 48 }: { element: ElementId; size?: number }) {
  return <svg className="quest-rune" data-element={element} width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
    <circle className="quest-rune-orbit" cx="24" cy="24" r="21" stroke="currentColor" strokeWidth=".8" strokeDasharray="2 7" opacity=".4" />
    <g className="quest-rune-core" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {element === 'terra' && <><path d="m24 7 13 10 3 16-16 9L8 33l3-16Z" fill="currentColor" fillOpacity=".13" /><path d="m24 7-7 15 7 20 7-20Zm-13 10 6 5-9 11m29-16-6 5 9 11M17 22h14" /><path d="m24 7-7 15h14Z" fill="currentColor" fillOpacity=".3" /></>}
      {element === 'fogo' && <><path d="M25 6c3 10-8 13-5 20 4-1 6-5 7-9 8 7 12 12 9 19-4 9-21 9-25-1-3-8 3-15 8-19-1 6 1 7 3 7-2-7 6-10 3-17Z" fill="currentColor" fillOpacity=".18" /><path d="M25 25c-1 5-7 6-6 11 1 5 9 5 11 0 1-4-2-8-5-11Z" fill="currentColor" fillOpacity=".55" /></>}
      {element === 'agua' && <><path d="M24 6C19 14 11 23 11 30a13 13 0 0 0 26 0C37 23 29 14 24 6Z" fill="currentColor" fillOpacity=".18" /><path className="quest-rune-current" d="M12 29c8-7 16 7 24 0M15 34c6-4 12 4 18 0" /><path d="M18 23c-2 3-3 5-3 7" strokeWidth="2.5" opacity=".8" /></>}
      {element === 'ar' && <><circle cx="24" cy="24" r="14" fill="currentColor" fillOpacity=".1" strokeOpacity=".3" /><g className="quest-rune-vortex"><path d="M13 16c10-13 28-2 20 11-4 6-13 4-13-2 0-4 5-5 7-2M35 32C25 45 7 34 15 21c4-6 13-4 13 2 0 4-5 5-7 2" /><path d="M8 24C6 10 25 4 34 14M40 24c2 14-17 20-26 10" opacity=".55" /></g></>}
    </g>
    <path className="quest-rune-glint" d="m37 6 1.5 3.5L42 11l-3.5 1.5L37 16l-1.5-3.5L32 11l3.5-1.5Z" fill="currentColor" />
  </svg>;
}

export function QuestVictorySeal() {
  return <div className="quest-victory" aria-hidden="true">
    <svg viewBox="0 0 160 160" fill="none" focusable="false">
      <circle className="quest-victory-halo" cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="1" />
      <g className="quest-victory-orbit" stroke="currentColor" opacity=".6"><path d="m80 10 60 35v70l-60 35-60-35V45Z" /><circle cx="80" cy="80" r="49" strokeDasharray="2 9" /></g>
      <g className="quest-victory-sparks" fill="currentColor"><path d="m80 4 3 7-3 7-3-7Zm0 138 3 7-3 7-3-7ZM4 80l7-3 7 3-7 3Zm138 0 7-3 7 3-7 3Z" /></g>
      <path className="quest-victory-medal" d="m80 34 35 20v42l-35 24-35-24V54Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" />
      <path className="quest-victory-check" d="m61 78 13 13 27-29" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
    </svg>
  </div>;
}
