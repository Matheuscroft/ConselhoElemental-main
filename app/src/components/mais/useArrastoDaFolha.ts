import { useEffect, useMemo, useRef, type MouseEvent, type PointerEvent } from 'react';
import { lerDuracao } from './useEspiaoDeElemento';

/** Quanto o dedo precisa andar para o eixo travar. */
const TRAVA_PX = 8;
/** Passou disto (ou da velocidade abaixo), a folha fecha. */
const FECHA_PX = 96;
const FECHA_PX_POR_MS = 0.5;
/** Arrasto horizontal que troca de elemento. */
const TROCA_PX = 40;

export interface ArrastoProps {
  /** O elemento que desce junto com o dedo: a folha inteira. */
  alvo: () => HTMLElement | null;
  aoFechar: () => void;
  /** Só na linha da rosa: arrastar na horizontal passa ao elemento seguinte (1) ou anterior (-1). */
  aoElemento?: (passo: 1 | -1) => void;
  reduzido?: boolean;
}

export interface ZonaDeArrasto {
  onPointerDown: (evento: PointerEvent<HTMLElement>) => void;
  onPointerMove: (evento: PointerEvent<HTMLElement>) => void;
  onPointerUp: (evento: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (evento: PointerEvent<HTMLElement>) => void;
  onClickCapture: (evento: MouseEvent<HTMLElement>) => void;
}

interface Gesto {
  id: number;
  x: number;
  y: number;
  t: number;
  eixo: 'x' | 'y' | null;
  anterior: { y: number; t: number };
  ultimo: { y: number; t: number };
}

const TRANSICAO = 'translate var(--ds-duration-settle) var(--ds-ease)';

/**
 * Gesto da folha, só nas duas zonas que o recebem (a alça e a linha da rosa;
 * a lista nunca tem gesto). Usa a propriedade `translate`, que se soma ao
 * `transform` da animação de abertura em vez de brigar com ela.
 */
export function useArrastoDaFolha({ alvo, aoFechar, aoElemento, reduzido = false }: ArrastoProps): { alca: ZonaDeArrasto; rosa: ZonaDeArrasto } {
  const gesto = useRef<Gesto | null>(null);
  const engolirClique = useRef(false);
  const relogio = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const atual = useRef({ alvo, aoFechar, aoElemento, reduzido });
  useEffect(() => { atual.current = { alvo, aoFechar, aoElemento, reduzido }; });
  useEffect(() => () => clearTimeout(relogio.current), []);

  return useMemo(() => {
    const criar = (horizontal: boolean): ZonaDeArrasto => {
      const terminar = (evento: PointerEvent<HTMLElement>, cancelado: boolean) => {
        const g = gesto.current;
        if (!g || g.id !== evento.pointerId) return;
        gesto.current = null;
        if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) evento.currentTarget.releasePointerCapture(evento.pointerId);
        if (g.eixo === null) return;
        engolirClique.current = true;
        const { alvo: pegar, aoFechar: fechar, aoElemento: trocar, reduzido: sem } = atual.current;
        const no = pegar();
        if (g.eixo === 'x') {
          const dx = evento.clientX - g.x;
          if (!cancelado && horizontal && Math.abs(dx) >= TROCA_PX) trocar?.(dx < 0 ? 1 : -1);
          return;
        }
        const dy = Math.max(0, evento.clientY - g.y);
        const dt = Math.max(1, g.ultimo.t - g.anterior.t);
        const velocidade = (g.ultimo.y - g.anterior.y) / dt;
        if (!no) { if (!cancelado && (dy > FECHA_PX || velocidade > FECHA_PX_POR_MS)) fechar(); return; }
        if (!cancelado && (dy > FECHA_PX || velocidade > FECHA_PX_POR_MS)) {
          // Termina de descer, some e só então fecha: a animação de saída não pisca.
          no.style.transition = sem ? 'none' : TRANSICAO;
          no.style.translate = '0 100%';
          const espera = sem ? 0 : lerDuracao(no, '--ds-duration-settle');
          relogio.current = setTimeout(() => { no.style.visibility = 'hidden'; fechar(); }, espera);
          return;
        }
        // Volta assentando e solta a propriedade.
        no.style.transition = sem ? 'none' : TRANSICAO;
        no.style.translate = '0 0';
        const espera = sem ? 0 : lerDuracao(no, '--ds-duration-settle');
        relogio.current = setTimeout(() => { no.style.transition = ''; no.style.translate = ''; }, espera);
      };

      return {
        onPointerDown(evento) {
          if (evento.pointerType === 'mouse' && evento.button !== 0) return;
          if (gesto.current) return;
          clearTimeout(relogio.current);
          engolirClique.current = false;
          const t = evento.timeStamp;
          gesto.current = {
            id: evento.pointerId, x: evento.clientX, y: evento.clientY, t, eixo: null,
            anterior: { y: evento.clientY, t }, ultimo: { y: evento.clientY, t },
          };
        },
        onPointerMove(evento) {
          const g = gesto.current;
          if (!g || g.id !== evento.pointerId) return;
          const dx = evento.clientX - g.x;
          const dy = evento.clientY - g.y;
          if (g.eixo === null) {
            if (Math.abs(dx) < TRAVA_PX && Math.abs(dy) < TRAVA_PX) return;
            g.eixo = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
            // Gesto na horizontal fora da linha da rosa não é de ninguém.
            if (g.eixo === 'x' && !horizontal) { gesto.current = null; return; }
            // Para cima na alça também não é gesto: a folha só desce.
            if (g.eixo === 'y' && dy < 0) { gesto.current = null; return; }
            evento.currentTarget.setPointerCapture?.(evento.pointerId);
            const no = atual.current.alvo();
            if (no && g.eixo === 'y') { no.style.transition = 'none'; }
          }
          if (g.eixo === 'y') {
            const no = atual.current.alvo();
            if (no) no.style.translate = `0 ${Math.max(0, dy)}px`;
            g.anterior = g.ultimo;
            g.ultimo = { y: evento.clientY, t: evento.timeStamp };
          }
        },
        onPointerUp: (evento) => terminar(evento, false),
        onPointerCancel: (evento) => terminar(evento, true),
        onClickCapture(evento) {
          if (!engolirClique.current) return;
          engolirClique.current = false;
          evento.preventDefault();
          evento.stopPropagation();
        },
      };
    };
    return { alca: criar(false), rosa: criar(true) };
  }, []);
}
