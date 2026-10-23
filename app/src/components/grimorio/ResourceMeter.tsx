import type { ReactNode, CSSProperties } from 'react';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
export function ResourceMeter({ label, value, maximum, color, icon, note }: {
  label: string; value: number; maximum: number; color: string; icon: ReactNode; note?: string;
}) {
  const valid = Number.isFinite(value) && Number.isFinite(maximum) && maximum > 0;
  const percentage = valid ? Math.min(100, Math.max(0, value / maximum * 100)) : 0;
  return <div className="grimoire-meter" style={{ '--meter-color': color } as CSSProperties}>
    <div className="grimoire-meter-label"><span>{icon}{label}</span><strong>{valid ? format(value) : '—'}<small> / {valid ? format(maximum) : '—'}</small></strong></div>
    <div className="grimoire-meter-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={valid ? maximum : undefined} aria-valuenow={valid ? Math.min(maximum, Math.max(0, value)) : undefined} aria-valuetext={valid ? `${format(value)} de ${format(maximum)}` : 'Sem valor disponível'}><span style={{ width: `${percentage}%` }} /></div>
    {note && <p>{note}</p>}
  </div>;
}
