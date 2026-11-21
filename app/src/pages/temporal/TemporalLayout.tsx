import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import './temporal-elemental.css';
import './temporal-uau.css';
import { CenaTemporal } from '@/components/temporal/CenaTemporal';
import { AbasTemporais } from '@/components/temporal/AbasTemporais';
import { readTemporalView, temporalViewHref, safeTemporalReturn, type TemporalViewKind } from '@/components/temporal/temporal-navigation';

const TABS = [
  { label: 'Semana', route: '/temporal/semana' },
  { label: 'Mês', route: '/temporal/mes' },
  { label: 'Ano', route: '/temporal/ano' },
  { label: 'Calendário', route: '/temporal/calendario' },
];

const SKY = [
  { label: 'Lua', route: '/lua' },
  { label: 'Estações', route: '/estacoes' },
];

interface TemporalLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export const TemporalLayout = ({ title, subtitle, children, actions, className = '' }: TemporalLayoutProps) => {
  const location = useLocation();
  const [fallback] = useState(() => new Date());
  const kind: TemporalViewKind = location.pathname === '/temporal/semana' ? 'week' : location.pathname === '/temporal/ano' ? 'year' : 'month';
  const { anchorDate, selectedDayStamp } = readTemporalView(location.search, fallback, kind);
  const selectedDay = selectedDayStamp == null ? null : new Date(selectedDayStamp);
  const navigationDate = selectedDay ?? anchorDate;
  const returnTo = safeTemporalReturn(location.state);
  return <AppLayout title={title.startsWith('Temporal - ') ? 'Temporal' : title}>
  <CenaTemporal className={className}>
    <header className="temporal-header">
      <Link className="temporal-back" to="/santuario"><ArrowLeft size={16} />Santuário</Link>
      <div className="temporal-header-row"><div><p className="temporal-eyebrow">Seu tempo, sua jornada</p><h2>{title.replace('Temporal - ', '')}</h2><p>{subtitle}</p></div>{actions && <div className="temporal-header-actions">{actions}</div>}</div>
      <AbasTemporais className="temporal-navigation" aria-label="Navegação temporal">{TABS.map((tab) => <NavLink key={tab.route} to={temporalViewHref(tab.route, navigationDate, selectedDay)} end>{tab.label}</NavLink>)}</AbasTemporais>
      <nav className="temporal-ceu" aria-label="Céu">{SKY.map((tab) => <NavLink key={tab.route} to={tab.route} end>{tab.label}</NavLink>)}</nav>
    </header>
    {returnTo && returnTo.split('?')[0] !== location.pathname && <Link className="temporal-back" to={returnTo}><ArrowLeft size={16} aria-hidden="true" />Voltar à visão anterior</Link>}
    <div className="temporal-corpo">{children}</div>
  </CenaTemporal>
</AppLayout>;
};
