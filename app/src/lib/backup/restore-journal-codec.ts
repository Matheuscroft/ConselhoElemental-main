/** Recovery artifact codec only. Live store projections and exported JSON stay
 * byte-for-byte unchanged. Plain payloads from all previous releases still read. */
export const MAX_RESTORE_PAYLOAD_BYTES = 100 * 1024 * 1024;
const prefix = 'gzip-v1:';
const encoder = new TextEncoder();

async function readBounded(stream: ReadableStream<Uint8Array>): Promise<Uint8Array<ArrayBuffer>> {
  const reader = stream.getReader(), chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_RESTORE_PAYLOAD_BYTES) {
        await reader.cancel();
        throw new Error('Diário excede o limite permitido.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

function base64(bytes: Uint8Array) {
  const chunks: string[] = [];
  for (let at = 0; at < bytes.length; at += 32768) chunks.push(String.fromCharCode(...bytes.subarray(at, at + 32768)));
  return btoa(chunks.join(''));
}

export async function encodeRestoreJournalPayload(payload: string): Promise<string> {
  if (encoder.encode(payload).byteLength > MAX_RESTORE_PAYLOAD_BYTES) throw new Error('Diário excede o limite permitido.');
  if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') return payload;
  const compressed = await readBounded(new Blob([payload]).stream().pipeThrough(new CompressionStream('gzip')));
  const encoded = prefix + base64(compressed);
  return encoded.length < payload.length ? encoded : payload;
}

/** Decoding is not validation or write authority. inspect() checks the sealed
 * checksum first, then validates the entire decoded before/target protocol. */
export async function decodeRestoreJournalPayload(payload: string): Promise<string> {
  if (encoder.encode(payload).byteLength > MAX_RESTORE_PAYLOAD_BYTES) throw new Error('Diário excede o limite permitido.');
  if (!payload.startsWith(prefix)) return payload;
  if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador precisa ser atualizado para recuperar a importação. Preserve os dados e abra em um navegador atualizado.');
  try {
    const raw = atob(payload.slice(prefix.length)), bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    const decoded = await readBounded(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')));
    return new TextDecoder('utf-8', { fatal: true }).decode(decoded);
  } catch (error) {
    if (error instanceof Error && error.message === 'Diário excede o limite permitido.') throw error;
    throw new Error('Não foi possível ler o diário de recuperação compactado. Preserve os dados do navegador.');
  }
}
