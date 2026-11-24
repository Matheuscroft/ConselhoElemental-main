import { useState, type CSSProperties, type ReactNode } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ELEMENTS } from '@/constants';
import { ACENTO, type ElementoId } from '@/lib/design/palette';

/** Each suggestion also knows where it belongs, so one tap fills the name and the element/category. */
export const SUGESTOES: ReadonlyArray<{ texto: string; areaId: string }> = [
  { texto: 'Ler 20 minutos', areaId: 'area-leitura' },
  { texto: 'Treinar', areaId: 'area-saude' },
  { texto: 'Meditar', areaId: 'area-emocoes' },
  { texto: 'Beber água', areaId: 'area-nutricao' },
  { texto: 'Estudar', areaId: 'area-estudos' },
];
const WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export function CycleWeekdays({ days, onToggle }: { days: number[]; onToggle: (day: number) => void }) {
  return <fieldset className="cycle-weekdays"><legend>Quando faz parte da sua rotina?</legend>
    <div>{WEEK.map((label, day) => <button key={day} type="button" aria-label={label} aria-pressed={days.includes(day)} disabled={days.length === 1 && days.includes(day)} onClick={() => onToggle(day)}><span>{label.slice(0, 3)}</span><span aria-hidden="true">{days.includes(day) ? '•' : '–'}</span></button>)}</div>
    <p aria-live="polite"><strong>{days.length === 7 ? 'Todos os dias' : [...days].sort((a, b) => a - b).map(day => WEEK[day].slice(0, 3)).join(' · ')}</strong> Mantenha pelo menos um dia selecionado.</p>
  </fieldset>;
}

/** The element's art, or the cycle mark when there is none (or the image fails). A child so the form itself stays hook-free. */
function OrbeDoCiclo({ elemento }: { elemento: ElementoId | null }) {
  const [falhou, setFalhou] = useState(false);
  return elemento && !falhou
    ? <img src={`/sanctuary/elements/${elemento}-v1.webp`} alt="" width={56} height={56} onError={() => setFalhou(true)} />
    : <ArcaneIcon name="ciclo" size={34} />;
}

/** Controlled composer. It never creates, persists, or calculates a cycle. It only reflects, live, what was chosen. */
export function CycleCreationForm({ kind, name, onNameChange, days, onToggleDay, startLabel, agendaResumo, onSubmit, onCancel, children, agenda, elemento = null, categoriaNome, onSugestao }: {
  kind: 'cycle' | 'sequence'; name: string; onNameChange: (name: string) => void;
  days?: number[]; onToggleDay?: (day: number) => void; startLabel: string; agendaResumo?: string;
  onSubmit: () => void; onCancel: () => void; children?: ReactNode; agenda?: ReactNode;
  /** The element chosen so far: tints the whole form and the preview. */
  elemento?: ElementoId | null;
  categoriaNome?: string;
  /** A suggestion was tapped: the owner may also pre-fill element and category. Without it, only the name is filled. */
  onSugestao?: (sugestao: { texto: string; areaId: string }) => void;
}) {
  const sequence = kind === 'sequence';
  const titulo = name.trim() || (sequence ? 'Sua nova sequência' : 'Seu novo ciclo');
  const resumo = !name.trim() ? '' : [name.trim(), elemento ? ELEMENTS[elemento].name : '', categoriaNome ?? '', agendaResumo ?? ''].filter(Boolean).join(' · ');
  const estilo = { '--cc-acento': elemento ? ACENTO[elemento] : 'rgb(var(--el-gold))' } as CSSProperties;
  return <form className="cycle-composer" data-elemento={elemento ?? undefined} style={estilo} onSubmit={event => { event.preventDefault(); if (name.trim()) onSubmit(); }}>
    <div className="cycle-composer-preview" data-pronto={Boolean(name.trim())}>
      <span key={elemento ?? 'ciclo'} className="cc-orbe"><OrbeDoCiclo elemento={elemento} /></span>
      <div>
        <small>{elemento ? <>{ELEMENTS[elemento].name}{categoriaNome ? ` · ${categoriaNome}` : ''}</> : sequence ? 'Um ciclo por vez' : 'Uma atividade que se repete'}</small>
        <strong>{titulo}</strong>
        <p>A partir de {startLabel}{agendaResumo ? <> · <b>{agendaResumo}</b></> : null}</p>
      </div>
    </div>
    <label className="cycle-composer-name">{sequence ? 'Nome da sequência' : 'O que você quer praticar?'}<input autoFocus required value={name} onChange={event => onNameChange(event.target.value)} placeholder={sequence ? 'Ex.: Alternar treino A e B' : 'Ex.: Ler por 20 minutos'} /></label>
    {!sequence && !name.trim() ? <div className="cycle-composer-sugestoes" role="group" aria-label="Sugestões de ciclo">{SUGESTOES.map(item => <button key={item.texto} type="button" onClick={() => { if (onSugestao) onSugestao(item); else onNameChange(item.texto); }}>{item.texto}</button>)}</div> : null}
    {children}
    <div className="cycle-composer-agenda">{agenda ?? (days && onToggleDay ? <CycleWeekdays days={days} onToggle={onToggleDay} /> : null)}</div>
    <details className="cycle-composer-ajuda"><summary>Como funciona?</summary><p className="cycle-composer-help">{sequence ? 'Alterna um ciclo por data programada. Concluir hoje deixa o próximo para o próximo dia da agenda. Para atividades que você quer fazer no mesmo dia, crie ciclos separados.' : 'Cada data programada tem sua própria conclusão. Use subitens para etapas fixas e o contador do cartão para somar repetições ou qualquer medida que você escolher.'}</p></details>
    <footer>
      <p className="cc-resumo" aria-live="polite">{resumo || (sequence ? 'Dê um nome para criar a sequência' : 'Dê um nome para conjurar o ciclo')}</p>
      <button type="button" onClick={onCancel}>Cancelar</button><button type="submit" disabled={!name.trim()}>{sequence ? 'Criar sequência' : 'Conjurar ciclo'}</button>
    </footer>
  </form>;
}
