import React, { useId } from 'react';

/** Figura decorativa neutra; não representa medidas ou características do usuário. */
export const BodySilhouette: React.FC<{ className?: string }> = ({ className }) => {
  const id = `body-tone-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 120 260" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9399AD" />
          <stop offset="38%" stopColor="#E2E3EC" />
          <stop offset="65%" stopColor="#C5C9D9" />
          <stop offset="100%" stopColor="#8C93A8" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="253" rx="25" ry="3" fill="#11141E" opacity=".35" />
      <g fill={`url(#${id})`} stroke="#CFD2DF" strokeWidth=".7" strokeLinejoin="round">
        <path d="M49 23c0-10 4-16 11-16s11 6 11 16l-1 9c-1 6-5 11-10 11s-9-5-10-11z" />
        <path d="M54 41v8c-4 5-15 5-23 11-5 4-7 11-9 20l-8 37-8 31c-2 6-1 13 2 15 2 1 3-3 3-6l3-8 1 9c1 3 3 2 3-1l1-14 11-31 9-26 2 22-4 31c-1 9 2 15 5 22l2 37 4 38-2 12c-1 4 3 6 10 5 4 0 5-2 4-5l-1-12 1-38 2-34h2l2 34 1 38-1 12c-1 3 0 5 4 5 7 1 11-1 10-5l-2-12 4-38 2-37c3-7 6-13 5-22l-4-31 2-22 9 26 11 31 1 14c0 3 2 4 3 1l1-9 3 8c0 3 1 7 3 6 3-2 4-9 2-15l-8-31-8-37c-2-9-4-16-9-20-8-6-19-6-23-11v-8" />
      </g>
      <g fill="none" stroke="#7E869D" strokeWidth="1" strokeLinecap="round" opacity=".45">
        <path d="M45 67q8-4 15 0 7-4 15 0M60 67v39M49 102q11 5 22 0M45 129q15 8 30 0M48 149l5 30-2 30M72 149l-5 30 2 30M32 79l-8 34M88 79l8 34" />
      </g>
    </svg>
  );
};
