import { RevealPanel } from '@/components/motion/RevealPanel';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
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

/** Search reveals results as headings; ordinary navigation remains an explicit disclosure. */
export function NavigationGroup({ group, count, initiallyOpen, reveal = false, illustrated = false, children }: { group: RouteGroup; count: number; initiallyOpen?: boolean; reveal?: boolean; illustrated?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!!initiallyOpen);
  const panelId = useId();
  const visual = GROUP_STYLE[group];
  const expanded = reveal || open;
  const title = <>{illustrated && <img className="elemental-nav-illustration" src={`/sanctuary/elements/${visual.element}-v1.webp`} alt="" width={140} height={140} loading="lazy" />}<span className="elemental-nav-seal"><ArcaneIcon name={visual.icon} size={28} /></span><span className="elemental-nav-group-title"><strong>{group}</strong><small>{visual.description}</small></span><span className="elemental-nav-count">{count}<span className="sr-only"> páginas</span></span></>;
  return <section className="elemental-nav-group" data-open={expanded} data-revealed={reveal} style={{ '--group-accent': `var(--element-${visual.element})` } as CSSProperties}>
    {reveal ? <h3 className="elemental-nav-trigger">{title}</h3> : <h3><button className="elemental-nav-trigger" type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setOpen(value => !value)}>{title}<ChevronDown size={18} aria-hidden="true" /></button></h3>}
    <RevealPanel id={panelId} open={expanded}><div className="elemental-nav-group-content">{children}</div></RevealPanel>
  </section>;
}

/** Showcase for discovery: overview always visible, destination never hidden behind hover. */
export function RouteShowcase({ route, status, children }: { route: AppRoute; status?: string; children?: ReactNode }) {
  const visual = GROUP_STYLE[route.group];
  return <article className="elemental-route-showcase" style={{ '--showcase-accent': `var(--element-${visual.element})` } as CSSProperties}>
    <div className="elemental-route-showcase-main"><span className="elemental-showcase-art"><RouteIcon routeId={route.id} size={32} /></span><div><h4>{route.label}</h4><p>{route.description}</p>{status && <p className="elemental-route-status">{status}</p>}</div></div>
    <Link className="elemental-press" to={route.path} aria-label={`Abrir ${route.label}`}>Abrir {route.label}<ArrowUpRight size={18} aria-hidden="true" /></Link>
    {children && <details className="elemental-route-access"><summary>Outras formas de acesso<ChevronDown size={14} aria-hidden="true" /></summary><div>{children}<code>{route.path}</code></div></details>}
  </article>;
}
