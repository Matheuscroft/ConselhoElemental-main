import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { safeTemporalReturn } from './temporal-navigation';

export function TemporalReturnLink() {
  const { state, pathname } = useLocation();
  const href = safeTemporalReturn(state);
  if (!href || pathname.startsWith('/temporal/')) return null;
  return <Link to={href} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-mystic-gold/30 px-4 text-sm text-mystic-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-mystic-gold"><ArrowLeft size={18} aria-hidden="true" />Voltar à agenda selecionada</Link>;
}
