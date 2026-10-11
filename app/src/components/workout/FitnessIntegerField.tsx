import { ChevronDown, ChevronUp } from 'lucide-react';

interface FitnessIntegerFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

/** Mantém o campo vazio durante a edição e normaliza zeros à esquerda. */
export function FitnessIntegerField({ label, value, onChange }: FitnessIntegerFieldProps) {
  const step = (delta: number) => onChange(Math.max(1, (value ?? 0) + delta));
  return <label className="block space-y-1 text-xs text-fitness-muted">{label}
    <span className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-fitness-canvas focus-within:ring-2 focus-within:ring-fitness-primary">
      <input type="text" inputMode="numeric" pattern="[1-9][0-9]*" required role="spinbutton" aria-valuemin={1} aria-valuenow={value} aria-label={label} value={value == null ? '' : String(value)}
        className="min-w-0 flex-1 bg-transparent px-3 text-base text-fitness-text outline-none"
        onChange={(event) => { const next = event.target.value; if (!/^\d*$/.test(next)) return; onChange(next === '' ? undefined : Number(next)); }}
        onKeyDown={(event) => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); step(event.key === 'ArrowUp' ? 1 : -1); } }} />
      <span className="flex w-10 shrink-0 flex-col border-l border-white/10">
        <button type="button" aria-label={`Aumentar ${label}`} className="grid flex-1 place-items-center text-fitness-primary hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fitness-primary" onClick={() => step(1)}><ChevronUp size={16} /></button>
        <button type="button" aria-label={`Diminuir ${label}`} disabled={value != null && value <= 1} className="grid flex-1 place-items-center text-fitness-primary hover:bg-white/5 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fitness-primary" onClick={() => step(-1)}><ChevronDown size={16} /></button>
      </span>
    </span>
  </label>;
}
