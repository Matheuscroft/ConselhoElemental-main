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
  pilares: 'M2 21h20 M3 8h3v10H3Z M8 6h3v12H8Z M13 6h3v12h-3Z M18 8h3v10h-3Z M3 4l9-2 9 2',
  mapa: 'M3 3h7v7H3Z M15 15h6v6h-6Z M15 3h6v6h-6Z M10 6h5 M6 10v8h9',
  semana: 'M4 5h16v16H4Z M8 3v4 M16 3v4 M4 10h16 M8 14h8 M8 17h4',
  ano: 'M4 5h16v16H4Z M8 3v4 M16 3v4 M4 10h16 M8 14h2v3H8Z M14 14h2v3h-2Z',
  agenda: 'M3 5h15v7 M3 5v16h7 M7 3v4 M14 3v4 M3 10h15 M16 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z M16 14v3l2 1',
  cassino: 'M7 3h10l4 4v10l-4 4H7l-4-4V7l4-4Z M12 8l3 4-3 4-3-4 3-4Z M7 7h.01 M17 17h.01',
  modalidades: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M4 8h16 M12 8v6 M12 14l-6 7 M12 14l6 7',
  painel: 'M3 12a9 9 0 0 1 18 0v7H3v-7Z M6 12h2 M12 6v2 M16 12h2 M12 16l4-6 M7 19v2 M17 19v2',
  treinoSemana: 'M4 5h16v16H4Z M8 3v4 M16 3v4 M4 10h16 M7 16l3 2 6-5',
  historico: 'M4 8a9 9 0 1 1-1 8 M3 3v6h6 M12 7v5l4 2',
  tendencias: 'M4 3v18h17 M8 17v-4 M13 17V9 M18 17V5 M7 8l5-3 4-2',
  corpo: 'M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M8 8l-2 5 M16 8l2 5 M8 8h8l-2 7 1 7 M8 8l2 7-1 7 M10 15h4',
  explorar: 'M4 3h5v5H4Z M15 3h5v5h-5Z M4 16h5v5H4Z M17.5 14l4 4-4 4-4-4 4-4Z',
  invocar: 'M12 3v18 M3 12h18 M6 6l12 12 M18 6 6 18 M12 7l5 5-5 5-5-5 5-5Z',
  forja: 'M3 11h18l-4 4h-3v3l4 3H6l4-3v-3H7l-4-4Z M10 3l2-2 2 2-2 2-2-2Z M6 6l1 2 M18 6l-1 2 M12 7v1',
  astrolabio: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z M12 1v5 M12 18v5 M1 12h5 M18 12h5 M16 8l-2 6-6 2 2-6 6-2Z M10 10l4 4',
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
  grimorio: 'grimorio', invocar: 'invocar', forja: 'forja', pilares: 'pilares', astrolabio: 'astrolabio', mapa: 'mapa',
  temporal: 'semana', 'temporal-mes': 'calendario', 'temporal-ano': 'ano', 'temporal-calendario': 'agenda',
  lua: 'lua', estacoes: 'estacoes', dominios: 'dominios', cassino: 'cassino', fitness: 'modalidades', treinos: 'treino',
  'treinos-painel': 'painel', 'treinos-semana': 'treinoSemana', 'treinos-historico': 'historico', 'treinos-insights': 'tendencias', 'treinos-corpo': 'corpo',
};
export function RouteIcon({ routeId, ...props }: IconProps & { routeId: string }) {
  return <ArcaneIcon {...props} name={ROUTE_ICONS[routeId] ?? 'santuario'} />;
}
