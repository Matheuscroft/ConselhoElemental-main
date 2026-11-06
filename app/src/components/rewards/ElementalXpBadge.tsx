import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ExperienceIcon } from './ExperienceIcon';
import './elemental-xp-badge.css';

const elements={terra:{name:'Terra',color:'108 221 166'},fogo:{name:'Fogo',color:'255 173 99'},agua:{name:'Água',color:'112 213 247'},ar:{name:'Ar',color:'204 235 247'}} as const;
/** Display-only: callers supply their already formatted/confirmed values unchanged. */
export function ElementalXpBadge({value,element='terra',size='md',className='',title,ariaLabel}:{value:string;element?:ElementId;size?:'sm'|'md';className?:string;title?:string;ariaLabel?:string}) {
  const info=elements[element];
  return <span className={`elemental-xp-badge elemental-xp-badge--${size} ${className}`} data-element={element} style={{'--xp-element':info.color} as CSSProperties} title={title} role="img" aria-label={ariaLabel ?? `${value} XP · ${info.name}`}>
    <span className="elemental-xp-badge-value"><ExperienceIcon size={size==='sm'?18:26}/><strong>{value} <span>XP</span></strong></span>
    <span className="elemental-xp-badge-element"><ElementIcon element={element} size={size==='sm'?22:30}/><span className={size==='sm'?'sr-only':undefined}>{info.name}</span></span>
  </span>;
}
