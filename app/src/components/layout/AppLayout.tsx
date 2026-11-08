import { TemporalReturnLink } from '@/components/temporal/TemporalReturnLink';
import React from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  hideNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  rightAction,
}) => {
  const location = useLocation();
  const reducedMotion = useMotionPreference();

  return (
    <div className="min-h-screen text-fg-primary bg-transparent overflow-x-hidden selection:bg-mystic-arcane/40">
      <Sidebar />
      <TopBar title={title} showBackButton={showBackButton} rightAction={rightAction} />

      <main id="main-content" className="relative z-10 px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:ml-72 md:px-8 md:pt-6">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
              transition={{ duration: reducedMotion ? .12 : .24, ease: [.23, 1, .32, 1] }}
            >
              <TemporalReturnLink />
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};
