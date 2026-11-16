import type { ReactNode, Ref } from 'react';
import { motion, useIsPresent } from 'framer-motion';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { beatUnless } from '@/lib/motion/motion';

/** How far a step travels, and how much it shrinks, on the way in and out. */
const DESLOCAMENTO = 32;
const ESCALA = 0.985;

/**
 * One step of the invocation. Going forward, the next step comes in from the
 * right while the last one leaves to the left; going back, the other way round.
 * The way out is quick and the way in settles, so the step you asked for is
 * never waiting on the one that is leaving. Reduced motion only fades.
 * Content that is leaving cannot receive another tap or keyboard focus.
 *
 * The step that leaves is lifted out of the flow while it goes (AnimatePresence
 * `popLayout`), so the pane takes the size of the next step at once instead of
 * collapsing between the two. For that, the ref reaches the element.
 */
export function PassoInvocar({ direction, children, ref }: { direction: number; children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  const reduced = useMotionPreference();
  const present = useIsPresent();
  return <motion.div ref={ref} className="invocation-step" inert={!present}
    custom={direction} initial="entra" animate="fica" exit="sai"
    variants={{
      entra: (valor: number) => ({ opacity: 0, x: reduced ? 0 : valor * DESLOCAMENTO, scale: reduced ? 1 : ESCALA }),
      fica: { opacity: 1, x: 0, scale: 1, transition: beatUnless(reduced, 'settle') },
      sai: (valor: number) => ({ opacity: 0, x: reduced ? 0 : -valor * DESLOCAMENTO, scale: reduced ? 1 : ESCALA, transition: beatUnless(reduced, 'reveal', { ease: 'exit' }) }),
    }}>
    {children}
  </motion.div>;
}
