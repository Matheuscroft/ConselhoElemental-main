import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useMotionPreference } from './useMotionPreference';

export function ElementalMotion({ children }: { children: ReactNode }) {
  const reduced = useMotionPreference();
  return <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>{children}</MotionConfig>;
}
