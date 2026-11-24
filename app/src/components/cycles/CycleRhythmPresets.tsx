import type { RecurrenceEditorValue } from './RecurrenceEditor';

const TODOS = [0, 1, 2, 3, 4, 5, 6];
const ATALHOS: ReadonlyArray<{ rotulo: string; valor: RecurrenceEditorValue }> = [
  { rotulo: 'Todo dia', valor: { type: 'DAILY', config: { daysOfWeek: TODOS } } },
  { rotulo: 'Dias úteis', valor: { type: 'WEEKLY', config: { daysOfWeek: [1, 2, 3, 4, 5] } } },
  { rotulo: 'Fim de semana', valor: { type: 'WEEKLY', config: { daysOfWeek: [0, 6] } } },
];

const mesmoDias = (a?: number[], b?: number[]) => Boolean(a && b && a.length === b.length && [...a].sort().join() === [...b].sort().join());

/** One-tap rhythms above the full schedule editor, which stays for anything custom. Controlled: it only proposes a value. */
export function CycleRhythmPresets({ value, onChange }: { value: RecurrenceEditorValue; onChange: (next: RecurrenceEditorValue) => void }) {
  const ativo = (a: RecurrenceEditorValue) => (value.type === 'DAILY' || value.type === 'WEEKLY')
    && (a.type === 'DAILY' ? (value.type === 'DAILY' || mesmoDias(value.config.daysOfWeek, TODOS)) && !value.config.until : value.type === 'WEEKLY' && mesmoDias(value.config.daysOfWeek, a.config.daysOfWeek));
  return <div className="cycle-ritmo" role="group" aria-label="Ritmos rápidos">
    {ATALHOS.map((a) => <button key={a.rotulo} type="button" aria-pressed={ativo(a.valor)} onClick={() => onChange(a.valor)}>{a.rotulo}</button>)}
  </div>;
}
