import { useEffect, useRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { HudRecursos } from './HudRecursos';

const ABAS = [
  { to: '/santuario', rotulo: 'Santuário' },
  { to: '/pilares', rotulo: 'Pilares' },
  { to: '/ciclos', rotulo: 'Ciclos' },
] as const;

/** Text tabs like Ciclos' Rotina/Sequências switcher; hidden below 768px by CSS. */
function AbasDeLugares() {
  const { pathname } = useLocation();
  return <nav aria-label="Lugares principais" className="elemental-topbar-abas">
    {ABAS.map((aba) => <Link key={aba.to} to={aba.to} aria-current={pathname === aba.to || pathname.startsWith(`${aba.to}/`) ? 'page' : undefined}>{aba.rotulo}</Link>)}
  </nav>;
}

/** Scroll past this and the Sanctuary header condenses into a floating pill. */
const ROLAGEM_PARA_CONDENSAR = 24;
const ROLAGEM_PARA_SOLTAR = 12;

/**
 * Sets data-condensado on the header it lives in, from a passive scroll
 * listener (the hysteresis keeps it from flickering at the threshold). It
 * touches the DOM attribute directly: a re-render per scroll tick would cost
 * more than the whole header. The CSS scroll timeline, where supported, draws
 * the same transition progressively; this is the fallback and the reduced-motion path.
 */
function CondensadorDeRolagem() {
  const marca = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const cabecalho = marca.current?.closest<HTMLElement>('.elemental-topbar');
    if (!cabecalho) return;
    const ler = () => {
      const y = window.scrollY;
      const atual = cabecalho.dataset.condensado === 'true';
      if (!atual && y > ROLAGEM_PARA_CONDENSAR) cabecalho.dataset.condensado = 'true';
      else if (atual && y <= ROLAGEM_PARA_SOLTAR) cabecalho.dataset.condensado = 'false';
    };
    cabecalho.dataset.condensado = 'false';
    ler();
    window.addEventListener('scroll', ler, { passive: true });
    return () => { window.removeEventListener('scroll', ler); delete cabecalho.dataset.condensado; };
  }, []);
  return <span ref={marca} hidden aria-hidden="true" />;
}

/** Presentation only: account and navigation operations stay with TopBar. */
export function ElementalTopBar({ title, onBack, onExplore, exploreOpen, children, lugar = 'interna', abas = true }: {
  title: string; onBack?: () => void; onExplore: () => void;
  exploreOpen: boolean; children: ReactNode;
  lugar?: 'santuario' | 'interna'; abas?: boolean;
}) {
  return <header className="elemental-topbar" data-lugar={lugar}>
    <div className="elemental-topbar-inner">
      {onBack && <button type="button" className="elemental-topbar-back" onClick={onBack} aria-label="Voltar à página anterior"><ArrowLeft size={20} /></button>}
      <Link to="/santuario" className="elemental-topbar-brand" aria-label="Conselho Elemental — Santuário"><ArcaneIcon name="santuario" size={28} /><span>Conselho<strong>Elemental</strong></span></Link>
      <h1 className="elemental-topbar-location">{lugar === 'santuario' ? 'Conselho Elemental' : title}</h1>
      {abas && <AbasDeLugares />}
      <nav aria-label="Navegação global" className="elemental-topbar-actions">
        <button type="button" onClick={onExplore} aria-label="Explorar todas as páginas" aria-haspopup="dialog" aria-expanded={exploreOpen}><ArcaneIcon name="explorar" size={28} /><span>Explorar</span></button>
        {children}
      </nav>
    </div>
    <HudRecursos />
    {lugar === 'santuario' && <CondensadorDeRolagem />}
  </header>;
}

export function AccountSeal() {
  return <span className="elemental-account-seal" aria-hidden="true"><ArcaneIcon name="conta" size={28} /></span>;
}
