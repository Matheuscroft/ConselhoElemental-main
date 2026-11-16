import type { RefObject } from 'react';
import { useChegadaGrimorio } from '@/components/grimorio/useChegadaGrimorio';

/**
 * True once `alvoRef` is first seen, once per opening of the app and per `chave`;
 * true from the first render on a return visit or with reduced motion. It is
 * what lets a ring or a line be drawn in front of the person and not behind
 * the fold.
 */
export const useChegadaSaude = (alvoRef: RefObject<Element | null>, chave: string): boolean =>
  useChegadaGrimorio(alvoRef, `saude:${chave}`);
