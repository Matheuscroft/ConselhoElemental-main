import { useEffect, useRef, type RefObject } from 'react';
import type { ElementId } from '@/types';
import { ELEMENTOS_DA_ROSA } from './constelacoes';

/** Valor de reserva quando o token de duração não puder ser lido (acompanha --ds-duration-settle). */
const SETTLE_PADRAO = 420;

/** Lê um token de duração ("420ms" ou "0.42s") do elemento, em milissegundos. */
export function lerDuracao(no: Element | null, token: string): number {
  if (!no || typeof getComputedStyle === 'undefined') return SETTLE_PADRAO;
  const bruto = getComputedStyle(no).getPropertyValue(token).trim();
  const numero = parseFloat(bruto);
  if (Number.isNaN(numero)) return SETTLE_PADRAO;
  return bruto.endsWith('ms') ? numero : numero * 1000;
}

export interface EspiaoProps {
  /** Corpo rolável: a raiz do observador e quem rola. */
  raiz: RefObject<HTMLElement | null>;
  /** Desliga o espião (ex.: durante a busca, quando a agulha segue a primeira resposta). */
  ativo: boolean;
  /** A agulha deve ir para este elemento. Sem som. */
  aoMudar: (elemento: ElementId) => void;
}

export interface Espiao {
  /** Rola até a inscrição do elemento e suspende o espião até a rolagem acabar. */
  rolarPara: (elemento: ElementId, reduzido: boolean) => void;
  /** Marca uma rolagem programática feita por fora (ex.: a abertura): o espião a ignora. */
  suspender: () => void;
}

const idDaInscricao = (elemento: ElementId) => `mais-inscricao-${elemento}`;

/**
 * Move a agulha enquanto a pessoa rola a lista, sem som. IntersectionObserver
 * nos quatro cabeçalhos (faixa do alto: rootMargin inferior -70%); sem ele,
 * mede os cabeçalhos a cada rolagem. Só reage a rolagem da pessoa: a abertura
 * e o toque num triângulo rolam sob uma bandeira que o espião respeita.
 */
export function useEspiaoDeElemento({ raiz, ativo, aoMudar }: EspiaoProps): Espiao {
  const programatica = useRef(false);
  const liberar = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const quadro = useRef<number | undefined>(undefined);
  const aoMudarRef = useRef(aoMudar);
  useEffect(() => { aoMudarRef.current = aoMudar; });

  const segurar = (no: HTMLElement | null, reduzido: boolean) => {
    programatica.current = true;
    clearTimeout(liberar.current);
    if (quadro.current !== undefined) cancelAnimationFrame(quadro.current);
    const solta = () => { programatica.current = false; };
    if (reduzido) {
      // Duas passagens de quadro: o evento de rolagem instantânea já chegou.
      quadro.current = requestAnimationFrame(() => { quadro.current = requestAnimationFrame(solta); });
      return;
    }
    const espera = lerDuracao(no, '--ds-duration-settle') * 2;
    liberar.current = setTimeout(solta, espera);
  };

  const suspender = () => segurar(raiz.current, true);

  const rolarPara = (elemento: ElementId, reduzido: boolean) => {
    const corpo = raiz.current;
    const secao = corpo?.querySelector<HTMLElement>(`#${idDaInscricao(elemento)}`);
    if (!corpo || !secao) return;
    segurar(corpo, reduzido);
    const topo = secao.getBoundingClientRect().top - corpo.getBoundingClientRect().top + corpo.scrollTop;
    corpo.scrollTo({ top: topo, behavior: reduzido ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const corpo = raiz.current;
    if (!ativo || !corpo) return undefined;
    const cabecalhos = ELEMENTOS_DA_ROSA
      .map((elemento) => ({ elemento, no: corpo.querySelector<HTMLElement>(`#${idDaInscricao(elemento)} header`) }))
      .filter((item): item is { elemento: ElementId; no: HTMLElement } => item.no !== null);
    if (cabecalhos.length === 0) return undefined;

    let rolou = false;
    const dentro = new Set<ElementId>();

    const avaliar = () => {
      if (!rolou || programatica.current) return;
      const fim = corpo.scrollTop + corpo.clientHeight >= corpo.scrollHeight - 2;
      let escolhido: ElementId | undefined;
      if (fim && corpo.scrollTop > 0) escolhido = cabecalhos[cabecalhos.length - 1].elemento;
      else cabecalhos.forEach(({ elemento }) => { if (dentro.has(elemento)) escolhido = elemento; });
      if (escolhido) aoMudarRef.current(escolhido);
    };

    const aoRolar = () => {
      if (programatica.current) return;
      rolou = true;
      if (!('IntersectionObserver' in window)) {
        // Sem o observador: o cabeçalho conta quando está na faixa de cima (30% do corpo).
        const caixa = corpo.getBoundingClientRect();
        dentro.clear();
        cabecalhos.forEach(({ elemento, no }) => {
          const topo = no.getBoundingClientRect().top - caixa.top;
          if (topo >= 0 && topo <= caixa.height * 0.3) dentro.add(elemento);
        });
      }
      avaliar();
    };
    corpo.addEventListener('scroll', aoRolar, { passive: true });

    let observador: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          const item = cabecalhos.find((c) => c.no === entrada.target);
          if (!item) return;
          if (entrada.isIntersecting) dentro.add(item.elemento);
          else dentro.delete(item.elemento);
        });
        avaliar();
      }, { root: corpo, rootMargin: '0px 0px -70% 0px', threshold: 0 });
      cabecalhos.forEach(({ no }) => observador?.observe(no));
    }

    return () => {
      corpo.removeEventListener('scroll', aoRolar);
      observador?.disconnect();
    };
  }, [raiz, ativo]);

  useEffect(() => () => {
    clearTimeout(liberar.current);
    if (quadro.current !== undefined) cancelAnimationFrame(quadro.current);
  }, []);

  return { rolarPara, suspender };
}
