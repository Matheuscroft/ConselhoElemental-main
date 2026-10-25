import { useId, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
interface Props {
  name: string; points: number; minutes: string;
  onName: (value: string) => void; onPoints: (value: number) => void; onMinutes: (value: string) => void;
  onAdd: () => void; onCancel: () => void;
}
/** Form presentation only. Creation and validation remain with the existing page command. */
export function CycleSubitemComposer({ name, points, minutes, onName, onPoints, onMinutes, onAdd, onCancel }: Props) {
  const id = useId();
  const submit = (event: FormEvent) => { event.preventDefault(); if (name.trim()) onAdd(); };
  return <form noValidate className="cycle-subitem-composer" aria-label="Adicionar subitem" onSubmit={submit} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onCancel(); } }}>
    <div className="cycle-composer-title"><strong>Novo subitem</strong><button type="button" aria-label="Cancelar novo subitem" onClick={onCancel}><X size={18} /></button></div>
    <label htmlFor={`${id}-name`}>O que você vai fazer?<input id={`${id}-name`} autoFocus value={name} onChange={event => onName(event.target.value)} placeholder="Nome do subitem" required /></label>
    <div className="cycle-composer-values"><label htmlFor={`${id}-points`}>Pontos previstos<input id={`${id}-points`} type="number" min={1} value={points} onChange={event => onPoints(Number(event.target.value))} /></label><label htmlFor={`${id}-minutes`}>Minutos previstos<input id={`${id}-minutes`} type="number" min={0} value={minutes} onChange={event => onMinutes(event.target.value)} placeholder="Opcional" /></label></div>
    <button className="cycle-composer-submit" type="submit" disabled={!name.trim()}><Plus size={18} />Adicionar subitem</button>
  </form>;
}
