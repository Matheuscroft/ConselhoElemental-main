import { memo, useEffect, useId, useMemo, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import type { ElementoId } from '@/lib/design/palette';
import { EXTRAS, PADROES } from './figura-padroes';
import { criarGeometria, enquadramentoDe, preencherGeometria, primitivasDe } from './figura-desenho';
import { posicaoDoPadrao } from './figura-rig';
import './figura-uau.css';

export interface FiguraExercicioProps {
  padraoId: string;
  elemento: ElementoId;
  tamanho?: 'mini' | 'cheio';
  /** Anima em loop (só enquanto visível). Falso ou movimento reduzido: pose estática. */
  animar?: boolean;
  /** Pose estática nesta posição do movimento (0 = primeiro quadro, 1 = último). Padrão: meio. */
  fase?: number;
  /** Regiões musculares a acender (peitoral, costas, ombros, biceps, triceps, antebraco, abdomen, gluteos, quadriceps, posteriores, panturrilha). */
  musculos?: readonly string[];
  className?: string;
}

const consultaReduzido = '(prefers-reduced-motion: reduce)';
const assinar = (aviso: () => void): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
  const lista = window.matchMedia(consultaReduzido);
  lista.addEventListener('change', aviso);
  return () => lista.removeEventListener('change', aviso);
};
const lerReduzido = (): boolean => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(consultaReduzido).matches;

/** Tempo máximo contado por quadro: voltar de outra aba não faz o loop saltar. */
const PASSO_MAXIMO_S = 0.1;
/** Proporção do cartão 16:10, em que a versão cheia vive. */
const ASPECTO_DO_CARTAO = 1.6;

const arredondar = (v: number): string => String(Math.round(v * 100) / 100);

/**
 * Figura vetorial de um padrão de movimento. Os elementos do SVG são criados
 * uma vez; a animação reescreve atributos por ref, sem setState por quadro e
 * sem criar elementos. Um único rAF por componente, que para quando a figura
 * sai da tela, a aba some ou o componente desmonta.
 */
export const FiguraExercicio = memo(function FiguraExercicio({ padraoId, elemento, tamanho = 'cheio', animar = true, fase, musculos, className }: FiguraExercicioProps) {
  const padrao = PADROES[padraoId];
  const id = useId().replace(/:/g, '');
  const reduzido = useSyncExternalStore(assinar, lerReduzido, () => false);
  const svg = useRef<SVGSVGElement>(null);
  const els = useRef<(SVGElement | null)[]>([]);
  const extra = padrao ? EXTRAS[padrao.id] : undefined;
  const prims = useMemo(() => (padrao ? primitivasDe(padrao, extra) : []), [padrao, extra]);
  const chaveMusculos = musculos ? musculos.join(',') : '';
  const ativos = useMemo(() => (chaveMusculos ? new Set(chaveMusculos.split(',')) : undefined), [chaveMusculos]);
  const vb = useMemo(() => (padrao ? enquadramentoDe(padrao, extra, tamanho === 'cheio' ? ASPECTO_DO_CARTAO : 1) : null), [padrao, extra, tamanho]);
  const estatica = !animar || reduzido;
  const posicaoEstatica = fase ?? 0.5;
  const inicial = useMemo(
    () => (padrao ? preencherGeometria(padrao, posicaoEstatica, criarGeometria(prims.length), extra, ativos) : null),
    [padrao, prims, extra, posicaoEstatica, ativos],
  );

  useEffect(() => {
    if (!padrao) return undefined;
    const geo = criarGeometria(prims.length);
    const pintar = (t: number): void => {
      preencherGeometria(padrao, t, geo, extra, ativos);
      const { g, d } = geo;
      for (let i = 0; i < prims.length; i++) {
        const el = els.current[i];
        if (!el) continue;
        const k = prims[i].k;
        if (k === 'p') { el.setAttribute('d', d[i]); continue; }
        const o = i * 4;
        if (k === 'l') {
          el.setAttribute('x1', arredondar(g[o])); el.setAttribute('y1', arredondar(g[o + 1]));
          el.setAttribute('x2', arredondar(g[o + 2])); el.setAttribute('y2', arredondar(g[o + 3]));
        } else {
          el.setAttribute('cx', arredondar(g[o])); el.setAttribute('cy', arredondar(g[o + 1])); el.setAttribute('r', arredondar(g[o + 2]));
        }
      }
    };
    if (estatica) { pintar(posicaoEstatica); return undefined; }

    const raiz = svg.current;
    const duracao = padrao.duracaoS;
    let raf = 0;
    let ultimo = 0;
    // Começa onde o quadro estático está: sem salto ao montar.
    let tempo = padrao.modo === 'ciclo' ? duracao * posicaoEstatica : duracao * 0.25;
    let visivel = true;
    const laco = (agora: number): void => {
      const dt = Math.min(Math.max(agora - ultimo, 0) / 1000, PASSO_MAXIMO_S);
      ultimo = agora;
      tempo += dt;
      pintar(posicaoDoPadrao(padrao, tempo));
      raf = requestAnimationFrame(laco);
    };
    const atualizar = (): void => {
      const deve = visivel && !document.hidden;
      if (deve && !raf) { ultimo = performance.now(); raf = requestAnimationFrame(laco); }
      else if (!deve && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    pintar(posicaoDoPadrao(padrao, tempo));
    let observador: IntersectionObserver | undefined;
    if (raiz && typeof IntersectionObserver !== 'undefined') {
      observador = new IntersectionObserver((entradas) => {
        visivel = entradas[entradas.length - 1].isIntersecting;
        atualizar();
      });
      observador.observe(raiz);
    }
    document.addEventListener('visibilitychange', atualizar);
    atualizar();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observador?.disconnect();
      document.removeEventListener('visibilitychange', atualizar);
    };
  }, [padrao, prims, extra, ativos, estatica, posicaoEstatica]);

  if (!padrao || !inicial || !vb) return null;
  const rotulo = estatica ? `Ilustração do movimento: ${padrao.rotulo}` : `Demonstração animada: ${padrao.rotulo}`;
  const cores = {
    '--g-pele': `url(#${id}-pele)`, '--g-pele-d': `url(#${id}-peled)`,
    '--g-camisa': `url(#${id}-camisa)`, '--g-short': `url(#${id}-short)`, '--g-short-d': `url(#${id}-shortd)`,
  } as CSSProperties;
  return (
    <svg
      ref={svg}
      className={className ? `figura ${className}` : 'figura'}
      style={cores}
      viewBox={`${arredondar(vb.x)} ${arredondar(vb.y)} ${arredondar(vb.w)} ${arredondar(vb.h)}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={rotulo}
      data-elemento={elemento}
      data-tamanho={tamanho}
      data-animando={estatica ? undefined : ''}
    >
      <defs>
        <linearGradient id={`${id}-pele`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--figura-pele-luz)' }} />
          <stop offset=".45" style={{ stopColor: 'var(--figura-pele)' }} />
          <stop offset="1" style={{ stopColor: 'var(--figura-pele-sombra)' }} />
        </linearGradient>
        <linearGradient id={`${id}-peled`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--figura-pele-sombra)' }} />
          <stop offset="1" style={{ stopColor: 'var(--figura-pele-fundo)' }} />
        </linearGradient>
        <linearGradient id={`${id}-camisa`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--figura-acento) 88%, white)' }} />
          <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--figura-acento) 70%, black)' }} />
        </linearGradient>
        <linearGradient id={`${id}-short`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--figura-acento) 45%, #14181d)' }} />
          <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--figura-acento) 28%, #0e1115)' }} />
        </linearGradient>
        <linearGradient id={`${id}-shortd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'color-mix(in srgb, var(--figura-acento) 30%, #0e1115)' }} />
          <stop offset="1" style={{ stopColor: 'color-mix(in srgb, var(--figura-acento) 20%, #0a0c10)' }} />
        </linearGradient>
      </defs>
      <g key={padrao.id}>
        {prims.map((p, i) => {
          const o = i * 4;
          const ref = (el: SVGElement | null): void => { els.current[i] = el; };
          const cls = `f-${p.c}`;
          if (p.k === 'p') return <path key={i} ref={ref} className={cls} d={inicial.d[i]} />;
          if (p.k === 'l') return <line key={i} ref={ref} className={cls} strokeWidth={p.w} x1={arredondar(inicial.g[o])} y1={arredondar(inicial.g[o + 1])} x2={arredondar(inicial.g[o + 2])} y2={arredondar(inicial.g[o + 3])} />;
          return <circle key={i} ref={ref} className={cls} strokeWidth={p.w} cx={arredondar(inicial.g[o])} cy={arredondar(inicial.g[o + 1])} r={arredondar(inicial.g[o + 2])} />;
        })}
      </g>
    </svg>
  );
});

export default FiguraExercicio;
