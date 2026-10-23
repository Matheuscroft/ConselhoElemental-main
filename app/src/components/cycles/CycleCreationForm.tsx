import type { ReactNode } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

const WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export function CycleWeekdays({ days, onToggle }: { days: number[]; onToggle: (day: number) => void }) {
  return <fieldset className="cycle-weekdays"><legend>Quando faz parte da sua rotina?</legend>
    <div>{WEEK.map((label, day) => <button key={day} type="button" aria-label={label} aria-pressed={days.includes(day)} disabled={days.length === 1 && days.includes(day)} onClick={() => onToggle(day)}><span>{label.slice(0, 3)}</span><span aria-hidden="true">{days.includes(day) ? '•' : '–'}</span></button>)}</div>
    <p>{days.length === 7 ? 'Todos os dias' : `${days.length} dias por semana`}. Mantenha pelo menos um dia selecionado.</p>
  </fieldset>;
}

/** Controlled composer. It never creates, persists, or calculates a cycle. */
export function CycleCreationForm({ kind, name, onNameChange, days, onToggleDay, startLabel, onSubmit, onCancel, children }: {
  kind: 'cycle' | 'sequence'; name: string; onNameChange: (name: string) => void;
  days: number[]; onToggleDay: (day: number) => void; startLabel: string;
  onSubmit: () => void; onCancel: () => void; children?: ReactNode;
}) {
  const sequence = kind === 'sequence';
  return <form className="cycle-composer" onSubmit={event => { event.preventDefault(); if (name.trim()) onSubmit(); }}>
    <div className="cycle-composer-preview"><span><ArcaneIcon name={sequence ? 'ciclo' : 'ritual'} size={34} /></span><div><small>{sequence ? 'Uma jornada de ciclos' : 'Um hábito, dia após dia'}</small><strong>{name.trim() || (sequence ? 'Sua nova sequência' : 'Seu novo ciclo')}</strong><p>A partir de {startLabel}</p></div></div>
    <label className="cycle-composer-name">{sequence ? 'Nome da sequência' : 'O que você quer praticar?'}<input autoFocus required value={name} onChange={event => onNameChange(event.target.value)} placeholder={sequence ? 'Ex.: Rotina da manhã' : 'Ex.: Ler por 20 minutos'} /></label>
    {children}
    <CycleWeekdays days={days} onToggle={onToggleDay} />
    <p className="cycle-composer-help">{sequence ? 'Depois de criar, abra os detalhes para adicionar ciclos e definir a ordem dos passos.' : 'Depois de criar, você pode ajustar os detalhes e adicionar subitens ao ciclo.'}</p>
    <footer><button type="button" onClick={onCancel}>Cancelar</button><button type="submit" disabled={!name.trim()}>{sequence ? 'Criar sequência' : 'Criar ciclo'}</button></footer>
  </form>;
}
