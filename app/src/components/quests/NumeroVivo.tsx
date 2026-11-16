import { Contagem } from '@/components/motion/Contagem';
import { ABERTURA_CONQUISTAS_MS, useDeZero, useEntradaDaCena } from './entrada-conquistas';

/**
 * A figure that counts up in front of the person. In the scene it only does so
 * in the full arrival (`sempre` is for a sheet that opens on request, which is
 * a moment of its own). The text is always the real value once it lands.
 */
export function NumeroVivo({ valor, atraso = ABERTURA_CONQUISTAS_MS / 2, sempre = false, sufixo }: { valor: number; atraso?: number; sempre?: boolean; sufixo?: string }) {
  const entrada = useEntradaDaCena();
  const mostrado = useDeZero(valor, atraso, sempre || entrada === 'plena');
  return <span className="cq-numero"><Contagem valor={mostrado} beat="settle" />{sufixo}</span>;
}
