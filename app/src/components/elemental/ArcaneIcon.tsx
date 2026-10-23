import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';

/** Original 24-unit linework. Meaning comes from the adjacent label, never color alone. */
const PATHS = {
  terra: 'M4 17 8 8l7-4 5 11-5 5-11-3Z M8 8l4 6 3-10 M4 17l8-3 3 6 M12 14l8 1',
  fogo: 'M13 3c1 5 6 7 6 12a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 2 5 2-3 3-6 2-10Z M12 14c-2 2-3 3-2 5s4 2 4-1c0-1-1-3-2-4Z',
  agua: 'M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z M6 15c3-3 9 3 12 0 M9 18c2 1 4 1 6 0',
  ar: 'M4 9h11c4 0 4-6 0-6-2 0-3 1-3 3 M2 13h16c5 0 5 7 0 7-2 0-3-1-3-3 M6 17h4 M5 5h2',
  santuario: 'M12 2 15 9l7 3-7 3-3 7-3-7-7-3 7-3 3-7Z M12 8v8 M8 12h8',
  ritual: 'M6 4h12v16H6Z M9 8h6 M9 12l2 2 4-4 M4 4h2 M18 20h2',
  ciclo: 'M18 6a8 8 0 1 0 2 10 M18 2v5h-5 M12 8l3 4-3 4-3-4 3-4Z',
  jornada: 'M3 18l6-13 6 4 6-3-5 15-7-4-6 1Z M9 5v12 M15 9l1 12 M12 11v2',
  obra: 'M3 21h18 M5 21V9l7-6 7 6v12 M9 21v-7h6v7 M9 9h6 M12 3v6',
  grimorio: 'M12 6C9 3 5 3 3 4v15c3-1 6-1 9 2 3-3 6-3 9-2V4c-2-1-6-1-9 2v15 M6 8h3 M15 8h3 M6 12h3 M15 12h3',
  treino: 'M5 7v10 M2 9v6 M19 7v10 M22 9v6 M5 12h14 M10 8l2-3 2 3 M10 16l2 3 2-3',
  conquista: 'M8 3h8l2 6-6 5-6-5 2-6Z M9 13l-3 8 6-3 6 3-3-8 M12 6v4 M10 8h4',
  calendario: 'M4 5h16v16H4Z M8 3v4 M16 3v4 M4 10h16 M8 14h2 M14 14h2 M8 17h2',
  lua: 'M19 16A9 9 0 0 1 8 3a9 9 0 1 0 11 13Z M16 3v4 M14 5h4',
  estacoes: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M6 6l2 2 M16 16l2 2 M6 18l2-2 M16 8l2-2 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  dominios: 'M12 12V4 M12 12l-7 6 M12 12l7 6 M12 2l2 2-2 2-2-2 2-2Z M3 18l2-2 2 2-2 2-2-2Z M17 18l2-2 2 2-2 2-2-2Z M12 9l3 3-3 3-3-3 3-3Z',
  invocar: 'M12 3v18 M3 12h18 M6 6l12 12 M18 6 6 18 M12 7l5 5-5 5-5-5 5-5Z',
  arquivo: 'M3 4h18v5H3Z M5 9v12h14V9 M9 13h6',
  alerta: 'M12 3 2 21h20L12 3Z M12 9v6 M12 18v.1',
  meteoro: 'M20 3 9 14 M21 8l-5 5 M15 3 9 9 M8 13a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
} as const;
export type ArcaneIconName = keyof typeof PATHS;
interface IconProps { size?: number | string; className?: string; label?: string; style?: CSSProperties }

export function ArcaneIcon({ name, size = '1em', className = '', label, style }: IconProps & { name: ArcaneIconName }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`arcane-icon ${className}`} style={{ display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0, ...style }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"><path d={PATHS[name]} /></svg>;
}

export function ElementIcon({ element, ...props }: IconProps & { element: ElementId }) {
  return <ArcaneIcon {...props} name={element} />;
}

const ROUTE_ICONS: Record<string, ArcaneIconName> = {
  santuario: 'santuario', rituais: 'ritual', ciclos: 'ciclo', jornadas: 'jornada', 'grandes-obras': 'obra',
  grimorio: 'grimorio', invocar: 'invocar', forja: 'obra', pilares: 'dominios', astrolabio: 'estacoes', mapa: 'jornada',
  temporal: 'calendario', 'temporal-mes': 'calendario', 'temporal-ano': 'calendario', 'temporal-calendario': 'calendario',
  lua: 'lua', estacoes: 'estacoes', dominios: 'dominios', cassino: 'conquista', fitness: 'treino', treinos: 'treino',
  'treinos-painel': 'terra', 'treinos-semana': 'calendario', 'treinos-historico': 'arquivo', 'treinos-insights': 'terra', 'treinos-corpo': 'terra',
};
export function RouteIcon({ routeId, ...props }: IconProps & { routeId: string }) {
  return <ArcaneIcon {...props} name={ROUTE_ICONS[routeId] ?? 'santuario'} />;
}
