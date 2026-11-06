import { forwardRef, type SVGProps } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';
import { ANATOMY, BODY_OUTLINES, MOVEMENTS, type FitnessGlyphName } from './fitness-glyph-data';
export type { FitnessGlyphName } from './fitness-glyph-data';

type Props = SVGProps<SVGSVGElement> & { name: FitnessGlyphName; size?: number | string; label?: string };
type Movement = {fill:string;line:string;head?:readonly number[];circles?:readonly (readonly number[])[];inverse?:boolean;accent?:string;neutral?:boolean};
type Anatomy = {body:keyof typeof BODY_OUTLINES;target:string;detail?:string;rear?:boolean};
const CONTEXT = 'rgb(var(--el-muted, 170 180 196))';

/** Literal, two-tone illustrations. Anatomy always retains the body context. */
export const FitnessGlyph = forwardRef<SVGSVGElement, Props>(({name, size=24, label, className='', ...props}, ref) => {
  const anatomy = (ANATOMY as Partial<Record<FitnessGlyphName, Anatomy>>)[name];
  const movement = (MOVEMENTS as Partial<Record<FitnessGlyphName, Movement>>)[name];
  return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`fitness-glyph ${className}`} role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} focusable="false" {...props}>
    {anatomy ? <>
      <g className="fitness-glyph-context" fill={CONTEXT} fillOpacity={.12} stroke={CONTEXT} strokeOpacity={.65} strokeWidth={1.3}>
        {anatomy.body==='upper' && <circle cx={16} cy={5} r={3.1} />}
        <path d={BODY_OUTLINES[anatomy.body]} />
        {anatomy.rear && <path d={anatomy.body==='upper'?'M16 12v16':'M16 5v7'} fill="none" strokeOpacity={.4} />}
      </g>
      <path className="fitness-glyph-target" d={anatomy.target} fill="currentColor" fillOpacity={.8} strokeWidth={.7}/>
      {anatomy.detail && <path d={anatomy.detail} stroke="rgb(var(--el-canvas, 8 11 18))" strokeWidth={.8}/>}
    </> : movement ? <>
      {movement.head && <circle cx={movement.head[0]} cy={movement.head[1]} r={movement.head[2]} fill="currentColor" strokeWidth={.6}/>}
      {movement.circles?.map(([cx,cy,r],i)=><circle key={i} cx={cx} cy={cy} r={r} strokeWidth={1.7}/>)}
      <path d={movement.fill} fill={movement.neutral?CONTEXT:"currentColor"} stroke={movement.neutral?CONTEXT:undefined} fillOpacity={.24} strokeWidth={1.4}/>
      <path d={movement.line} stroke={movement.inverse?'rgb(var(--el-text, 242 239 231))':movement.neutral?CONTEXT:'currentColor'} strokeWidth={1.8}/>
      {movement.accent && <path d={movement.accent} fill="currentColor" strokeWidth={.5}/>}
    </> : null}
  </svg>;
});
FitnessGlyph.displayName='FitnessGlyph';

function glyph(name: FitnessGlyphName): LucideIcon {
  const Icon=forwardRef<SVGSVGElement,LucideProps>(({absoluteStrokeWidth,size=24,strokeWidth=1.6,...props},ref)=><FitnessGlyph {...props} ref={ref} name={name} size={size} strokeWidth={absoluteStrokeWidth?Number(strokeWidth)*32/Number(size):strokeWidth}/>);
  Icon.displayName=`FitnessGlyph(${name})`;
  return Icon;
}
export const FITNESS_ICONS = Object.fromEntries([...Object.keys(ANATOMY),...Object.keys(MOVEMENTS)].map(name=>[name,glyph(name as FitnessGlyphName)])) as Record<FitnessGlyphName,LucideIcon>;
