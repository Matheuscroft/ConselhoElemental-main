import { useEffect, useState } from 'react';
import { Contagem } from '@/components/motion/Contagem';

const NUMERO = /^(\d{1,9})(?:([.,])(\d{1,2}))?$/;
const lerNumero = (texto: string) => {
  const parte = NUMERO.exec(texto.trim());
  return parte ? { valor: Number(`${parte[1]}${parte[3] ?? ''}`), casas: parte[3]?.length ?? 0, separador: parte[2] ?? ',' } : null;
};

/**
 * A figure that counts up from zero when it arrives. Only plain numbers count
 * ("12", "3,5"); a clock, a range or a dash stays as written. The last frame
 * is always the exact text it was given, so nothing is ever rounded away.
 */
export function NumeroQueConta({ texto, atraso = 0 }: { texto: string; atraso?: number }) {
  const numero = lerNumero(texto);
  // The count moves a moment after mounting, so it is seen counting up.
  const [alvo, setAlvo] = useState(0);
  useEffect(() => {
    const lido = lerNumero(texto);
    if (!lido) return;
    const inicio = window.setTimeout(() => setAlvo(lido.valor), atraso);
    return () => window.clearTimeout(inicio);
  }, [texto, atraso]);
  if (!numero) return <>{texto}</>;
  const { casas, separador } = numero;
  const formatar = (valor: number) => {
    const bruto = (valor / 10 ** casas).toFixed(casas);
    return casas > 0 && separador === ',' ? bruto.replace('.', ',') : bruto;
  };
  return <Contagem valor={alvo} beat="settle" formatar={formatar} />;
}
