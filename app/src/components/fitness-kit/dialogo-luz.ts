import { useMemo, useState } from 'react';
import { useLuzDoToque } from '@/components/sanctuary/useCenaViva';

/**
 * A dialog is portaled out of the scene, so the scene's listener cannot hear
 * it: the dialog listens for itself. Hand the returned callback to the
 * dialog's `ref` and mark the surface with `data-luz`; the light then follows
 * the finger across the glass. Presentation only.
 */
export function useLuzDoDialogo() {
  const [raiz, setRaiz] = useState<HTMLElement | null>(null);
  const raizRef = useMemo(() => ({ current: raiz }), [raiz]);
  useLuzDoToque(raizRef);
  return setRaiz;
}
