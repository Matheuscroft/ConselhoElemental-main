/** Evolução de qualquer medida corporal: lógica pura, sem React e sem julgamento de "melhor" ou "pior". */

export type ChaveMedida =
  | 'heightCm' | 'weightKg' | 'waterPercent' | 'bodyFatPercent' | 'muscleMassKg'
  | 'waistCm' | 'chestCm' | 'armCm' | 'thighCm';

/** Mesma ordem de BODY_MEASUREMENT_FIELDS. */
export const ORDEM_DAS_MEDIDAS: readonly ChaveMedida[] = [
  'heightCm', 'weightKg', 'waterPercent', 'bodyFatPercent', 'muscleMassKg', 'waistCm', 'chestCm', 'armCm', 'thighCm',
];

type Avaliacao = { measuredAt: string } & Partial<Record<ChaveMedida, number | undefined>>;

export interface PontoDaMedida {
  measuredAt: string;
  value: number;
}

export interface VariacaoDaMedida {
  /** Último valor menos o primeiro; null com menos de 2 pontos. */
  desdeAPrimeira: number | null;
  /** Último valor menos o anterior; null com menos de 2 pontos. */
  desdeAAnterior: number | null;
  pontos: number;
}

const tempo = (iso: string) => {
  const valor = Date.parse(iso);
  return Number.isFinite(valor) ? valor : 0;
};

/** Pontos da medida em ordem de data (estável para datas iguais), ignorando avaliações sem o valor. */
export function serieDaMedida(historico: readonly Avaliacao[], chave: ChaveMedida): PontoDaMedida[] {
  return historico
    .map((avaliacao, indice) => ({ avaliacao, indice }))
    .filter(({ avaliacao }) => typeof avaliacao[chave] === 'number' && Number.isFinite(avaliacao[chave]))
    .sort((a, b) => tempo(a.avaliacao.measuredAt) - tempo(b.avaliacao.measuredAt) || a.indice - b.indice)
    .map(({ avaliacao }) => ({ measuredAt: avaliacao.measuredAt, value: avaliacao[chave] as number }));
}

/** Deltas assinados, com a imprecisão de ponto flutuante arredondada (0.1 + 0.2 não vira 0.30000000000000004). */
export function variacao(serie: readonly PontoDaMedida[]): VariacaoDaMedida {
  if (serie.length < 2) return { desdeAPrimeira: null, desdeAAnterior: null, pontos: serie.length };
  const ultimo = serie[serie.length - 1].value;
  const limpar = (valor: number) => Math.round(valor * 1e6) / 1e6 + 0;
  return {
    desdeAPrimeira: limpar(ultimo - serie[0].value),
    desdeAAnterior: limpar(ultimo - serie[serie.length - 2].value),
    pontos: serie.length,
  };
}

/** Chaves com pelo menos um valor, na ordem dos campos do formulário. */
export function medidasComDados(historico: readonly Avaliacao[], ordem: readonly ChaveMedida[] = ORDEM_DAS_MEDIDAS): ChaveMedida[] {
  return ordem.filter((chave) => historico.some((avaliacao) => typeof avaliacao[chave] === 'number' && Number.isFinite(avaliacao[chave])));
}

/** Peso se houver; senão a primeira medida com dados. */
export function medidaPadrao(disponiveis: readonly ChaveMedida[]): ChaveMedida | undefined {
  return disponiveis.includes('weightKg') ? 'weightKg' : disponiveis[0];
}
