import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AberturaSegura } from '@/components/intro/AberturaSegura';
import { GrimorioCena } from '@/components/intro/GrimorioCena';

/**
 * The awakening (the grimoire) watched again from settings. Unlike the first open, it leads
 * back into the sanctuary instead of on to the entry, and it changes nothing:
 * the person already has their progress.
 */
export function DespertarRota() {
  const navigate = useNavigate();
  const voltar = useCallback(() => navigate('/santuario', { replace: true }), [navigate]);

  return (
    <AberturaSegura aoFalhar={voltar}>
      <GrimorioCena onComplete={voltar} onSkip={voltar} />
    </AberturaSegura>
  );
}

export default DespertarRota;
