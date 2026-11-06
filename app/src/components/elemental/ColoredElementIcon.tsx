import { useId, type CSSProperties } from 'react';
import type { ElementId } from '@/types';

const palette = {
  terra: { light: '#bbf7b2', mid: '#4dd6a2', dark: '#166b51', glow: '#65dfa7' },
  fogo: { light: '#fff0a0', mid: '#ff9b42', dark: '#dc4936', glow: '#ff9b42' },
  agua: { light: '#c9f9ff', mid: '#39c5ef', dark: '#2275cb', glow: '#5bd6ff' },
  ar: { light: '#f1fdff', mid: '#aedbf1', dark: '#649bb8', glow: '#ccecff' },
} as const;

/** Original elemental miniatures, with native SVG gradients and no raster/font dependency. */
export function ColoredElementIcon({ element, size = '1em', label, className = '', style }: {
  element: ElementId; size?: number | string; label?: string; className?: string; style?: CSSProperties;
}) {
  const id = `element-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const p = palette[element] ?? palette.terra;
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none" className={`arcane-icon elemental-sigil ${className}`} style={{ display:'inline-block',verticalAlign:'-.15em',flexShrink:0,...style }} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} focusable="false">
    <defs><linearGradient id={`${id}-body`} x1="8" y1="4" x2="24" y2="29" gradientUnits="userSpaceOnUse"><stop stopColor={p.light}/><stop offset=".5" stopColor={p.mid}/><stop offset="1" stopColor={p.dark}/></linearGradient><radialGradient id={`${id}-halo`}><stop stopColor={p.glow} stopOpacity=".24"/><stop offset="1" stopColor={p.glow} stopOpacity="0"/></radialGradient></defs>
    <circle cx="16" cy="16" r="16" fill={`url(#${id}-halo)`}/>
    {element==='terra' ? <>
      <path d="m4 21 4-9 7-6 10 5 4 13-12 5-13-4v-4Z" fill="#415b48" stroke="#b4d798" strokeWidth=".8" strokeLinejoin="round"/>
      <path d="m8 12 7-6 3 12-8 5-2-11Zm10 6 7-7 4 13-11-6Zm-8 5 8-5-1 11-7-6Z" fill={`url(#${id}-body)`}/>
      <path d="m15 6 3 12-10-6m10 6 7-7m-7 7-1 11-7-6m8-5 11 6" stroke="#d9ffe3" strokeOpacity=".65" strokeWidth=".7" strokeLinejoin="round"/>
      <path d="m7 23 4 3m10-1 4-1" stroke="#d1ab70" strokeWidth="1.4" strokeLinecap="round"/>
    </> : element==='fogo' ? <>
      <path d="M18 2c2 7 9 11 9 18a11 11 0 0 1-22 0c0-5 3-9 7-13-1 5 1 7 3 9 3-5 5-9 3-14Z" fill={`url(#${id}-body)`} stroke="#ffd181" strokeWidth=".7"/>
      <path d="M17 16c2 4 5 5 4 9-1 5-9 5-10 0-1-3 2-6 4-9 0 3 1 4 2 5 1-2 1-3 0-5Z" fill="#fff0a7"/>
      <path d="M8 19q-1 6 4 8" stroke="#ffca83" strokeWidth="1.2" strokeLinecap="round"/>
    </> : element==='agua' ? <>
      <path d="M16 2C12 8 5 15 5 21a11 11 0 0 0 22 0C27 15 20 8 16 2Z" fill={`url(#${id}-body)`} stroke="#a4efff" strokeWidth=".8"/>
      <path d="M13 10q-5 6-5 10" stroke="#e1fdff" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M7 23q4-4 9 0t9 0m-14 4q5 2 10-1" stroke="#c5f5ff" strokeWidth="1.1" strokeLinecap="round"/>
    </> : <>
      <path d="M26 11c-3-7-18-6-21 3-4 12 15 17 22 8-11 4-21-1-18-7 3-6 14-7 17-4Z" fill={`url(#${id}-body)`}/>
      <path d="M3 19c0-9 15-16 24-8M6 24c10 6 25-2 22-12M11 20c6 4 16-2 13-7M7 12c7-7 16-4 13 1" stroke="#e3f9ff" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M4 8h4m17 18h3M13 3h4" stroke="#91c7e2" strokeWidth="1.2" strokeLinecap="round"/>
    </>}
  </svg>;
}
