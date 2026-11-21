import type { ElementId } from '@/types';
import { APP_ROUTES, type AppRoute } from '@/lib/app-routes';
import { ELEMENT_ORDER, filterNavigationRoutes } from '@/components/elemental/navigation';

/** Ordem horária da rosa: Fogo (N), Ar (L), Água (S), Terra (O). */
export const ELEMENTOS_DA_ROSA: readonly ElementId[] = ELEMENT_ORDER;

export type Verbo = 'Agir' | 'Saber' | 'Fluir' | 'Sustentar';

export interface Inscricao {
  elemento: ElementId;
  nome: string;
  verbo: Verbo;
  linha: string;
}

export const VERBOS: Record<ElementId, Verbo> = {
  fogo: 'Agir',
  ar: 'Saber',
  agua: 'Fluir',
  terra: 'Sustentar',
};

export const INSCRICOES: Record<ElementId, Inscricao> = {
  fogo: { elemento: 'fogo', nome: 'Fogo', verbo: 'Agir', linha: 'Criar, cumprir e construir' },
  ar: { elemento: 'ar', nome: 'Ar', verbo: 'Saber', linha: 'Registro, céu e orientação' },
  agua: { elemento: 'agua', nome: 'Água', verbo: 'Fluir', linha: 'O tempo, as marés e os ciclos' },
  terra: { elemento: 'terra', nome: 'Terra', verbo: 'Sustentar', linha: 'Corpo, base e áreas da vida' },
};

/**
 * Rotas de cada elemento, na ordem de exibição. Cada id de APP_ROUTES aparece
 * exatamente uma vez (o teste falha se uma rota nova ficar de fora).
 * As rotas latentes (subrotas de Treinos e Exercício Físico) só aparecem na busca.
 */
export const ROTAS_POR_ELEMENTO: Record<ElementId, readonly string[]> = {
  fogo: ['invocar', 'rituais', 'jornadas', 'grandes-obras', 'forja', 'cassino'],
  ar: ['grimorio', 'astrolabio', 'mapa', 'laboratorio'],
  agua: ['ciclos', 'temporal', 'temporal-mes', 'temporal-ano', 'temporal-calendario', 'lua', 'estacoes'],
  terra: [
    'santuario', 'pilares', 'dominios', 'treinos',
    'fitness', 'treinos-painel', 'treinos-semana', 'treinos-historico', 'treinos-insights', 'treinos-corpo',
  ],
};

/** Subportais do Temporal: texto pequeno sob a linha, que leva à Semana. */
export const SUBPORTAIS_TEMPORAL: readonly string[] = ['temporal-mes', 'temporal-ano', 'temporal-calendario'];

export interface Portal {
  elemento: ElementId;
  rotulo: string;
  id: string;
}

export const PORTAIS: readonly Portal[] = [
  { elemento: 'fogo', rotulo: 'Nova atividade', id: 'invocar' },
  { elemento: 'ar', rotulo: 'Meu progresso', id: 'grimorio' },
  { elemento: 'agua', rotulo: 'Minha semana', id: 'temporal' },
  { elemento: 'terra', rotulo: 'Treinar', id: 'treinos' },
];

/** Rota que a pessoa vê sem buscar: tudo que o filtro padrão deixa passar. */
const IDS_SEM_BUSCA = new Set(filterNavigationRoutes(APP_ROUTES, '').map((rota) => rota.id));
const IDS_LATENTES = new Set(APP_ROUTES.filter((rota) => !IDS_SEM_BUSCA.has(rota.id)).map((rota) => rota.id));

const ELEMENTO_DA_ROTA = new Map<string, ElementId>();
const POSICAO = new Map<string, number>();
ELEMENTOS_DA_ROSA.forEach((elemento) => {
  ROTAS_POR_ELEMENTO[elemento].forEach((id) => {
    ELEMENTO_DA_ROTA.set(id, elemento);
    POSICAO.set(id, POSICAO.size);
  });
});

export const elementoDaRota = (id: string): ElementId | undefined => ELEMENTO_DA_ROTA.get(id);
export const ehLatente = (id: string) => IDS_LATENTES.has(id);
export const ehSubportal = (id: string) => SUBPORTAIS_TEMPORAL.includes(id);
export const rotaPorId = (id: string): AppRoute | undefined => APP_ROUTES.find((rota) => rota.id === id);

/** Elemento da página atual (a rota mais específica que casa com o caminho). */
export function elementoDoCaminho(pathname: string): ElementId | undefined {
  const rota = [...APP_ROUTES]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
  return rota ? ELEMENTO_DA_ROTA.get(rota.id) : undefined;
}

export interface Conjuracao {
  /** Rotas presentes na folha: todas, menos as latentes que não respondem. Em ordem visual. */
  visiveis: AppRoute[];
  /** Rotas que respondem à busca (vazia: nenhuma). Em ordem visual. */
  acesas: AppRoute[];
  /** Primeira resposta na ordem visual, ou null. */
  primeira: AppRoute | null;
  /**
   * Com busca: quantas páginas respondem por elemento. Sem busca: quantas
   * páginas a inscrição mostra (sem os subportais nem as latentes).
   */
  contagemPorElemento: Record<ElementId, number>;
}

const porOrdemVisual = (a: AppRoute, b: AppRoute) => (POSICAO.get(a.id) ?? 0) - (POSICAO.get(b.id) ?? 0);

export function conjurar(query: string): Conjuracao {
  const busca = query.trim();
  const contagemPorElemento: Record<ElementId, number> = { fogo: 0, ar: 0, agua: 0, terra: 0 };
  const respostas = filterNavigationRoutes(APP_ROUTES, query).filter((rota) => POSICAO.has(rota.id)).sort(porOrdemVisual);

  if (!busca) {
    respostas.forEach((rota) => {
      if (!ehSubportal(rota.id)) contagemPorElemento[ELEMENTO_DA_ROTA.get(rota.id)!] += 1;
    });
    return { visiveis: respostas, acesas: [], primeira: null, contagemPorElemento };
  }

  const ids = new Set(respostas.map((rota) => rota.id));
  respostas.forEach((rota) => { contagemPorElemento[ELEMENTO_DA_ROTA.get(rota.id)!] += 1; });
  const visiveis = APP_ROUTES.filter((rota) => !IDS_LATENTES.has(rota.id) || ids.has(rota.id)).sort(porOrdemVisual);
  return { visiveis, acesas: respostas, primeira: respostas[0] ?? null, contagemPorElemento };
}
