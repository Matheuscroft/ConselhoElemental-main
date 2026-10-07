import {
  Sparkles, CheckSquare, Flame, Dumbbell, Swords, Mountain, Calendar, Library, Globe,
  BookOpen, Dice6, Bot, Shield, Moon, Leaf, Plus, Map as MapIcon, BarChart3, History, Activity,
  CalendarDays, CalendarRange, CalendarClock, type LucideIcon,
} from 'lucide-react';

export type RouteGroup = 'Núcleo' | 'Tempo e ciclos' | 'Treino' | 'Domínios';

export interface AppRoute {
  id: string;
  label: string;
  path: string;
  group: RouteGroup;
  icon: LucideIcon;
  description: string;
  /** Appears in the desktop sidebar */
  sidebar?: boolean;
  /** Mobile bottom bar or its "Mais" drawer */
  mobile?: 'bar' | 'more';
  /** Reached only from inside another page */
  via?: string;
}

/** Single source of truth for navigable pages (menus and the page map read from here). */
export const APP_ROUTES: AppRoute[] = [
  { id: 'santuario', label: 'Santuário', path: '/santuario', group: 'Núcleo', icon: Sparkles, description: 'Painel principal e avatar', sidebar: true, mobile: 'bar' },
  { id: 'rituais', label: 'Rituais', path: '/rituais', group: 'Núcleo', icon: CheckSquare, description: 'Tarefas e hábitos do dia', sidebar: true, mobile: 'bar' },
  { id: 'invocar', label: 'Invocar', path: '/invocar', group: 'Núcleo', icon: Plus, description: 'Criação rápida', sidebar: true, mobile: 'bar' },
  { id: 'grimorio', label: 'Grimório', path: '/grimorio', group: 'Núcleo', icon: Library, description: 'Registro e conhecimento', sidebar: true, mobile: 'bar' },
  { id: 'forja', label: 'Forja', path: '/forja', group: 'Núcleo', icon: Bot, description: 'Assistente e criação', sidebar: true, mobile: 'more' },
  { id: 'pilares', label: 'Pilares', path: '/pilares', group: 'Núcleo', icon: Shield, description: 'Pilares elementais', sidebar: true, mobile: 'more' },
  { id: 'astrolabio', label: 'Astrolábio', path: '/astrolabio', group: 'Núcleo', icon: BookOpen, description: 'Astrologia', sidebar: true, mobile: 'more' },
  { id: 'mapa', label: 'Mapa de páginas', path: '/mapa', group: 'Núcleo', icon: MapIcon, description: 'Todas as páginas e como acessá-las', sidebar: true, mobile: 'more' },

  { id: 'ciclos', label: 'Ciclos', path: '/ciclos', group: 'Tempo e ciclos', icon: Flame, description: 'Hábitos e ciclos de execução', sidebar: true, mobile: 'more' },
  { id: 'jornadas', label: 'Jornadas', path: '/jornadas', group: 'Tempo e ciclos', icon: Swords, description: 'Metas de médio prazo', sidebar: true, mobile: 'more' },
  { id: 'grandes-obras', label: 'Grandes Obras', path: '/grandes-obras', group: 'Tempo e ciclos', icon: Mountain, description: 'Projetos de longo prazo', sidebar: true, mobile: 'more' },
  { id: 'temporal', label: 'Temporal · Semana', path: '/temporal/semana', group: 'Tempo e ciclos', icon: Calendar, description: 'Visão semanal', sidebar: true, mobile: 'more' },
  { id: 'temporal-mes', label: 'Temporal · Mês', path: '/temporal/mes', group: 'Tempo e ciclos', icon: CalendarDays, description: 'Visão mensal', via: 'Temporal' },
  { id: 'temporal-ano', label: 'Temporal · Ano', path: '/temporal/ano', group: 'Tempo e ciclos', icon: CalendarRange, description: 'Visão anual', via: 'Temporal' },
  { id: 'temporal-calendario', label: 'Temporal · Calendário', path: '/temporal/calendario', group: 'Tempo e ciclos', icon: CalendarClock, description: 'Calendário e Google Calendar', via: 'Temporal' },
  { id: 'lua', label: 'Lua', path: '/lua', group: 'Tempo e ciclos', icon: Moon, description: 'Fases da lua', sidebar: true, mobile: 'more' },
  { id: 'estacoes', label: 'Estações', path: '/estacoes', group: 'Tempo e ciclos', icon: Leaf, description: 'Estações do ano', sidebar: true, mobile: 'more' },

  { id: 'treinos', label: 'Treinos', path: '/treinos', group: 'Treino', icon: Dumbbell, description: 'Selecionar, criar e iniciar treinos', sidebar: true, mobile: 'more' },
  { id: 'treinos-painel', label: 'Treinos · Painel', path: '/treinos/painel', group: 'Treino', icon: Activity, description: 'Recursos e atividade diária', via: 'Navegação de treinos' },
  { id: 'treinos-semana', label: 'Treinos · Semana', path: '/treinos/semana', group: 'Treino', icon: CalendarDays, description: 'Resumo dos últimos 7 dias', via: 'Navegação de treinos' },
  { id: 'treinos-historico', label: 'Treinos · Histórico', path: '/treinos/historico', group: 'Treino', icon: History, description: 'Sessões por mês', via: 'Navegação de treinos' },
  { id: 'treinos-insights', label: 'Treinos · Insights', path: '/treinos/insights', group: 'Treino', icon: BarChart3, description: 'Corpo e tendências', via: 'Navegação de treinos' },
  { id: 'treinos-corpo', label: 'Treinos · Corpo', path: '/treinos/corpo', group: 'Treino', icon: Activity, description: 'Avaliações corporais', via: 'Navegação de treinos' },

  { id: 'dominios', label: 'Domínios', path: '/dominios', group: 'Domínios', icon: Globe, description: 'Áreas da vida e subáreas', sidebar: true, mobile: 'more' },
  { id: 'cassino', label: 'Cassino Arcano', path: '/cassino-arcano', group: 'Domínios', icon: Dice6, description: 'Recompensas e sorteios', sidebar: true, mobile: 'more' },
];

export interface InternalRoute {
  pattern: string;
  label: string;
  opensFrom: string;
}

/** Routes with parameters or redirects; they cannot be opened directly from a menu. */
export const INTERNAL_ROUTES: InternalRoute[] = [
  { pattern: '/onboarding', label: 'Onboarding', opensFrom: 'Primeiro acesso' },
  { pattern: '/treinos/preview/:workoutId', label: 'Prévia do treino', opensFrom: 'Treinos' },
  { pattern: '/treinos/ativo/:sessionId', label: 'Treino em andamento', opensFrom: 'Prévia do treino' },
  { pattern: '/treinos/resumo/:sessionId', label: 'Resumo do treino', opensFrom: 'Treino em andamento / Histórico' },
  { pattern: '/dominios/:areaId', label: 'Detalhe do domínio', opensFrom: 'Domínios' },
  { pattern: '/dominios/yoga', label: 'Yoga (redireciona para /treinos?source=yoga)', opensFrom: 'Domínios' },
  { pattern: '/dominios/yoga/:poseId', label: 'Detalhe da pose de yoga', opensFrom: 'Yoga' },
  { pattern: '/dominios/calistenia', label: 'Calistenia (redireciona para /treinos?source=calistenia)', opensFrom: 'Domínios' },
  { pattern: '/dominios/calistenia/:exerciseId', label: 'Detalhe do exercício de calistenia', opensFrom: 'Calistenia' },
];

export const SIDEBAR_ROUTES = APP_ROUTES.filter((route) => route.sidebar);
export const MOBILE_MORE_ROUTES = APP_ROUTES.filter((route) => route.mobile === 'more');
