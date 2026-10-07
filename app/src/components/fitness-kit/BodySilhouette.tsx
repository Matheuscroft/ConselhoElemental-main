import React from 'react';

/** Silhueta neutra e genérica (sem traços pessoais, sem julgamento estético). */
export const BodySilhouette: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 220" aria-hidden="true" className={className} fill="#D4D4DA">
    <circle cx="50" cy="16" r="11" />
    <path d="M42 30h16l2 6c9 2 18 6 21 12l8 50c1 5-3 7-6 3l-5-28-3 22 4 36-6 2-4-26-6 78c0 4-3 6-6 6-4 0-6-2-6-6l-2-68h-1l-2 68c0 4-3 6-6 6-3 0-6-2-6-6l-6-78-4 26-6-2 4-36-3-22-5 28c-3 4-7 2-6-3l8-50c3-6 12-10 21-12z" />
  </svg>
);
