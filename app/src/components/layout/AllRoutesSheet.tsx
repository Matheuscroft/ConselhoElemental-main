import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { APP_ROUTES } from '@/lib/app-routes';
import { HubMagico } from '@/components/mais/HubMagico';
import { registrarRecente } from '@/components/mais/trilha';
import { cn } from '@/lib/utils';

interface AllRoutesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'mystic' | 'fitness';
}

/** The route whose path is the longest match for this location, so sub-pages count as their page. */
function rotaDoCaminho(pathname: string) {
  let melhor: (typeof APP_ROUTES)[number] | undefined;
  for (const rota of APP_ROUTES) {
    const bate = pathname === rota.path || pathname.startsWith(`${rota.path}/`);
    if (bate && (!melhor || rota.path.length > melhor.path.length)) melhor = rota;
  }
  return melhor;
}

/**
 * The "Todas as páginas" sheet. It is only the shell: the sheet's position over the visible
 * viewport (the keyboard on iPhone) and the dialog semantics live here; what is inside is the
 * Rose of the Four (components/mais), the magical hub for finding and opening any page.
 */
export const AllRoutesSheet: React.FC<AllRoutesSheetProps> = ({ open, onOpenChange, variant = 'mystic' }) => {
  const { pathname } = useLocation();
  const folhaRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const visible = window.visualViewport;
    const update = () => {
      const height = Math.min(visible.height * .94, 832);
      const top = visible.offsetTop + visible.height - height;
      setViewport(current => current?.height === height && current?.top === top ? current : { top, height });
    };
    update();
    visible.addEventListener('resize', update); visible.addEventListener('scroll', update);
    return () => { visible.removeEventListener('resize', update); visible.removeEventListener('scroll', update); };
  }, [open]);

  // The pages the person visits become "Há pouco" in the hub (device only, ids validated against APP_ROUTES).
  useEffect(() => {
    const rota = rotaDoCaminho(pathname);
    if (rota) registrarRecente(rota.id);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={folhaRef}
        side="bottom"
        style={viewport ? { top: viewport.top, height: viewport.height, bottom: 'auto' } : undefined}
        onOpenAutoFocus={event => event.preventDefault()}
        className={cn('all-routes-sheet h-[min(92dvh,52rem)] max-h-[calc(100dvh_-_env(safe-area-inset-top))] gap-0 overflow-hidden rounded-t-3xl p-0 border-0')}
        data-variant={variant}
      >
        <SheetTitle className="sr-only">Todas as páginas</SheetTitle>
        <SheetDescription className="sr-only">Encontre o que você quer fazer e abra qualquer página do app.</SheetDescription>
        <HubMagico
          pathname={pathname}
          variant={variant}
          conteudoRef={folhaRef}
          onFechar={() => onOpenChange(false)}
          onNavegar={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
};
