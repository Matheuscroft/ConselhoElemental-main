import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArcaneIcon, RouteIcon } from '@/components/elemental/ArcaneIcon';
import { AllRoutesSheet } from './AllRoutesSheet';
import './dock-nav.css';

const ITEMS = [
  { label: 'Santuário', path: '/santuario', active: (path: string) => path === '/santuario' },
  { label: 'Pilares', path: '/pilares', active: (path: string) => path.startsWith('/pilares') || path.startsWith('/jornadas') || path.startsWith('/grandes-obras') },
  { label: 'Ciclos', path: '/ciclos', active: (path: string) => path.startsWith('/ciclos') },
] as const;

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = ['/grimorio', '/rituais', '/invocar', '/forja', '/treinos', '/fitness', '/dominios', '/astrolabio'].some((path) => pathname.startsWith(path));

  const indice = Math.max(0, ITEMS.findIndex(({ active }) => active(pathname)));
  const atual = ITEMS.some(({ active }) => active(pathname)) ? indice : moreActive ? ITEMS.length : -1;

  return (
    <>
      <nav aria-label="Navegação principal" className="dock-nav" data-ativo={atual >= 0 ? 'true' : 'false'} style={{ '--dock-i': Math.max(atual, 0) } as React.CSSProperties}>
        <div className="dock-nav__trilha">
          <span className="dock-nav__pilula" aria-hidden="true" />
          {ITEMS.map(({ label, path, active }) => {
            const selected = active(pathname);
            return (
              <button key={path} type="button" onClick={() => navigate(path)} aria-current={selected ? 'page' : undefined} className="dock-nav__item">
                <RouteIcon routeId={path.slice(1)} size={24} />
                <span>{label}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen} aria-current={moreActive ? 'page' : undefined} className="dock-nav__item">
            <ArcaneIcon name="explorar" size={24} />
            <span>Mais</span>
          </button>
        </div>
      </nav>
      <AllRoutesSheet open={moreOpen} onOpenChange={setMoreOpen} variant="mystic" />
    </>
  );
};
