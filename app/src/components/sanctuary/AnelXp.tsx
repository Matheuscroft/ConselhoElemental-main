import './anel-xp.css';

/**
 * The XP bar, drawn as the ring engraved at the character's feet. The HUD at
 * the top is the instrument that announces the number; this is the scene, so it
 * is hidden from assistive tech rather than read out twice.
 *
 * The path starts at twelve o'clock and runs clockwise, normalised to a length
 * of 1, so the fill is a single dash offset and never needs to measure.
 */
export function AnelXp({ fracao }: { fracao: number }) {
  const preenchido = Number.isFinite(fracao) ? Math.min(1, Math.max(0, fracao)) : 0;
  return (
    <svg className="anel-xp" viewBox="0 0 200 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="anel-xp-trilho" pathLength={1}
        d="M100 2A98 14 0 1 1 100 30A98 14 0 1 1 100 2Z" />
      <path className="anel-xp-fio" pathLength={1}
        d="M100 2A98 14 0 1 1 100 30A98 14 0 1 1 100 2"
        strokeDasharray="1 1" strokeDashoffset={1 - preenchido} />
    </svg>
  );
}
