import { useId } from 'react';

/** The same XP medallion in predictions and confirmed receipts; never grants XP. */
export function ExperienceIcon({size=24,label,className=''}:{size?:number|string;label?:string;className?:string}) {
  const id=`xp-${useId().replace(/[^a-zA-Z0-9_-]/g,'')}`;
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none" className={`experience-icon ${className}`} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} focusable="false">
    <defs><linearGradient id={`${id}-metal`} x1="5" y1="3" x2="25" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#fff2bb"/><stop offset=".45" stopColor="#e3bd61"/><stop offset="1" stopColor="#917039"/></linearGradient><radialGradient id={`${id}-center`}><stop stopColor="#4b4230"/><stop offset="1" stopColor="#171c25"/></radialGradient></defs>
    <circle cx="16" cy="16" r="14" fill={`url(#${id}-center)`} stroke={`url(#${id}-metal)`} strokeWidth="1.6"/>
    <circle cx="16" cy="16" r="11" stroke="#d5b66f" strokeOpacity=".22" strokeWidth=".6"/>
    <path d="m16 5 3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill={`url(#${id}-metal)`}/>
    <path d="m16 11 5 5-5 5-5-5 5-5Z" fill="#ffedb1" stroke="#fff5d2" strokeWidth=".6"/>
    <path d="m16 14 2 2-2 2-2-2 2-2Z" fill="#63c8bb"/>
    <path d="m6 6 2 2m16 16 2 2" stroke="#fff0b5" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>;
}
