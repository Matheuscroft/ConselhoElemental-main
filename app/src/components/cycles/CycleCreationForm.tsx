import type { ReactNode } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

const SUGESTOES = ['Ler 20 minutos', 'Treinar', 'Meditar', 'Beber água', 'Estudar'];
const WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export function CycleWeekdays({ days, onToggle }: { days: number[]; onToggle: (day: number) => void }) {
  return <fieldset className="cycle-weekdays"><legend>Quando faz parte da sua rotina?</legend>
    <div>{WEEK.map((label, day) => <button key={day} type="button" aria-label={label} aria-pressed={days.includes(day)} disabled={days.length === 1 && days.includes(day)} onClick={() => onToggle(day)}><span>{label.slice(0, 3)}</span><span aria-hidden="true">{days.includes(day) ? '•' : '–'}</span></button>)}</div>
    <p aria-live="polite"><strong>{days.length === 7 ? 'Todos os dias' : [...days].sort((a, b) => a - b).map(day => WEEK[day].slice(0, 3)).join(' · ')}</strong> Mantenha pelo menos um dia selecionado.</p>
  </fieldset>;
}

/** Controlled composer. It never creates, persists, or calculates a cycle. */
export function CycleCreationForm({ kind, name, onNameChange, days, onToggleDay, startLabel, agendaResumo, onSubmit, onCancel, children, agenda }: {
  kind: 'cycle' | 'sequence'; name: string; onNameChange: (name: string) => void;
  days?: number[]; onToggleDay?: (day: number) => void; startLabel: string; agendaResumo?: string;
  onSubmit: () => void; onCancel: () => void; children?: ReactNode; agenda?: ReactNode;
}) {
  const sequence = kind === 'sequence';
  return <form className="cycle-composer" onSubmit={event => { event.preventDefault(); if (name.trim()) onSubmit(); }}>
    <div className="cycle-composer-preview"><span><ArcaneIcon name="ciclo" size={34} /></span><div><small>{sequence ? 'Um ciclo por vez' : 'Uma atividade que se repete'}</small><strong>{name.trim() || (sequence ? 'Sua nova sequência' : 'Seu novo ciclo')}</strong><p>A partir de {startLabel}{agendaResumo ? <> · <b>{agendaResumo}</b></> : null}</p></div></div>
    <label className="cycle-composer-name">{sequence ? 'Nome da sequência' : 'O que você quer praticar?'}<input autoFocus required value={name} onChange={event => onNameChange(event.target.value)} placeholder={sequence ? 'Ex.: Alternar treino A e B' : 'Ex.: Ler por 20 minutos'} /></label>
    {!sequence && !name.trim() ? <div className="cycle-composer-sugestoes" role="group" aria-label="Sugestões de ciclo">{SUGESTOES.map(item => <button key={item} type="button" onClick={() => onNameChange(item)}>{item}</button>)}</div> : null}
    {children}
    <div className="cycle-composer-agenda">{agenda ?? (days && onToggleDay ? <CycleWeekdays days={days} onToggle={onToggleDay} /> : null)}</div>
    <details className="cycle-composer-ajuda"><summary>Como funciona?</summary><p className="cycle-composer-help">{sequence ? 'Alterna um ciclo por data programada. Concluir hoje deixa o próximo para o próximo dia da agenda. Para atividades que você quer fazer no mesmo dia, crie ciclos separados.' : 'Cada data programada tem sua própria conclusão. Use subitens para etapas fixas e o contador do cartão para somar repetições ou qualquer medida que você escolher.'}</p></details>
    <footer><button type="button" onClick={onCancel}>Cancelar</button><button type="submit" disabled={!name.trim()}>{sequence ? 'Criar sequência' : 'Criar ciclo'}</button></footer>
  </form>;
}
