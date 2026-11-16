import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';
import { QuestRune } from './QuestRune';

const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

/**
 * The flourish when a Journey or Great Work is sealed, in the same language as
 * the ritual's: the element's rune lights, a ring and a circle of sparks leave
 * it. Purely decorative; the message and the reward beside it say what happened.
 */
export function CelebracaoConquista({ elemento }: { elemento: ElementId }) {
  return <span className="cq-celebra" data-element={elemento} aria-hidden="true">
    <span className="cq-celebra-anel" />
    <span className="cq-celebra-anel" data-eco="" />
    {FAISCAS.map((i) => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
    <span className="cq-celebra-selo"><QuestRune element={elemento} size={44} /></span>
  </span>;
}
