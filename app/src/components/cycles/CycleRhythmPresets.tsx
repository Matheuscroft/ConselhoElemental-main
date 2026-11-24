import type { RecurrenceEditorValue } from './RecurrenceEditor';

const TODOS = [0, 1, 2, 3, 4, 5, 6];
export const ATALHOS: ReadonlyArray<{ rotulo: string; valor: RecurrenceEditorValue }> = [
  { rotulo: 'Todo dia', valor: { type: 'DAILY', config: { daysOfWeek: TODOS } } },
  { rotulo: 'Dias úteis', valor: { type: 'WEEKLY', config: { daysOfWeek: [1, 2, 3, 4, 5] } } },
  { rotulo: 'Sáb e dom', valor: { type: 'WEEKLY', config: { daysOfWeek: [0, 6] } } },
];

export const mesmoDias = (a?: number[], b?: number[]) => Boolean(a && b && a.length === b.length && [...a].sort().join() === [...b].sort().join());

/** One-tap rhythms above the full schedule editor, which stays for anything custom. Controlled: it only proposes a value. */
/** Whether `value` is exactly the rhythm `a` proposes. */
export const ritmoAtivo = (value: RecurrenceEditorValue, a: RecurrenceEditorValue) => (value.type === 'DAILY' || value.type === 'WEEKLY')
  && (a.type === 'DAILY' ? (value.type === 'DAILY' || mesmoDias(value.config.daysOfWeek, TODOS)) && !value.config.until : value.type === 'WEEKLY' && mesmoDias(value.config.daysOfWeek, a.config.daysOfWeek));

export function CycleRhythmPresets({ value, onChange }: { value: RecurrenceEditorValue; onChange: (next: RecurrenceEditorValue) => void }) {
  const ativo = (a: RecurrenceEditorValue) => ritmoAtivo(value, a);
  return <div className="cycle-ritmo" role="group" aria-label="Ritmos rápidos">
    {ATALHOS.map((a) => <button key={a.rotulo} type="button" aria-pressed={ativo(a.valor)} onClick={() => onChange(a.valor)}>{a.rotulo}</button>)}
  </div>;
}
