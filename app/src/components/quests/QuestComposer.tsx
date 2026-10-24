import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QuestRune } from './QuestRune';
import { useAppStore } from '@/stores/appStore';
import { createQuestPlan, validateQuestPlan, type QuestPlan } from './quest-commands';

export function QuestComposer({ onCreated, initialKind = 'quest', triggerLabel = 'Organizar conquista' }: { onCreated: (key: string) => void; initialKind?: QuestPlan['kind']; triggerLabel?: string }) {
  const accountId = useAppStore(state => state.currentAccountId);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<QuestPlan>({ kind: initialKind, title: '', element: 'terra', steps: [''], chapter: 'Primeiros passos' });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const issue = validateQuestPlan(plan);
    if (issue) { setError(issue); return; }
    try {
      const key = createQuestPlan(useAppStore.getState, accountId, plan);
      setOpen(false); setError('');
      setPlan({ kind: initialKind, title: '', element: 'terra', steps: [''], chapter: 'Primeiros passos' });
      onCreated(key);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível criar a trilha.'); }
  };
  return <Dialog open={open} onOpenChange={value => { setOpen(value); setError(''); }}>
    <DialogTrigger asChild><button type="button" className="quest-primary"><Plus size={18} aria-hidden="true" />{triggerLabel}</button></DialogTrigger>
    <DialogContent className="quest-dialog" showCloseButton={false} aria-labelledby="quest-create-title" aria-describedby="quest-create-description">
      <DialogHeader><DialogTitle id="quest-create-title">Desenhe sua próxima conquista</DialogTitle><DialogDescription id="quest-create-description">Transforme uma intenção em etapas que você pode realizar.</DialogDescription></DialogHeader>
      <DialogClose className="quest-dialog-close" aria-label="Fechar criação"><X size={20} /></DialogClose>
      <form onSubmit={submit} className="quest-form">
        <label>O que você quer conquistar?<input autoFocus required value={plan.title} onChange={e => setPlan({ ...plan, title: e.target.value })} placeholder="Ex.: Preparar minha primeira apresentação" /></label>
        <label>Organizar como<select value={plan.kind} onChange={e => setPlan({ ...plan, kind: e.target.value as QuestPlan['kind'] })}><option value="quest">Jornada — uma conquista com etapas</option><option value="project">Grande Obra — um projeto com capítulos</option></select></label>
        <fieldset><legend>Elemento da trilha</legend><div className="quest-element-choice">{(['terra', 'fogo', 'agua', 'ar'] as const).map(id => <label key={id}><input type="radio" name="quest-element" value={id} checked={plan.element === id} onChange={() => setPlan({ ...plan, element: id })} /><span><QuestRune element={id} size={38} />{id === 'agua' ? 'Água' : id[0].toUpperCase() + id.slice(1)}</span></label>)}</div></fieldset>
        {plan.kind === 'project' && <label>Primeiro capítulo<input required value={plan.chapter} onChange={e => setPlan({ ...plan, chapter: e.target.value })} /></label>}
        <fieldset className="quest-composer-steps"><legend>Rituais da conquista</legend><p>Cada etapa será um ritual: uma tarefa pontual. Hábitos com recorrência são organizados em Ciclos. Depois, ajuste áreas, duração e subetapas na lista de Rituais.</p>{plan.steps.map((title, index) => <div key={index}><label><span className="sr-only">Etapa {index + 1}</span><input required value={title} onChange={e => setPlan({ ...plan, steps: plan.steps.map((item, i) => i === index ? e.target.value : item) })} placeholder={`Etapa ${index + 1}`} /></label><button type="button" disabled={plan.steps.length === 1} aria-label={`Remover etapa ${index + 1}`} onClick={() => setPlan({ ...plan, steps: plan.steps.filter((_, i) => i !== index) })}><Trash2 size={18} /></button></div>)}<button type="button" className="quest-secondary" onClick={() => setPlan({ ...plan, steps: [...plan.steps, ''] })}><Plus size={17} />Adicionar etapa</button></fieldset>
        {error && <p className="quest-error" role="alert">{error}</p>}
        <div className="quest-form-footer"><DialogClose asChild><button type="button" className="quest-secondary">Cancelar</button></DialogClose><button type="submit" className="quest-primary">Criar minha trilha</button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
