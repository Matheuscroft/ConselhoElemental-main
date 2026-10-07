import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AuroraBackgroundProps {
  className?: string;
  children?: ReactNode;
  starCount?: number;
  gradientColors?: [string, string];
  pulseDuration?: number;
}

/** Decorative, fixed canvas. Content keeps normal scrolling and accessible semantics. */
export default function AuroraBackground({
  className, children, starCount = 40,
  gradientColors = ['rgba(168,85,247,0.28)', 'rgba(79,70,229,0.32)'],
  pulseDuration = 10,
}: AuroraBackgroundProps) {
  const count = Number.isFinite(starCount) ? Math.min(80, Math.max(0, Math.floor(starCount))) : 40;
  const duration = Number.isFinite(pulseDuration) ? Math.max(4, pulseDuration) : 10;
  return <>
    <div aria-hidden="true" className={cn('aurora-background', className)} style={{
      '--aurora-color1': gradientColors[0], '--aurora-color2': gradientColors[1],
      '--aurora-pulse-duration': `${duration}s`,
    } as CSSProperties}>
      <div className="aurora-glow aurora-glow-a" />
      <div className="aurora-glow aurora-glow-b" />
      <div className="aurora-glow aurora-glow-c" />
      {Array.from({ length: count }, (_, i) => <span key={i} className="aurora-star" style={{
        left: `${(i * 61.803 + 7) % 100}%`, top: `${(i * 37.719 + 13) % 100}%`,
        animationDelay: `${-(i % 7)}s`, animationDuration: `${4 + i % 5}s`,
      }} />)}
    </div>
    {children}
  </>;
}
