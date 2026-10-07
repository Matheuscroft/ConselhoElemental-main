import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuroraBackground from './components/ui/aurora-background'

// ── Fase 1: Força Dark Mode globalmente ────────────────────────────────
// A classe 'dark' no <html> ativa os tokens CSS do Design System Arcano
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuroraBackground><App /></AuroraBackground>
  </StrictMode>,
)
