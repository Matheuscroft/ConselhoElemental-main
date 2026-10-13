import { FitnessIntegerField } from './FitnessIntegerField';

export function FitnessDurationField({ seconds, minutes, onChange }: { seconds?: number; minutes: boolean; onChange: (seconds?: number) => void }) {
  if (!minutes) return <FitnessIntegerField label="Duração (segundos)" value={seconds} onChange={onChange} />;
  return <label className="block space-y-1 text-xs text-fitness-muted">Tempo ativo (min)<input type="number" inputMode="decimal" min={1 / 60} step="any" required className="h-11 w-full rounded-xl border border-white/10 bg-fitness-canvas px-3 text-base text-fitness-text" value={seconds == null ? '' : Number((seconds / 60).toFixed(4))} onChange={(event) => onChange(event.target.value === '' ? undefined : Math.round(Number(event.target.value) * 60))} /></label>;
}
