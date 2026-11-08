import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DespertarCena } from '@/components/sanctuary/DespertarCena';

/**
 * The awakening watched again from settings. Unlike the first open, it leads
 * back into the sanctuary instead of on to the entry, and it changes nothing:
 * the person already has their progress.
 */
export function DespertarRota() {
  const navigate = useNavigate();
  const voltar = useCallback(() => navigate('/santuario', { replace: true }), [navigate]);

  return <DespertarCena onComplete={voltar} onSkip={voltar} />;
}

export default DespertarRota;
