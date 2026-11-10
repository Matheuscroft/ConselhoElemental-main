/**
 * Pure rules for the two sky buttons in Ciclos. Nothing here draws: it turns a
 * moon phase or a season into numbers and strings the components and the
 * stylesheet read. Read-only; never feeds scoring, XP or any stored value.
 */

export interface LuzDaLuaEntrada {
  /** Fraction of the disc that is lit, 0..1. */
  readonly illuminated: number;
  readonly waxing: boolean;
}

export interface LuzDaLua {
  readonly luz: number;
  /** Half the lit arc of the ring, in degrees: 31 at new moon, 180 at full. */
  readonly arco: number;
  readonly borda: number;
  readonly halo: number;
  /** How many stars survive the moonlight, 1 = all. */
  readonly estrelas: number;
  /** Earthshine on the dark part of the disc. */
  readonly terra: number;
  /** Direction the lit side faces, in degrees from the top, clockwise. */
  readonly lado: 90 | 270;
}

const limitar = (valor: number, minimo: number, maximo: number) => Math.min(maximo, Math.max(minimo, valor));

/**
 * Continuous in `luz`, so the ring and the halo glide between phases instead
 * of snapping at the eight names. In the south the lit side is mirrored.
 */
export function luzDaLua(snapshot: LuzDaLuaEntrada, south: boolean): LuzDaLua {
  const luz = limitar(Number.isFinite(snapshot.illuminated) ? snapshot.illuminated : 0, 0, 1);
  return {
    luz,
    arco: 30 + 150 * luz,
    borda: 0.18 + 0.62 * luz,
    halo: 0.1 + 0.5 * luz,
    estrelas: 1 - 0.8 * luz,
    terra: 0.06 * (1 - luz) ** 2,
    lado: snapshot.waxing !== south ? 90 : 270,
  };
}

/** The custom properties the Moon button's stylesheet reads. */
export function variaveisDaLua(luz: LuzDaLua): Record<string, string> {
  return {
    '--lua-arco': `${luz.arco.toFixed(1)}deg`,
    '--lua-lado': `${luz.lado}deg`,
    '--lua-borda': luz.borda.toFixed(3),
    '--lua-halo': luz.halo.toFixed(3),
  };
}

/** Percentage shown under the phase name, the same rounding as the Moon page. */
export function porcentagemIluminada(illuminated: number): number {
  return Math.round(limitar(Number.isFinite(illuminated) ? illuminated : 0, 0, 1) * 100);
}

/**
 * The instant the sky is read at. Today reads the live clock, like the Moon
 * page; any other day reads noon, the middle of that day.
 */
export function instanteDoCeu(dia: Date, agora: Date): Date {
  const mesmoDia = dia.getFullYear() === agora.getFullYear()
    && dia.getMonth() === agora.getMonth()
    && dia.getDate() === agora.getDate();
  return mesmoDia ? new Date(agora.getTime()) : new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 12);
}

export type TomDaEstacao = 'spring' | 'summer' | 'autumn' | 'winter';

export interface TemaDaEstacao {
  readonly tom: TomDaEstacao;
  /** Space-separated rgb triples, ready for `rgb(var(--x))`. */
  readonly cor: string;
  readonly cor2: string;
  readonly topo: string;
  readonly vidro: string;
  readonly blur: 'soft' | 'strong';
  readonly saturacao: number;
}

const TEMAS: Record<TomDaEstacao, TemaDaEstacao> = {
  spring: { tom: 'spring', cor: '163 206 155', cor2: '242 184 198', topo: '18 36 32', vidro: '16 30 26', blur: 'soft', saturacao: 1.4 },
  summer: { tom: 'summer', cor: '213 182 111', cor2: '255 154 77', topo: '44 30 14', vidro: '30 22 12', blur: 'soft', saturacao: 1.5 },
  autumn: { tom: 'autumn', cor: '245 173 131', cor2: '200 100 60', topo: '40 24 20', vidro: '30 18 14', blur: 'soft', saturacao: 1.2 },
  winter: { tom: 'winter', cor: '139 206 227', cor2: '226 240 248', topo: '12 22 36', vidro: '14 24 36', blur: 'strong', saturacao: 0.9 },
};

const TOM_POR_NOME: Record<string, TomDaEstacao> = {
  'Primavera': 'spring',
  'Verão': 'summer',
  'Outono': 'autumn',
  'Inverno': 'winter',
};

/** Unknown names fall back to spring rather than breaking the button. */
export function temaDaEstacao(nome: string): TemaDaEstacao {
  return TEMAS[TOM_POR_NOME[nome] ?? 'spring'];
}

/**
 * Last day of the season `data` falls in, found by reading the app's own
 * season rule forward until the name changes. Null if it never does within a
 * year, which only a broken reader could cause.
 */
export function fimDaEstacao(data: Date, lerEstacao: (dia: Date) => { name: string }): Date | null {
  const atual = lerEstacao(data).name;
  const cursor = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 12);
  for (let dias = 0; dias < 370; dias += 1) {
    const proximo = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, 12);
    if (lerEstacao(proximo).name !== atual) return new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** "20 de dezembro". */
export function rotuloDeData(data: Date): string {
  return `${data.getDate()} de ${MESES[data.getMonth()]}`;
}
