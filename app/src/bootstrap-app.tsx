import { AccountConnectionContext } from './lib/backup/account-connection-context';
import { AccountSyncStatus } from './components/backup/AccountSyncStatus';
import type { LiveAccountSync } from './lib/backup/account-live-sync';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/elemental-theme.css'
import './styles/elemental-motion.css'
import './styles/elemental-rewards.css'
import { ElementalMotion } from './components/motion/ElementalMotion'
import AuroraBackground from './components/ui/aurora-background'

/** Imported only after the pre-hydration guard accepts this document. */
export function mountApp(root: HTMLElement, sync?: LiveAccountSync) {
  createRoot(root).render(
    <StrictMode>
      <AccountConnectionContext value={sync ?? null}><ElementalMotion><AuroraBackground gradientColors={['rgba(139,206,227,0.10)', 'rgba(213,182,111,0.08)']}>{sync && <AccountSyncStatus sync={sync}/>}<App /></AuroraBackground></ElementalMotion></AccountConnectionContext>
    </StrictMode>,
  )
}
