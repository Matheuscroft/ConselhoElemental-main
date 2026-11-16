import type { ReactNode } from 'react';
import { useDirecao } from './useDirecao';

/**
 * The name of the period on screen ("novembro de 2026", "2027"). It is born
 * again whenever the period changes and slides the way the period went.
 * `chave` sorts in time ("2026-09", "2027"), which is how the way is read.
 */
export function TituloDoPeriodo({ chave, como: Tag = 'strong', className = '', children }: {
  chave: string; como?: 'strong' | 'p'; className?: string; children: ReactNode;
}) {
  const direcao = useDirecao(chave);
  return <Tag key={chave} data-direcao={direcao} className={`temporal-periodo ${className}`.trim()}>{children}</Tag>;
}
