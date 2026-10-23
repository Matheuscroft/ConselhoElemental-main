import { lunarDiscPath } from './lunar-presentation';

export function MoonDisc({ phaseAngle, waxing, south = false }: { phaseAngle: number; waxing: boolean; south?: boolean }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true" className="celestial-moon-disc">
    <g transform={`rotate(${south ? 180 : 0} 50 50)`}>
      <circle cx="50" cy="50" r="48" fill="#202633" stroke="#8993a544" strokeWidth=".5" />
      <path d={lunarDiscPath(phaseAngle)} fill="#d6d5cf" transform={waxing ? undefined : 'translate(100 0) scale(-1 1)'} />
    </g>
  </svg>;
}
