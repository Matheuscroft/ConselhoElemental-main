import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import './temporal-elemental.css';

const TABS = [
  { label: 'Semana', route: '/temporal/semana' },
  { label: 'Mês', route: '/temporal/mes' },
  { label: 'Ano', route: '/temporal/ano' },
  { label: 'Calendário', route: '/temporal/calendario' },
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

export const TemporalLayout = ({ title, subtitle, children, actions, className = '' }: TemporalLayoutProps) => <AppLayout title={title} showAura={false}>
  <section className={`temporal-surface ${className}`}>
    <header className="temporal-header">
      <Link className="temporal-back" to="/santuario"><ArrowLeft size={16} />Santuário</Link>
      <div className="temporal-header-row"><div><p className="temporal-eyebrow">Seu tempo, sua jornada</p><h2>{title.replace('Temporal - ', '')}</h2><p>{subtitle}</p></div>{actions && <div className="temporal-header-actions">{actions}</div>}</div>
      <nav className="temporal-navigation" aria-label="Navegação temporal">{TABS.map((tab) => <NavLink key={tab.route} to={tab.route} end>{tab.label}</NavLink>)}</nav>
    </header>
    {children}
  </section>
</AppLayout>;
