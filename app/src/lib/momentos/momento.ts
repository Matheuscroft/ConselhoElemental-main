/**
 * The rules behind a day's photograph — the one moment someone keeps from a
 * day. Pure, so they can be tested without a browser: the storage itself
 * lives in `momento-store.ts`.
 */

/** A day, as the key a moment is filed under. */
export type DiaChave = string;

export const CHAVE_PADRAO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Two sizes are kept, and the original is not. A phone photograph is 3 to 5
 * MB; a year of them is over a gigabyte, and no browser will hold that. The
 * display copy is what a full view shows and the thumbnail is what a reel of
 * thirty days scrolls through — decoding thirty full photographs to fill a
 * carousel is how a phone locks up.
 */
export const LADO_EXIBICAO = 1600;
export const LADO_MINIATURA = 480;
/** Enough for a photograph, mean enough to refuse a video someone renamed. */
export const BYTES_MAXIMOS = 25 * 1024 * 1024;

export const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'] as const;

export function chaveDoDia(data: Date): DiaChave {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export const chaveValida = (chave: string): boolean => {
  if (!CHAVE_PADRAO.test(chave)) return false;
  const [ano, mes, dia] = chave.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
};

export interface Medida {
  readonly largura: number;
  readonly altura: number;
}

/**
 * Fits a photograph inside a square of `lado` without distorting it and
 * without ever enlarging it: blowing a small picture up costs bytes and adds
 * nothing. Whole pixels, because a canvas cannot draw half of one.
 */
export function caberEm(medida: Medida, lado: number): Medida {
  const { largura, altura } = medida;
  if (largura <= 0 || altura <= 0) return { largura: 0, altura: 0 };

  const fator = Math.min(1, lado / Math.max(largura, altura));
  return {
    largura: Math.max(1, Math.round(largura * fator)),
    altura: Math.max(1, Math.round(altura * fator)),
  };
}

export type RecusaMomento = 'tipo' | 'tamanho' | 'dia';

/** Why a file cannot become a moment, or null when it can. */
export function recusarMomento(
  arquivo: { readonly type: string; readonly size: number },
  dia: string,
): RecusaMomento | null {
  if (!chaveValida(dia)) return 'dia';
  if (!TIPOS_ACEITOS.includes(arquivo.type as (typeof TIPOS_ACEITOS)[number])) return 'tipo';
  if (arquivo.size > BYTES_MAXIMOS || arquivo.size <= 0) return 'tamanho';
  return null;
}

export const MENSAGEM_RECUSA: Record<RecusaMomento, string> = {
  tipo: 'Esse arquivo não é uma imagem. Escolha uma foto.',
  tamanho: 'Essa imagem é grande demais. Escolha uma foto de até 25 MB.',
  dia: 'Não consegui identificar o dia dessa lembrança.',
};

/** Every message a photo action can show, for the Reel and the day dialog alike. */
export const MENSAGENS_MOMENTO: Record<string, string> = {
  ...MENSAGEM_RECUSA,
  indisponivel: 'Este navegador não guarda fotos. Tente pelo app instalado.',
  espaco: 'Não há espaço no aparelho para mais uma foto.',
  falha: 'Não consegui guardar essa foto. Tente de novo.',
};

/**
 * A photograph can be kept for today or for a day already gone, never for a
 * day that has not happened. Keys are zero-padded, so comparing them as text
 * is comparing the calendar, across month and year turns alike.
 */
export function podeGuardarFoto(dia: string, hoje: Date): boolean {
  return chaveValida(dia) && dia <= chaveDoDia(hoje);
}
