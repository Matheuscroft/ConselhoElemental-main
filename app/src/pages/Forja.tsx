import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ForgeFeedback, type ForgeFeedbackValue } from '@/components/forge/ForgeFeedback';
import { Check, Search, X } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ForgeDraftCard } from '@/components/forge/ForgeDraftCard';
import { INVOCATION_TYPES, type InvocationType } from '@/components/invocation/InvocationChoices';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import '@/styles/elemental-design-system.css';
import '@/components/forge/forge.css';

type Classification = Exclude<InvocationType, 'DRAFT'>;
const TYPES = INVOCATION_TYPES.filter(type => type.id !== 'DRAFT');

export function Forja() {
  const accountId = useAppStore(state => state.currentAccountId);
  return <AppLayout><ForgeWorkspace key={accountId === null ? 'local' : `account:${accountId}`} accountId={accountId} /></AppLayout>;
}

/** Account-keyed UI state. Commands and conversion defaults remain in the existing store. */
function ForgeWorkspace({ accountId }: { accountId: string | null }) {
  const drafts = useAppStore(state => state.drafts);
  const addDraft = useAppStore(state => state.addDraft);
  const updateDraft = useAppStore(state => state.updateDraft);
  const deleteDraft = useAppStore(state => state.deleteDraft);
  const convertDraft = useAppStore(state => state.convertDraft);
  const reduceMotion = useMotionPreference();
  const titleInput = useRef<HTMLInputElement>(null);
  const feedbackRegion = useRef<HTMLDivElement>(null);
  const dialogOrigin = useRef<HTMLElement | null>(null);
  const dialogCommitted = useRef(false);
  const captured = useRef(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ mode: 'classify' | 'edit' | 'delete'; id: string } | null>(null);
  const selectedDraft = drafts.find(draft => draft.id === dialog?.id);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [classification, setClassification] = useState<Classification | null>(null);
  const [feedback, setFeedback] = useState<ForgeFeedbackValue | null>(null);
  const [error, setError] = useState('');
  const [captureError, setCaptureError] = useState('');
  const query = search.trim().toLocaleLowerCase('pt-BR');
  const visibleDrafts = drafts.filter(draft => `${draft.title} ${draft.notes ?? ''}`.toLocaleLowerCase('pt-BR').includes(query));
  const selectedType = TYPES.find(type => type.id === classification);

  function openDialog(mode: 'classify' | 'edit' | 'delete', id: string) {
    const draft = drafts.find(item => item.id === id);
    if (!draft) return;
    dialogOrigin.current = mode === 'classify' ? document.activeElement as HTMLElement : document.getElementById(`forge-options-${id}`);
    dialogCommitted.current = false;
    setDialog({ mode, id });
    setClassification(null);
    setEditTitle(draft.title);
    setEditNotes(draft.notes ?? '');
    setError('');
  }

  function createDraft() {
    if (useAppStore.getState().currentAccountId !== accountId) return;
    if (!title.trim() || captured.current) return;
    setCaptureError('');
    setFeedback(null);
    try {
      const draft = addDraft(title.trim(), notes.trim());
      if (!draft?.id || !useAppStore.getState().drafts.some(item => item.id === draft.id)) throw new Error('Draft not confirmed');
    } catch {
      setCaptureError('Não foi possível confirmar que a ideia foi guardada. Seu texto continua aqui. Confira a lista antes de tentar novamente.');
      return;
    }
    captured.current = true;
    setTitle(''); setNotes(''); setSearch('');
    setFeedback({ title: title.trim(), message: 'Ideia guardada na Forja. Classifique quando estiver pronta.' });
    titleInput.current?.focus();
  }

  function saveEdit() {
    if (useAppStore.getState().currentAccountId !== accountId) return;
    if (!selectedDraft || !editTitle.trim() || dialogCommitted.current) return;
    setError('');
    setFeedback(null);
    try {
      updateDraft(selectedDraft.id, { title: editTitle.trim(), notes: editNotes.trim() });
      const saved = useAppStore.getState().drafts.find(item => item.id === selectedDraft.id);
      if (!saved || saved.title !== editTitle.trim() || saved.notes !== editNotes.trim()) throw new Error('Edit not confirmed');
    } catch {
      setError('Não foi possível confirmar as alterações. Seu texto foi mantido para você conferir e tentar novamente.');
      return;
    }
    setDialog(null);
    dialogCommitted.current = true;
    setFeedback({ title: editTitle.trim(), message: 'Alterações da ideia salvas.' });
  }

  function classifyDraft() {
    if (useAppStore.getState().currentAccountId !== accountId) return;
    if (!selectedDraft || !classification || dialogCommitted.current) return;
    setError('');
    setFeedback(null);
    try {
      const id = convertDraft(selectedDraft.id, classification);
      const state = useAppStore.getState();
      const items = { ACTION: state.tasks, HABIT: state.habits, QUEST: state.quests, PROJECT: state.projects }[classification];
      if (!id || state.drafts.some(item => item.id === selectedDraft.id) || !items.some(item => item.id === id)) throw new Error('Conversion not confirmed');
    } catch {
      setError('Não foi possível confirmar a classificação. Confira a lista de atividades do formato escolhido antes de tentar novamente.');
      return;
    }
    dialogCommitted.current = true;
    setFeedback({ title: selectedDraft.title, message: `Ideia transformada em ${selectedType?.name}. O rascunho saiu da Forja.`, destination: classification });
    setDialog(null);
  }

  function removeDraft() {
    if (useAppStore.getState().currentAccountId !== accountId) return;
    if (!selectedDraft || dialogCommitted.current) return;
    setError('');
    setFeedback(null);
    try {
      deleteDraft(selectedDraft.id);
      if (useAppStore.getState().drafts.some(item => item.id === selectedDraft.id)) throw new Error('Deletion not confirmed');
    } catch {
      setError('Não foi possível confirmar a exclusão. Confira a lista de ideias antes de tentar novamente.');
      return;
    }
    setDialog(null);
    dialogCommitted.current = true;
    setFeedback({ title: selectedDraft.title, message: 'Rascunho excluído da Forja.' });
  }

  return <div className="elemental-system forge-workspace">
    <header className="forge-heading">
      <span className="forge-emblem" aria-hidden="true"><ArcaneIcon name="forja" size={42} /></span>
      <div><h1>Forja</h1><p>Toda conquista começa com uma ideia.</p></div>
    </header>
    <div className="forge-layout">
      <section className="forge-capture" aria-labelledby="forge-capture-heading">
        <h2 id="forge-capture-heading">Guarde a próxima ideia</h2>
        <p>Capture agora. Escolha o caminho depois.</p>
        <form onSubmit={event => { event.preventDefault(); createDraft(); }}>
          <Label htmlFor="forge-title">Sua ideia</Label>
          <Input ref={titleInput} id="forge-title" value={title} onChange={event => { captured.current = false; setTitle(event.target.value); }} placeholder="O que você quer tirar do papel?" required />
          <details className="forge-notes-input"><summary>Acrescentar anotações <span>(opcional)</span></summary>
            <Label className="sr-only" htmlFor="forge-notes">Anotações da ideia</Label>
            <Textarea id="forge-notes" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Contexto, referências ou um primeiro passo…" rows={4} />
          </details>
          {captureError && <p role="alert">{captureError}</p>}
          <Button type="submit" className="elemental-press elemental-action" disabled={!title.trim()}><ArcaneIcon name="forja" size={20} />Guardar ideia</Button>
          <small>Rascunhos não geram pontos. Você decide quando transformá-los.</small>
        </form>
      </section>

      <section className="forge-inbox" aria-labelledby="forge-inbox-heading">
        <div className="forge-inbox-heading"><h2 id="forge-inbox-heading">Ideias por lapidar</h2><span>{drafts.length} {drafts.length === 1 ? 'rascunho' : 'rascunhos'}</span></div>
        <div ref={feedbackRegion} tabIndex={-1} className="forge-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback && <>
          <ForgeFeedback value={feedback} />
          <button type="button" onClick={() => { setFeedback(null); titleInput.current?.focus(); }} aria-label="Dispensar mensagem"><X size={18} /></button>
        </>}</div>
        {error && !selectedDraft && <p role="alert">{error}</p>}
        {(drafts.length > 0 || search) && <div className="forge-search">
          <Search size={18} aria-hidden="true" /><Input type="search" aria-label="Buscar ideias por nome ou anotação" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar nas ideias…" />
          {search && <button type="button" onClick={() => setSearch('')}>Limpar</button>}
        </div>}
        {query && <p className="forge-result-count">{visibleDrafts.length} de {drafts.length} rascunhos encontrados</p>}
        {visibleDrafts.length ? <div className="forge-drafts">{visibleDrafts.map(draft => <ForgeDraftCard key={draft.id} draft={draft}
          onClassify={id => openDialog('classify', id)} onEdit={id => openDialog('edit', id)} onDelete={id => openDialog('delete', id)} />)}</div>
          : <div className="forge-empty"><ArcaneIcon name={query ? 'grimorio' : 'forja'} size={40} />
            <h3>{query ? 'Nenhuma ideia encontrada' : 'Um espaço para o que ainda vai nascer'}</h3>
            <p>{query ? 'Tente outra palavra ou limpe a busca para ver todos os rascunhos.' : 'Guarde pensamentos, planos e possibilidades. Você não precisa organizar tudo agora.'}</p>
            <button type="button" className="elemental-press elemental-action elemental-action-secondary" onClick={() => query ? setSearch('') : titleInput.current?.focus()}>{query ? 'Limpar busca' : 'Escrever minha primeira ideia'}</button>
          </div>}
      </section>
    </div>

    <section className="forge-guide" aria-labelledby="forge-guide-heading"><h2 id="forge-guide-heading">Quando a ideia ganhar forma</h2>
      <p>Classifique pelo que ela representa. Os detalhes continuam no espaço de cada atividade.</p>
      <ul>{TYPES.map(type => <li key={type.id}><ArcaneIcon name={type.icon} size={24} /><div><strong>{type.name}</strong><span>{type.description}</span></div></li>)}</ul>
    </section>

    <Dialog open={!!dialog && !!selectedDraft} onOpenChange={open => { if (!open) setDialog(null); }}>
      <DialogContent onCloseAutoFocus={event => {
        event.preventDefault();
        const target = dialogCommitted.current ? feedbackRegion.current : dialogOrigin.current;
        (target?.isConnected ? target : titleInput.current)?.focus();
      }} className="elemental-system forge-dialog" aria-labelledby="forge-dialog-title" aria-describedby="forge-dialog-description">
        <DialogHeader><DialogTitle id="forge-dialog-title">{dialog?.mode === 'edit' ? 'Lapidar ideia' : dialog?.mode === 'delete' ? 'Excluir rascunho?' : 'Dê um caminho à ideia'}</DialogTitle>
          <DialogDescription id="forge-dialog-description">{dialog?.mode === 'edit' ? 'Atualize o nome e as anotações. A ideia continua na Forja.' : dialog?.mode === 'delete' ? 'Esta ação remove o rascunho. Confira o nome antes de confirmar.' : 'Escolha um formato e confirme. O rascunho será substituído pela atividade criada.'}</DialogDescription>
        </DialogHeader>
        {error && <p role="alert">{error}</p>}
        {selectedDraft && dialog?.mode === 'edit' ? <form className="forge-edit" onSubmit={event => { event.preventDefault(); saveEdit(); }}>
          <Label htmlFor="forge-edit-title">Nome da ideia</Label><Input id="forge-edit-title" value={editTitle} onChange={event => setEditTitle(event.target.value)} autoFocus required />
          <Label htmlFor="forge-edit-notes">Anotações</Label><Textarea id="forge-edit-notes" value={editNotes} onChange={event => setEditNotes(event.target.value)} rows={5} />
          <div className="forge-dialog-actions"><Button type="button" className="elemental-press elemental-action elemental-action-secondary" onClick={() => setDialog(null)}>Cancelar</Button><Button type="submit" className="elemental-press elemental-action" disabled={!editTitle.trim()}>Salvar alterações</Button></div>
        </form> : selectedDraft && <>
          <div className="forge-selected-draft"><ArcaneIcon name="grimorio" size={24} /><strong>{selectedDraft.title}</strong></div>
          {dialog?.mode === 'classify' && <fieldset className="forge-types"><legend className="sr-only">Formato da atividade</legend>
            {TYPES.map(type => <label key={type.id}><input type="radio" name="forge-type" value={type.id} checked={classification === type.id} onChange={() => setClassification(type.id)} />
              <span><ArcaneIcon name={type.icon} size={27} /><span><strong>{type.name}</strong><small>{type.description}</small></span><Check size={18} className="forge-type-check" aria-hidden="true" /></span>
            </label>)}
          </fieldset>}
          <div className="forge-dialog-actions"><Button type="button" className="elemental-press elemental-action elemental-action-secondary" onClick={() => setDialog(null)}>Cancelar</Button>
            <Button type="button" className={`elemental-press elemental-action ${dialog?.mode === 'delete' ? 'forge-danger' : ''}`} disabled={dialog?.mode === 'classify' && !classification} onClick={dialog?.mode === 'delete' ? removeDraft : classifyDraft}>
              {dialog?.mode === 'delete' ? 'Excluir rascunho' : selectedType ? `Criar ${selectedType.name}` : 'Escolha o formato'}
            </Button></div>
        </>}
        {dialog?.mode === 'classify' && <motion.div key={classification} className="forge-type-hint" initial={{ opacity: reduceMotion ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0 : .16 }}>{selectedType?.example ?? 'Você pode cancelar e decidir depois.'}</motion.div>}
      </DialogContent>
    </Dialog>
  </div>;
}
