import { useEffect, useMemo, useRef, type MouseEvent, type PointerEvent, type RefObject } from 'react';
import { lerDuracao } from './useEspiaoDeElemento';

/** Quanto o dedo precisa andar para o eixo travar. */
const TRAVA_PX = 8;
/** Passou disto (ou da velocidade abaixo, ou de um terço da altura), a folha fecha. */
const FECHA_PX = 96;
const FECHA_PX_POR_MS = 0.5;
const FECHA_FRACAO = 0.33;
/** Arrasto horizontal que troca de elemento. */
const TROCA_PX = 40;
/** Para cima a folha não sobe: estica um pouco e volta, como borracha. Este é o máximo que estica. */
const ELASTICO_MAX_PX = 28;
/** A saída dura o que o dedo pede: rápido se o dedo foi rápido, nunca menos nem mais que isto. */
const SAIDA_MIN_MS = 160;
const SAIDA_MAX_MS = 360;

export interface ArrastoProps {
  /** O elemento que desce junto com o dedo: a folha inteira. */
  alvo: () => HTMLElement | null;
  aoFechar: () => void;
  /** Só na linha da rosa: arrastar na horizontal passa ao elemento seguinte (1) ou anterior (-1). */
  aoElemento?: (passo: 1 | -1) => void;
  reduzido?: boolean;
  /** A lista rolável: puxar para baixo quando ela já está no topo também desce a folha (como uma folha do sistema). */
  corpo?: RefObject<HTMLElement | null>;
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

/** Assenta sem ultrapassar: a folha está no pé da tela, e passar do ponto abriria uma fresta embaixo dela. */
const SOLTA = 'translate var(--ds-duration-settle) cubic-bezier(.16, 1, .3, 1)';

/** Estica com resistência: quanto mais o dedo puxa para cima, menos a folha acompanha. */
const elastico = (dy: number) => ELASTICO_MAX_PX * (1 - Math.exp(-dy / 80));
const fundo = (): HTMLElement | null => (typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('[data-slot="sheet-overlay"]'));

/**
 * O movimento da folha, em um lugar só. Quem decide o gesto (a alça, a linha da rosa, a lista no topo) chama
 * `seguir` a cada movimento e `soltar` ao fim. A folha acompanha o dedo por `translate` (soma-se ao `transform` da
 * animação de abertura), escrito uma vez por quadro; o fundo escurecido clareia junto com ela; ao soltar, a saída
 * dura o que a velocidade do dedo pede e o retorno assenta em mola.
 */
function useControleDaFolha(atual: RefObject<{ alvo: () => HTMLElement | null; aoFechar: () => void; reduzido: boolean }>) {
  const quadro = useRef(0);
  const pendente = useRef(0);
  const relogio = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { clearTimeout(relogio.current); cancelAnimationFrame(quadro.current); }, []);

  return useMemo(() => {
    const aplicar = () => {
      quadro.current = 0;
      const no = atual.current.alvo();
      if (!no) return;
      const dy = pendente.current;
      no.style.transition = 'none';
      no.style.translate = `0 ${dy >= 0 ? dy : -elastico(-dy)}px`;
      const f = fundo();
      if (f) {
        f.style.transition = 'none';
        f.style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / Math.max(1, no.offsetHeight)));
      }
    };
    return {
      comecar() { clearTimeout(relogio.current); },
      seguir(dy: number) {
        pendente.current = dy;
        if (!quadro.current) quadro.current = requestAnimationFrame(aplicar);
      },
      soltar(dy: number, velocidade: number, cancelado: boolean) {
        cancelAnimationFrame(quadro.current);
        quadro.current = 0;
        const { alvo: pegar, aoFechar: fechar, reduzido: sem } = atual.current;
        const no = pegar();
        const altura = no?.offsetHeight ?? 0;
        const fecha = !cancelado && dy > 0 && (dy > FECHA_PX || velocidade > FECHA_PX_POR_MS || (altura > 0 && dy > altura * FECHA_FRACAO));
        if (!no) { if (fecha) fechar(); return; }
        const f = fundo();
        if (fecha) {
          // A saída dura o que o dedo pede: o que falta descer, na velocidade em que ele vinha.
          const falta = Math.max(0, altura - dy);
          const ms = sem ? 0 : Math.min(SAIDA_MAX_MS, Math.max(SAIDA_MIN_MS, falta / Math.max(velocidade, 0.9)));
          no.style.transition = sem ? 'none' : `translate ${ms}ms cubic-bezier(.3, .7, .4, 1)`;
          no.style.translate = '0 100%';
          if (f) { f.style.transition = sem ? 'none' : `opacity ${ms}ms linear`; f.style.opacity = '0'; }
          relogio.current = setTimeout(() => { no.style.visibility = 'hidden'; fechar(); }, ms);
          return;
        }
        // Volta assentando em mola e solta as propriedades.
        no.style.transition = sem ? 'none' : SOLTA;
        no.style.translate = '0 0';
        if (f) { f.style.transition = sem ? 'none' : 'opacity var(--ds-duration-settle) var(--ds-ease)'; f.style.opacity = '1'; }
        const espera = sem ? 0 : lerDuracao(no, '--ds-duration-settle');
        relogio.current = setTimeout(() => {
          no.style.transition = ''; no.style.translate = '';
          if (f) { f.style.transition = ''; f.style.opacity = ''; }
        }, espera);
      },
    };
  }, [atual]);
}

/**
 * Gesto da folha: a alça, a linha da rosa e a lista quando ela está no topo. A lista só entra no gesto se o dedo
 * começou com ela no topo e puxa para baixo; qualquer outro caso é rolagem normal.
 */
export function useArrastoDaFolha({ alvo, aoFechar, aoElemento, reduzido = false, corpo }: ArrastoProps): { alca: ZonaDeArrasto; rosa: ZonaDeArrasto } {
  const gesto = useRef<Gesto | null>(null);
  const engolirClique = useRef(false);
  const atual = useRef({ alvo, aoFechar, aoElemento, reduzido });
  useEffect(() => { atual.current = { alvo, aoFechar, aoElemento, reduzido }; });
  const folha = useControleDaFolha(atual);

  // A lista rolável: puxar para baixo a partir do topo desce a folha. Eventos de toque, porque só eles podem
  // pedir ao navegador que não role (preventDefault) no instante em que o gesto vira da folha.
  useEffect(() => {
    const lista = corpo?.current;
    if (!lista) return;
    let g: { y: number; t: number; anterior: { y: number; t: number }; ultimo: { y: number; t: number }; ativo: boolean } | null = null;
    const aoComecar = (e: TouchEvent) => {
      if (e.touches.length !== 1 || lista.scrollTop > 0) { g = null; return; }
      const y = e.touches[0].clientY;
      g = { y, t: e.timeStamp, anterior: { y, t: e.timeStamp }, ultimo: { y, t: e.timeStamp }, ativo: false };
    };
    const aoMover = (e: TouchEvent) => {
      if (!g) return;
      const y = e.touches[0].clientY;
      const dy = y - g.y;
      if (!g.ativo) {
        if (dy < -TRAVA_PX || lista.scrollTop > 0) { g = null; return; }
        if (dy < TRAVA_PX) return;
        g.ativo = true;
        folha.comecar();
      }
      e.preventDefault();
      g.anterior = g.ultimo;
      g.ultimo = { y, t: e.timeStamp };
      folha.seguir(Math.max(0, dy));
    };
    const aoTerminar = (e: TouchEvent) => {
      if (!g) return;
      const atualG = g;
      g = null;
      if (!atualG.ativo) return;
      const y = e.changedTouches[0]?.clientY ?? atualG.ultimo.y;
      const dt = Math.max(1, atualG.ultimo.t - atualG.anterior.t);
      folha.soltar(Math.max(0, y - atualG.y), (atualG.ultimo.y - atualG.anterior.y) / dt, e.type === 'touchcancel');
    };
    lista.addEventListener('touchstart', aoComecar, { passive: true });
    lista.addEventListener('touchmove', aoMover, { passive: false });
    lista.addEventListener('touchend', aoTerminar, { passive: true });
    lista.addEventListener('touchcancel', aoTerminar, { passive: true });
    return () => {
      lista.removeEventListener('touchstart', aoComecar);
      lista.removeEventListener('touchmove', aoMover);
      lista.removeEventListener('touchend', aoTerminar);
      lista.removeEventListener('touchcancel', aoTerminar);
    };
  }, [corpo, folha]);

  return useMemo(() => {
    const criar = (horizontal: boolean): ZonaDeArrasto => {
      const terminar = (evento: PointerEvent<HTMLElement>, cancelado: boolean) => {
        const g = gesto.current;
        if (!g || g.id !== evento.pointerId) return;
        gesto.current = null;
        if (evento.currentTarget.hasPointerCapture?.(evento.pointerId)) evento.currentTarget.releasePointerCapture(evento.pointerId);
        if (g.eixo === null) return;
        engolirClique.current = true;
        if (g.eixo === 'x') {
          const dx = evento.clientX - g.x;
          if (!cancelado && horizontal && Math.abs(dx) >= TROCA_PX) atual.current.aoElemento?.(dx < 0 ? 1 : -1);
          return;
        }
        const dt = Math.max(1, g.ultimo.t - g.anterior.t);
        folha.soltar(Math.max(0, evento.clientY - g.y), (g.ultimo.y - g.anterior.y) / dt, cancelado);
      };

      return {
        onPointerDown(evento) {
          if (evento.pointerType === 'mouse' && evento.button !== 0) return;
          if (gesto.current) return;
          folha.comecar();
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
            evento.currentTarget.setPointerCapture?.(evento.pointerId);
          }
          if (g.eixo === 'y') {
            // Para cima a folha estica e volta: o gesto responde, mesmo sem ter para onde ir.
            folha.seguir(dy);
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
  }, [folha]);
}
