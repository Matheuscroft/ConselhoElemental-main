import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import type { AppRoute } from '@/lib/app-routes';
import type { ElementId } from '@/types';
import { ArcaneIcon, ROUTE_ICONS } from '@/components/elemental/ArcaneIcon';
import './inscricao.css';

/** normal: a vista; acesa: a busca respondeu; adormecida: a busca recuou a linha; latente: so aparece quando a busca a acende. */
export type EstadoDaLinha = 'normal' | 'acesa' | 'adormecida' | 'latente';

/** Quanto a assinatura ao toque fica no ar; acompanha --ds-duration-settle (420). */
const TOQUE_MS = 420;

/** O nome que a linha mostra: sem separador de pagina interna ("Treinos, Painel"); o Temporal aponta para a Semana e leva o nome inteiro. */
export function nomeDaRota(rota: Pick<AppRoute, 'id' | 'label'>): string {
  if (rota.id === 'temporal') return 'Temporal';
  return rota.label.replace(/\s*·\s*/g, ', ');
}

export interface LinhaDeRotaProps {
  rota: Pick<AppRoute, 'id' | 'label' | 'path' | 'description'>;
  elemento: ElementId;
  estado?: EstadoDaLinha;
  /** E a pagina aberta agora: aria-current, triangulo ouro, sigilo ativo, "Você está aqui". */
  atual?: boolean;
  /** Primeira resposta da busca: triangulo ouro e Enter (so em ponteiro fino). */
  primeira?: boolean;
  /** Chamado depois do toque; quem chama fecha a folha. */
  aoNavegar?: (rota: LinhaDeRotaProps['rota']) => void;
}

/** Uma pagina como <Link>: sigilo do elemento, nome, descricao de uma linha e a assinatura do elemento ao toque. */
export function LinhaDeRota({ rota, elemento, estado = 'normal', atual = false, primeira = false, aoNavegar }: LinhaDeRotaProps) {
  const [tocado, setTocado] = useState(false);
  const [ponto, setPonto] = useState<{ x: number; y: number } | null>(null);
  const relogio = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(relogio.current), []);

  const oculta = estado === 'adormecida' || estado === 'latente';
  const acesa = estado === 'acesa';

  const tocar = (evento: PointerEvent<HTMLAnchorElement> | MouseEvent<HTMLAnchorElement>) => {
    const caixa = evento.currentTarget.getBoundingClientRect();
    // Teclado dispara click sem ponto: a assinatura nasce do centro.
    const semPonto = evento.type === 'click' && evento.clientX === 0 && evento.clientY === 0;
    setPonto(semPonto ? null : { x: Math.round(evento.clientX - caixa.left), y: Math.round(evento.clientY - caixa.top) });
    setTocado(false);
    clearTimeout(relogio.current);
    // Reinicia a animacao quando toca de novo antes de acabar.
    relogio.current = setTimeout(() => {
      setTocado(true);
      relogio.current = setTimeout(() => setTocado(false), TOQUE_MS);
    }, 0);
  };

  return (
    <div
      className="ins-rota"
      data-element={elemento}
      data-acesa={acesa || undefined}
      data-adormecida={estado === 'adormecida' || undefined}
      data-latente={estado === 'latente' || undefined}
      data-primeira={primeira || undefined}
      data-tocado={tocado || undefined}
      style={ponto ? ({ '--x': `${ponto.x}px`, '--y': `${ponto.y}px` } as CSSProperties) : undefined}
      inert={oculta}
      aria-hidden={oculta || undefined}
    >
      <div className="ins-corte">
        <Link
          to={rota.path}
          className="ds-linha ins-linha"
          aria-current={atual ? 'page' : undefined}
          onPointerDown={tocar}
          onClick={(evento) => {
            if (!tocado) tocar(evento);
            aoNavegar?.(rota);
          }}
        >
          <ArcaneIcon name={ROUTE_ICONS[rota.id] ?? 'santuario'} size={28} className="ins-sigilo" ativo={acesa || atual} />
          <span className="ins-texto">
            <span className="ins-nome">{nomeDaRota(rota)}</span>
            <span className="ins-descricao">{rota.description}</span>
          </span>
          <span className="ins-fim">
            {atual ? (
              <span className="ins-aqui">Você está aqui</span>
            ) : (
              <>
                {primeira ? <kbd className="ins-enter">Enter</kbd> : null}
                <ArcaneIcon name="chevron" size={16} className="ins-chevron" />
              </>
            )}
          </span>
        </Link>
      </div>
    </div>
  );
}

export default LinhaDeRota;
