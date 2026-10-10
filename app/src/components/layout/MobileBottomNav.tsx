import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Layers3, Sparkles } from 'lucide-react';
import { AllRoutesSheet } from './AllRoutesSheet';

const ITEMS = [
  { label: 'Santuário', path: '/santuario', icon: Sparkles, active: (path: string) => path === '/santuario' },
  { label: 'Ciclos', path: '/ciclos', icon: Flame, active: (path: string) => path.startsWith('/ciclos') },
  { label: 'Pilares', path: '/pilares', icon: Layers3, active: (path: string) => path.startsWith('/pilares') || path.startsWith('/jornadas') || path.startsWith('/grandes-obras') },
] as const;

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = ['/grimorio', '/rituais', '/invocar', '/forja', '/treinos', '/dominios', '/astrolabio'].some((path) => pathname.startsWith(path));

  return (
    <>
      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-void/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.38)] backdrop-blur-xl md:left-72">
        <div className="mx-auto grid h-16 max-w-2xl grid-cols-4 items-center px-2">
          {ITEMS.map(({ label, path, icon: Icon, active }) => {
            const selected = active(pathname);
            return (
              <button key={path} type="button" onClick={() => navigate(path)} aria-current={selected ? 'page' : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mystic-gold ${selected ? 'text-mystic-gold' : 'text-white/60 hover:text-white'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
          <button type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen} aria-current={moreActive ? 'page' : undefined}
            className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mystic-gold ${moreActive ? 'text-mystic-gold' : 'text-white/60 hover:text-white'}`}>
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
      <AllRoutesSheet open={moreOpen} onOpenChange={setMoreOpen} variant="mystic" />
    </>
  );
};
