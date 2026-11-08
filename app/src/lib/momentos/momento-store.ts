import {
  type DiaChave,
  LADO_EXIBICAO,
  LADO_MINIATURA,
  caberEm,
  chaveValida,
  recusarMomento,
  type RecusaMomento,
} from './momento';

/**
 * Where a day's photograph lives: IndexedDB on this device.
 *
 * The original is never kept. A phone photograph is 3 to 5 MB and a year of
 * them is over a gigabyte, which no browser will hold. Two WebP copies are
 * stored instead -- one to look at, one for a reel to scroll -- which brings
 * a year to something like 125 MB.
 */

const BANCO = 'ce-momentos';
const LOJA = 'momentos';
const VERSAO = 1;

export interface Momento {
  readonly dia: DiaChave;
  readonly exibicao: Blob;
  readonly miniatura: Blob;
  readonly largura: number;
  readonly altura: number;
  readonly criadoEm: number;
}

export const momentosDisponiveis = (): boolean =>
  typeof indexedDB !== 'undefined' && typeof createImageBitmap === 'function';

let conexao: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (conexao) return conexao;
  conexao = new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, VERSAO);
    pedido.onupgradeneeded = () => {
      if (!pedido.result.objectStoreNames.contains(LOJA)) {
        pedido.result.createObjectStore(LOJA, { keyPath: 'dia' });
      }
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
  // A failed open must not poison every later call.
  conexao.catch(() => { conexao = null; });
  return conexao;
}

const transacao = async <T>(modo: IDBTransactionMode, acao: (loja: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const banco = await abrir();
  return new Promise<T>((resolve, reject) => {
    const tx = banco.transaction(LOJA, modo);
    const pedido = acao(tx.objectStore(LOJA));
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
};

/** Draws a bitmap at a size and hands back WebP, wherever a canvas exists. */
async function reduzir(fonte: ImageBitmap, lado: number, qualidade: number): Promise<Blob> {
  const { largura, altura } = caberEm({ largura: fonte.width, altura: fonte.height }, lado);

  if (typeof OffscreenCanvas === 'function') {
    const tela = new OffscreenCanvas(largura, altura);
    const ctx = tela.getContext('2d');
    if (!ctx) throw new Error('sem contexto 2d');
    ctx.drawImage(fonte, 0, 0, largura, altura);
    return tela.convertToBlob({ type: 'image/webp', quality: qualidade });
  }

  const tela = document.createElement('canvas');
  tela.width = largura;
  tela.height = altura;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('sem contexto 2d');
  ctx.drawImage(fonte, 0, 0, largura, altura);
  return new Promise<Blob>((resolve, reject) => {
    tela.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('sem blob'))), 'image/webp', qualidade);
  });
}

export type ResultadoSalvar =
  | { readonly ok: true; readonly momento: Momento }
  | { readonly ok: false; readonly motivo: RecusaMomento | 'indisponivel' | 'espaco' | 'falha' };

export async function salvarMomento(dia: DiaChave, arquivo: File): Promise<ResultadoSalvar> {
  const recusa = recusarMomento(arquivo, dia);
  if (recusa) return { ok: false, motivo: recusa };
  if (!momentosDisponiveis()) return { ok: false, motivo: 'indisponivel' };

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    return { ok: false, motivo: 'tipo' };
  }

  try {
    const [exibicao, miniatura] = await Promise.all([
      reduzir(bitmap, LADO_EXIBICAO, 0.82),
      reduzir(bitmap, LADO_MINIATURA, 0.78),
    ]);
    const momento: Momento = {
      dia,
      exibicao,
      miniatura,
      largura: bitmap.width,
      altura: bitmap.height,
      criadoEm: Date.now(),
    };
    await transacao('readwrite', (loja) => loja.put(momento));
    return { ok: true, momento };
  } catch (erro) {
    const nome = (erro as DOMException | null)?.name;
    return { ok: false, motivo: nome === 'QuotaExceededError' ? 'espaco' : 'falha' };
  } finally {
    bitmap.close();
  }
}

export async function lerMomento(dia: DiaChave): Promise<Momento | null> {
  if (!chaveValida(dia) || !momentosDisponiveis()) return null;
  try {
    return (await transacao<Momento | undefined>('readonly', (loja) => loja.get(dia))) ?? null;
  } catch {
    return null;
  }
}

export async function apagarMomento(dia: DiaChave): Promise<boolean> {
  if (!chaveValida(dia) || !momentosDisponiveis()) return false;
  try {
    await transacao('readwrite', (loja) => loja.delete(dia));
    return true;
  } catch {
    return false;
  }
}

/** Every day that has a moment, newest first. */
export async function listarDias(): Promise<DiaChave[]> {
  if (!momentosDisponiveis()) return [];
  try {
    const chaves = await transacao<IDBValidKey[]>('readonly', (loja) => loja.getAllKeys());
    return (chaves as DiaChave[]).sort().reverse();
  } catch {
    return [];
  }
}

/**
 * An object URL and the way to let it go. A reel makes one per card, and a
 * URL that is never revoked keeps its blob in memory for the life of the
 * page -- thirty of those is how a gallery leaks a phone's memory away.
 */
export function enderecoTemporario(blob: Blob): { url: string; soltar: () => void } {
  const url = URL.createObjectURL(blob);
  return { url, soltar: () => URL.revokeObjectURL(url) };
}
