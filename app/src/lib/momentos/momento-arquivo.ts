import { chaveValida, type DiaChave } from './momento';

/**
 * The moments file: one JSON document with the viewing copy of every day's
 * photograph as a WebP data URL. The reel thumbnail is not stored; it is
 * redrawn from the viewing copy when the file is brought back.
 *
 * This is the only copy that can leave the device: the photographs live in
 * IndexedDB, which the system erases when the app is removed.
 */
export const FORMATO_MOMENTOS = 'conselho-elemental-momentos';
export const VERSAO_MOMENTOS = 1;
/** Large enough for years of photographs, small enough that a phone can parse it. */
export const BYTES_MAXIMOS_ARQUIVO = 400 * 1024 * 1024;

export interface ItemArquivado { readonly dia: DiaChave; readonly imagem: string }

export function serializar(itens: readonly ItemArquivado[], agora: Date): string {
  return JSON.stringify({ format: FORMATO_MOMENTOS, version: VERSAO_MOMENTOS, criadoEm: agora.toISOString(), itens });
}

export type LeituraArquivo =
  | { readonly ok: true; readonly itens: readonly ItemArquivado[]; readonly ignorados: number }
  | { readonly ok: false; readonly motivo: 'invalido' | 'grande' };

const IMAGEM = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/;

/** Validates everything: a damaged or foreign file never reaches the store. */
export function ler(texto: string, bytes: number = texto.length): LeituraArquivo {
  if (bytes > BYTES_MAXIMOS_ARQUIVO) return { ok: false, motivo: 'grande' };
  let valor: unknown;
  try { valor = JSON.parse(texto); } catch { return { ok: false, motivo: 'invalido' }; }
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return { ok: false, motivo: 'invalido' };
  const v = valor as Record<string, unknown>;
  if (v.format !== FORMATO_MOMENTOS || v.version !== VERSAO_MOMENTOS || !Array.isArray(v.itens)) return { ok: false, motivo: 'invalido' };
  const vistos = new Set<string>();
  const itens: ItemArquivado[] = [];
  let ignorados = 0;
  for (const bruto of v.itens as unknown[]) {
    const item = bruto as Record<string, unknown> | null;
    if (!item || typeof item.dia !== 'string' || typeof item.imagem !== 'string'
      || !chaveValida(item.dia) || !IMAGEM.test(item.imagem) || vistos.has(item.dia)) { ignorados += 1; continue; }
    vistos.add(item.dia);
    itens.push({ dia: item.dia, imagem: item.imagem });
  }
  return { ok: true, itens, ignorados };
}
