import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';
import { CycleSigil } from '@/components/cycles/CycleSigil';

export type MedidorForma = 'fio' | 'trilha' | 'anel';
export const MEDIDOR_TRILHA_MAXIMO = 14;

export interface MedidorProps {
  forma?: MedidorForma;
  /** Progresso de 0 a 1 (fora do intervalo é limitado). */
  valor: number;
  /** Trilha: total de triângulos; acima de 14 vira fio. */
  itens?: number;
  /** Elemento dos triângulos da trilha. */
  elemento?: ElementId;
  /** Cor do preenchimento (valor CSS, normalmente `var(--...)`). */
  cor?: string;
  espesso?: boolean;
  /** Único jeito de expor números: vira aria-label. */
  rotulo?: string;
  /** Anel: estado do HUD (ex.: cheio, baixo). */
  estado?: string;
  /** Anel: lado em px (22, 28 ou 44). */
  tamanho?: 22 | 28 | 44;
  /** Preenchimento em ouro, com ponta. */
  conquista?: boolean;
}

const limitar = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

/** Medidor sem número visível: fio, trilha de triângulos ou anel. */
export function Medidor({ forma = 'fio', valor, itens, elemento = 'fogo', cor, espesso = false, rotulo, estado, tamanho = 28, conquista = false }: MedidorProps) {
  const v = limitar(valor);
  let usada: MedidorForma = forma;
  if (usada === 'trilha' && (!itens || itens < 1 || itens > MEDIDOR_TRILHA_MAXIMO)) usada = 'fio';
  const estilo = { '--medidor-valor': v, ...(cor ? { '--medidor-cor': cor } : null) } as CSSProperties;
  const comum = {
    className: 'ds-medidor',
    'data-forma': usada,
    'data-espesso': espesso && usada === 'fio' ? '' : undefined,
    'data-conquista': conquista ? '' : undefined,
    style: estilo,
  };

  if (usada === 'trilha') {
    const total = itens as number;
    const cheios = Math.round(v * total);
    const lista = (
      <ol aria-hidden={rotulo ? undefined : true} aria-label={rotulo} style={{ display: 'contents' }}>
        {Array.from({ length: total }, (_, i) => (
          <li key={i} data-cheio={i < cheios ? '' : undefined}>
            <CycleSigil element={elemento} size="trail" filled={i < cheios} />
          </li>
        ))}
      </ol>
    );
    return <div {...comum} role={rotulo ? 'img' : undefined} aria-label={rotulo}>{rotulo ? <span aria-hidden="true">{lista}</span> : lista}</div>;
  }

  if (usada === 'anel') {
    return (
      <span {...comum} data-estado={estado} data-tamanho={tamanho} role={rotulo ? 'img' : undefined} aria-label={rotulo} aria-hidden={rotulo ? undefined : true}>
        <svg viewBox="0 0 36 36" width={tamanho} height={tamanho} aria-hidden="true" focusable="false">
          <circle className="ds-medidor-trilho" cx="18" cy="18" r="16" fill="none" pathLength={100} />
          <circle className="ds-medidor-arco" cx="18" cy="18" r="16" fill="none" pathLength={100} strokeDasharray={`${+(v * 100).toFixed(2)} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
        </svg>
      </span>
    );
  }

  return (
    <div {...comum} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={rotulo ?? 'Progresso'}>
      <span className="ds-medidor-preenchimento" aria-hidden="true" />
    </div>
  );
}

export default Medidor;
