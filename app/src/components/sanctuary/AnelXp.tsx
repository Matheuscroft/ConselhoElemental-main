import { useId } from 'react';
import './anel-xp.css';

const ANEL = 'M100 2A98 14 0 1 1 100 30A98 14 0 1 1 100 2';
/** How much of the ring the travelling glint covers. */
const BRILHO = 0.07;
/** The bright point at the tip of the fill. */
const PONTA = 0.012;

/**
 * The XP bar, drawn as the ring engraved at the character's feet. The HUD at
 * the top is the instrument that announces the number; this is the scene, so it
 * is hidden from assistive tech rather than read out twice.
 *
 * The path starts at twelve o'clock and runs clockwise, normalised to a length
 * of 1, so the fill is a single dash offset and never needs to measure.
 *
 * The glint travels the whole ring but is seen only through the fill: a mask
 * drawn with the same dash keeps it from lighting XP the person has not
 * earned.
 */
export function AnelXp({ fracao }: { fracao: number }) {
  const preenchido = Number.isFinite(fracao) ? Math.min(1, Math.max(0, fracao)) : 0;
  const mascara = `anel-xp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className="anel-xp" viewBox="0 0 200 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <mask id={mascara} maskUnits="userSpaceOnUse" x={-4} y={-4} width={208} height={40}>
          <path className="anel-xp-recorte" pathLength={1} d={ANEL}
            strokeDasharray="1 1" strokeDashoffset={1 - preenchido} />
        </mask>
      </defs>
      <path className="anel-xp-trilho" pathLength={1} d={`${ANEL}Z`} />
      <path className="anel-xp-fio" pathLength={1} d={ANEL}
        strokeDasharray="1 1" strokeDashoffset={1 - preenchido} />
      <g mask={`url(#${mascara})`}>
        <path className="anel-xp-brilho" pathLength={1} d={ANEL}
          strokeDasharray={`${BRILHO} ${1 - BRILHO}`} />
      </g>
      {preenchido > PONTA ? (
        <path className="anel-xp-ponta" pathLength={1} d={ANEL}
          strokeDasharray={`${PONTA} ${1 - PONTA}`} strokeDashoffset={PONTA - preenchido} />
      ) : null}
      {/* Remounted whenever the fill changes, which is what replays its one pulse. */}
      <path key={preenchido.toFixed(4)} className="anel-xp-pulso" pathLength={1} d={`${ANEL}Z`} />
    </svg>
  );
}
