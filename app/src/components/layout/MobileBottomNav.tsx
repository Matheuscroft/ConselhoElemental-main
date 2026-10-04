import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, CheckSquare, Plus, Library, LayoutGrid } from 'lucide-react';
import { AllRoutesSheet } from './AllRoutesSheet';

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl">
        <div className="grid grid-cols-5 h-16 items-center justify-items-center">
          
          <button onClick={() => navigate('/santuario')} className={`flex flex-col items-center gap-1 ${isActive('/santuario') ? 'text-mystic-cyan' : 'text-white/40'}`}>
            <Sparkles className="w-6 h-6" />
          </button>
          
          <button onClick={() => navigate('/rituais')} className={`flex flex-col items-center gap-1 ${isActive('/rituais') ? 'text-mystic-cyan' : 'text-white/40'}`}>
            <CheckSquare className="w-6 h-6" />
          </button>

          {/* Botão Central INVOCAÇÃO */}
          <div className="relative -top-6">
            <button onClick={() => navigate('/invocar')} className="w-16 h-16 rounded-full bg-gradient-to-br from-mystic-arcane to-mystic-purple border-2 border-mystic-cyan/50 shadow-glow-arcane flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform">
              <Plus className="w-8 h-8" />
            </button>
          </div>

          <button onClick={() => navigate('/grimorio')} className={`flex flex-col items-center gap-1 ${isActive('/grimorio') ? 'text-mystic-cyan' : 'text-white/40'}`}>
            <Library className="w-6 h-6" />
          </button>

          <button onClick={() => setMoreOpen(true)} aria-label="Mais páginas" className="flex flex-col items-center gap-1 text-white/40">
            <LayoutGrid className="w-6 h-6" />
            <span className="text-[10px]">Mais</span>
          </button>

        </div>
      </nav>

      <AllRoutesSheet open={moreOpen} onOpenChange={setMoreOpen} variant="mystic" />
    </>
  );
};
