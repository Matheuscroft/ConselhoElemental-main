import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

/** Presentation only: account and navigation operations stay with TopBar. */
export function ElementalTopBar({ title, onBack, onExplore, exploreOpen, children }: {
  title: string; onBack?: () => void; onExplore: () => void;
  exploreOpen: boolean; children: ReactNode;
}) {
  return <header className="elemental-topbar">
    <div className="elemental-topbar-inner">
      {onBack && <button type="button" className="elemental-topbar-back" onClick={onBack} aria-label="Voltar à página anterior"><ArrowLeft size={20} /></button>}
      <Link to="/santuario" className="elemental-topbar-brand" aria-label="Conselho Elemental — Santuário"><ArcaneIcon name="santuario" size={32} /><span>Conselho<strong>Elemental</strong></span></Link>
      <h1 className="elemental-topbar-location">{title}</h1>
      <nav aria-label="Navegação global" className="elemental-topbar-actions">
        <button type="button" onClick={onExplore} aria-label="Explorar todas as páginas" aria-haspopup="dialog" aria-expanded={exploreOpen}><Menu size={20} aria-hidden="true" /><span>Explorar</span></button>
        {children}
      </nav>
    </div>
  </header>;
}

export function AccountSeal() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M6 18c1-6 11-6 12 0" /></svg>;
}
