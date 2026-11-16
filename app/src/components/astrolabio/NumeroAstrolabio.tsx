import { Contagem } from '@/components/motion/Contagem';
import { ABERTURA_ASTROLABIO_MS, useDeZero, useEntradaDaCena } from './entrada-astrolabio';

/**
 * A figure that counts up in front of the person, only in the full arrival.
 * The text is always the real value once it lands.
 */
export function NumeroAstrolabio({ valor, formatar }: { valor: number; formatar?: (valor: number) => string }) {
  const entrada = useEntradaDaCena();
  const mostrado = useDeZero(valor, ABERTURA_ASTROLABIO_MS / 2, entrada === 'plena');
  return <span className="ast-numero"><Contagem valor={mostrado} beat="settle" formatar={formatar} /></span>;
}
