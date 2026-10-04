/**
 * BodySilhouette — neutral, decorative human outline for the "Your body" card.
 */
import React from 'react';

interface BodySilhouetteProps {
  className?: string;
}

export const BodySilhouette: React.FC<BodySilhouetteProps> = ({ className }) => (
  <svg
    viewBox="0 0 100 220"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="50" cy="20" r="14" />
    <path d="M32 46h36c6 0 10 4 10 10v52l-8 2-2 46-4 52H46l-4-52-2-46-8-2V56c0-6 4-10 10-10z" opacity="0.9" />
    <path d="M22 60l-6 46M78 60l6 46" />
  </svg>
);
