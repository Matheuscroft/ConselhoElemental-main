/**
 * The four elements, in the three roles the app actually paints them in.
 *
 * They had drifted into five places: the theme stylesheet, `.entry-shell`
 * with the same values typed again, an `ACCENTS` constant in the sanctuary
 * page, a `TINT` map in the destiny wheel and an aura base in the zodiac.
 * Three of those were the same four colours written three times.
 *
 * The three roles are genuinely different and stay different; what they no
 * longer do is live apart. `elemental-fundacao.css` declares `accent` as
 * `--element-*`, and a test fails if the two disagree.
 */

export type ElementoId = 'terra' | 'fogo' | 'agua' | 'ar';

export const ELEMENTOS: readonly ElementoId[] = ['terra', 'fogo', 'agua', 'ar'];

/** What the interface accents with: labels, borders, small sigils. */
export const ACENTO: Record<ElementoId, string> = {
  terra: '#a3ce9b',
  fogo: '#f5ad83',
  agua: '#8bcee3',
  ar: '#d2e6df',
};

/** Behind something, as a wash. Dark enough to carry text over it. */
export const TINTA: Record<ElementoId, string> = {
  terra: '#263e36',
  fogo: '#4b302b',
  agua: '#203d4e',
  ar: '#34424b',
};

/**
 * Light coming off a person. More saturated than the accents on purpose:
 * an accent labels a section, an aura has to read as energy.
 */
export const AURA: Record<ElementoId, string> = {
  terra: '#86e07a',
  fogo: '#ff8a4d',
  agua: '#5cc8f5',
  ar: '#b8f0e4',
};
