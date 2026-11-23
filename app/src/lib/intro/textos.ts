import type { ElementoCerimonia } from '@/lib/intro/cerimonia';

/**
 * Every word the grimoire says, in one place. The book speaks little, in the present, to "you",
 * with no game jargon, and never claims to already know who the person is (DECISOES §8).
 *
 * The legend is revealed clause by clause because Cinzel has capitals only: a whole sentence in
 * capitals is slow to read on a phone. Screen readers get each paragraph whole.
 */

export const LENDA: readonly (readonly string[])[] = [
  ['Há muito tempo,', 'a Água abriu os vales,', 'a Terra ergueu as montanhas,', 'o Fogo acendeu as estrelas', 'e o Ar deu ao mundo seu primeiro sopro.'],
  ['O Conselho guardou', 'um vestígio de cada força', 'neste grimório.', 'Sob os seus dedos,', 'a primeira desperta.'],
];

export const LENDA_INTEIRA: readonly string[] = LENDA.map((p) => p.join(' '));

export const TOTAL_ORACOES = LENDA.reduce((n, p) => n + p.length, 0);

/** Which paragraph and how many clauses of it are visible at a given clause index. */
export function oracoesVisiveis(indice: number): { paragrafo: number; ate: number } {
  let resto = indice;
  for (let p = 0; p < LENDA.length; p += 1) {
    if (resto < LENDA[p].length) return { paragrafo: p, ate: resto + 1 };
    resto -= LENDA[p].length;
  }
  return { paragrafo: LENDA.length - 1, ate: LENDA[LENDA.length - 1].length };
}

export const NOME_ELEMENTO: Record<ElementoCerimonia, string> = { agua: 'Água', terra: 'Terra', fogo: 'Fogo', ar: 'Ar' };

export const INSTRUCAO: Record<ElementoCerimonia, { gesto: string; toque: string; alvo: string }> = {
  agua: { gesto: 'Siga o sulco com a gota.', toque: 'Ou toque na gota.', alvo: 'Despertar a Água' },
  terra: { gesto: 'Segure a pedra até ela se erguer.', toque: 'Ou toque na pedra.', alvo: 'Despertar a Terra' },
  fogo: { gesto: 'Risque o traço apagado, rápido.', toque: 'Ou toque na brasa.', alvo: 'Despertar o Fogo' },
  ar: { gesto: 'Puxe a ponta da página para cima.', toque: 'Ou toque na ponta.', alvo: 'Despertar o Ar' },
};

export const TEXTO = {
  abrir: 'Toque no fecho para abrir.',
  abrirRotulo: 'Abrir o grimório',
  pular: 'Pular',
  somLigar: 'Som',
  somDesligar: 'Silenciar',
  avancar: 'Toque para seguir.',
  nome: 'Conselho Elemental',
  frase: 'Quem domina os quatro elementos, domina a si mesmo.',
  comecar: 'Começar',
  titulo: 'O grimório do Conselho Elemental',
  despertou: (el: ElementoCerimonia) => `${NOME_ELEMENTO[el]} desperta.`,
  progresso: (n: number) => `${n} de 4 elementos despertos.`,
} as const;

/**
 * Captions for the sounds, shown in brackets while the sound is on (DECISOES: captions always; the sound is never
 * essential). Short, concrete, in the present; the legend itself needs none, its words are on screen.
 */
export const LEGENDA_SOM: Partial<Record<string, string>> = {
  'fecho.toque': 'trinco de latão',
  'fecho.giro': 'o Selo gira e destrava',
  capa: 'o couro range, a capa se abre',
  'luz.sobe': 'um brilho sobe, acorde suave',
  'gota.convite': 'gota de vidro',
  'agua.solta': 'respingo e harpa',
  'terra.firma': 'baque de pedra',
  'fogo.risco': 'faísca e chama',
  'fogo.assenta': 'brasas estalam',
  'ar.assenta': 'sinos de vento',
  'selo.completo': 'o acorde se resolve',
  'historia.entrada': 'a luz atravessa o Selo',
};

/** A strike that did not light, and the live voices of the gestures while the finger works. */
export const LEGENDA_RISCO_FRACO = 'raspar seco';
export const LEGENDA_CONTINUO: Record<'agua' | 'terra' | 'ar', string> = {
  agua: 'água correndo',
  terra: 'a terra ronca',
  ar: 'sopro de vento',
};
