import type { ReactNode } from 'react';
import { motion, useIsPresent } from 'framer-motion';
import { useMotionPreference } from './useMotionPreference';
import { beatUnless } from '@/lib/motion/motion';

export function creationStepPose(direction: number, reduced: boolean, exiting = false) {
  return { opacity: 0, x: reduced ? 0 : (exiting ? -1 : 1) * direction * 12 };
}

/** Exiting content cannot receive another tap or keyboard focus. */
export function CreationStep({ direction, children }: { direction: number; children: ReactNode }) {
  const reduced = useMotionPreference();
  const present = useIsPresent();
  return <motion.div className="invocation-step" inert={!present}
    custom={direction} initial="enter" animate="visible" exit="exit"
    variants={{
      enter: (value: number) => creationStepPose(value, reduced),
      visible: { opacity: 1, x: 0 },
      exit: (value: number) => creationStepPose(value, reduced, true),
    }}
    transition={beatUnless(reduced, 'feedback')}>
    {children}
  </motion.div>;
}
