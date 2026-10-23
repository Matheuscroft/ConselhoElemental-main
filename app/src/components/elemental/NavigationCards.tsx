import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { AppRoute, RouteGroup } from '@/lib/app-routes';
import { ArcaneIcon, RouteIcon, type ArcaneIconName } from './ArcaneIcon';

const GROUP_STYLE: Record<RouteGroup, { icon: ArcaneIconName; element: string; description: string }> = {
  'Núcleo': { icon: 'santuario', element: 'fogo', description: 'Suas ações, evolução e conhecimento.' },
  'Tempo e ciclos': { icon: 'ciclo', element: 'ar', description: 'Organize a rotina e acompanhe seus planos.' },
  'Treino': { icon: 'treino', element: 'terra', description: 'Treinos, histórico e cuidado com o corpo.' },
  'Domínios': { icon: 'dominios', element: 'agua', description: 'Explore suas áreas da vida e recompensas.' },
};

/** Native disclosure: search can reveal all results without changing destinations. */
export function NavigationGroup({ group, count, initiallyOpen, reveal = false, children }: { group: RouteGroup; count: number; initiallyOpen?: boolean; reveal?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!initiallyOpen);
  const visual = GROUP_STYLE[group];
  return <details className="elemental-nav-group" open={reveal || open} style={{ '--group-accent': `var(--element-${visual.element})` } as CSSProperties} onToggle={(event) => { if (!reveal) setOpen(event.currentTarget.open); }}>
    <summary><span className="elemental-nav-seal"><ArcaneIcon name={visual.icon} size={28} /></span><span className="elemental-nav-group-title"><strong>{group}</strong><small>{visual.description}</small></span><span className="elemental-nav-count">{count}<span className="sr-only"> páginas</span></span><ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="elemental-nav-group-content">{children}</div>
  </details>;
}

/** Showcase for discovery: overview always visible, destination never hidden behind hover. */
export function RouteShowcase({ route, status, children }: { route: AppRoute; status?: string; children?: ReactNode }) {
  const visual = GROUP_STYLE[route.group];
  return <article className="elemental-route-showcase" style={{ '--showcase-accent': `var(--element-${visual.element})` } as CSSProperties}>
    <div className="elemental-route-showcase-main"><span className="elemental-showcase-art"><RouteIcon routeId={route.id} size={32} /></span><div><h4>{route.label}</h4><p>{route.description}</p>{status && <p className="elemental-route-status">{status}</p>}</div></div>
    <Link to={route.path} aria-label={`Abrir ${route.label}`}>Abrir {route.label}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    {children && <details className="elemental-route-access"><summary>Outras formas de acesso<ChevronDown size={14} aria-hidden="true" /></summary><div>{children}<code>{route.path}</code></div></details>}
  </article>;
}
