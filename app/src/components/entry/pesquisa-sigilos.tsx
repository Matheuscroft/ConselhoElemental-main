import type { ComponentType } from 'react';
import type { SanctuaryCityId } from '@/lib/temporal/sanctuary-city';

/**
 * One small line drawing of the sky each city looks at. Drawn with the card's
 * own colour (`currentColor`), so a chosen city lights its sigil and an unchosen
 * one stays quiet. Decorative: the city's name is the label.
 */
const TRACO = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function Recife() {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" focusable="false">
      <circle cx="86" cy="24" r="9" fill="currentColor" opacity="0.9" />
      <path {...TRACO} opacity="0.5" d="M96 24h14M62 24h14M86 4v8" />
      <path {...TRACO} d="M8 36h104" />
      <path {...TRACO} d="M18 36q10 16 20 0M46 36q10 16 20 0M74 36q10 16 20 0" />
      <path {...TRACO} opacity="0.7" d="M4 56q7-5 14 0t14 0t14 0t14 0t14 0t14 0t14 0t14 0" />
    </svg>
  );
}

function Olinda() {
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        opacity="0.9"
        d="M28 14a10 10 0 1 0 10 13a8.4 8.4 0 1 1-10-13z"
      />
      <path {...TRACO} d="M70 52V26h12v26M70 26l6-11l6 11M76 15V8M73 11h6" />
      <path {...TRACO} opacity="0.75" d="M4 54q20-18 40-6t40-4q20-6 32 6" />
      <path {...TRACO} opacity="0.45" d="M4 60h112" />
    </svg>
  );
}

const SIGILOS: Record<SanctuaryCityId, ComponentType> = {
  recife: Recife,
  olinda: Olinda,
};

export function SigiloDaCidade({ cidade }: { readonly cidade: SanctuaryCityId }) {
  const Sigilo = SIGILOS[cidade];
  return <Sigilo />;
}
