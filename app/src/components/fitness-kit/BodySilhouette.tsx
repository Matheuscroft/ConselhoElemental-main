import React from 'react';

/** Manequim decorativo do kit Fitness; não simula o corpo ou as medidas da pessoa. */
export const BodySilhouette: React.FC<{ className?: string }> = ({ className }) => (
  <img
    data-body-figure
    src="/fitness/body/mannequin-front-v1.png"
    width={912}
    height={1724}
    alt=""
    aria-hidden="true"
    draggable={false}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);
