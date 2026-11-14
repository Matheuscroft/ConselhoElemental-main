import { APP_ROUTES } from '@/lib/app-routes';

export const CHAVE_RECENTES = 'conselho-elemental:mais:recentes';
const MAX_GUARDADOS = 5;
const MAX_MOSTRADOS = 3;

type Armazenamento = Pick<Storage, 'getItem' | 'setItem'>;

function armazenamentoPadrao(): Armazenamento | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

const idValido = (id: unknown): id is string => typeof id === 'string' && APP_ROUTES.some((rota) => rota.id === id);

/** Ids guardados, do mais recente ao mais antigo: válidos, sem repetição, até 5. */
export function lerRecentes(armazenamento: Armazenamento | null = armazenamentoPadrao()): string[] {
  if (!armazenamento) return [];
  try {
    const bruto = JSON.parse(armazenamento.getItem(CHAVE_RECENTES) ?? '[]');
    if (!Array.isArray(bruto)) return [];
    return [...new Set(bruto.filter(idValido))].slice(0, MAX_GUARDADOS);
  } catch {
    return [];
  }
}

/** Idempotente: registrar o mesmo id seguidamente não muda nada além da posição. */
export function registrarRecente(id: string, armazenamento: Armazenamento | null = armazenamentoPadrao()): void {
  if (!armazenamento || !idValido(id)) return;
  try {
    const atuais = lerRecentes(armazenamento);
    if (atuais[0] === id) return;
    const proximos = [id, ...atuais.filter((item) => item !== id)].slice(0, MAX_GUARDADOS);
    armazenamento.setItem(CHAVE_RECENTES, JSON.stringify(proximos));
  } catch {
    // Sem armazenamento (modo privado, cota cheia): a trilha simplesmente não guarda.
  }
}

/** Até 3 ids para "Há pouco", sem a página atual. */
export function recentesParaMostrar(idAtual?: string, armazenamento: Armazenamento | null = armazenamentoPadrao()): string[] {
  return lerRecentes(armazenamento).filter((id) => id !== idAtual).slice(0, MAX_MOSTRADOS);
}
