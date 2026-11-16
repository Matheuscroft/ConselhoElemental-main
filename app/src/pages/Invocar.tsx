import { RecurrenceEditor, type RecurrenceEditorValue } from '@/components/cycles/RecurrenceEditor';
import { dateFromInput, defaultRecurrenceConfig, validateRecurrence } from '@/lib/temporal/recurrence';
import { InvocationChoices, InvocationProgress, InvocationStepTitle, INVOCATION_TYPES } from '@/components/invocation/InvocationChoices';
import '@/styles/elemental-design-system.css';
import '@/components/invocation/invocation.css';
import '@/components/invocation/invocation-uau.css';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PassoInvocar } from '@/components/invocation/PassoInvocar';
import { CenaInvocar } from '@/components/invocation/CenaInvocar';
import { CreationResult } from '@/components/invocation/CreationResult';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS, EFFORT_LABELS } from '@/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ElementId } from '@/types';
import { isSupabaseAuthEnabled, supabase } from '@/lib/supabase';

export const Invocar: React.FC = () => {
  const accountId = useAppStore(state => state.currentAccountId);
  return <InvocationWorkspace key={accountId === null ? 'local' : `account:${accountId}`} accountId={accountId} />;
};

function InvocationWorkspace({ accountId }: { accountId: string | null }) {
  const navigate = useNavigate();
  const { addTask, addHabit, addQuest, addProject, addDraft } = useAppStore();
  
  const [{ step, direction }, setStepState] = useState({ step: 1, direction: 1 });
  const setStep = (next: number) => {
    cancelSuggestion();
    setCreationError('');
    setStepState(current => ({ step: next, direction: next > current.step ? 1 : -1 }));
  };
  const submitted = useRef(false);
  const [entityType, setEntityType] = useState<'ACTION' | 'HABIT' | 'QUEST' | 'PROJECT' | 'DRAFT'>('ACTION');
  
  // Common fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementId>('terra');
  const [selectedArea, setSelectedArea] = useState<string>('none');
  
  // Task specific
  const [effortLevel, setEffortLevel] = useState(2);
  const [plannedTime, setPlannedTime] = useState(30);
  
  // Habit specific
  const [schedule, setSchedule] = useState<RecurrenceEditorValue>(() => ({ type: 'DAILY', config: defaultRecurrenceConfig('DAILY', new Date()) }));
  
  // Quest/Project specific
  const [dueDate, setDueDate] = useState('');
  const [reward, setReward] = useState('');
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [creationError, setCreationError] = useState('');
  const [createdEntity, setCreatedEntity] = useState<{ type: string; title: string } | null>(null);
  const [aiMessage, setAiMessage] = useState('');
  const [aiConsent, setAiConsent] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const aiRequest = useRef<AbortController | null>(null);

  useEffect(() => () => {
    aiRequest.current?.abort();
    aiRequest.current = null;
  }, []);

  function cancelSuggestion() {
    if (!aiRequest.current) return;
    aiRequest.current.abort();
    aiRequest.current = null;
    setAiBusy(false);
    setAiStatus('Sugestão cancelada. Seu preenchimento foi mantido.');
  }

  const requestSuggestion = async () => {
    if (useAppStore.getState().currentAccountId !== accountId || aiRequest.current || !aiConsent || !aiMessage.trim() || aiMessage.length > 2000) return;
    if (!supabase || !isSupabaseAuthEnabled) {
      setAiStatus('A IA precisa de uma conta conectada. Você pode preencher o rascunho manualmente.');
      return;
    }
    const controller = new AbortController();
    aiRequest.current = controller;
    const isCurrent = () => aiRequest.current === controller && !controller.signal.aborted && useAppStore.getState().currentAccountId === accountId;
    setAiBusy(true);
    setAiStatus('');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!isCurrent()) return;
      if (sessionError || !session || session.user.is_anonymous) {
        setAiStatus('Entre na sua conta para pedir uma sugestão. O preenchimento manual continua disponível.');
        return;
      }
      const { data, error } = await supabase.functions.invoke('assistant-suggest', {
        body: { message: aiMessage.trim(), consent: true },
        headers: { Authorization: `Bearer ${session.access_token}` },
        signal: controller.signal, timeout: 30_000,
      });
      if (!isCurrent()) return;
      if (error) {
        const response = 'context' in error && error.context instanceof Response ? error.context : null;
        const status = response?.status;
        setAiStatus(status === 401 ? 'Sua sessão expirou. Entre novamente.'
          : status === 429 ? 'O limite de sugestões foi atingido. Tente mais tarde.'
          : status === 503 ? 'A IA ainda não está disponível. Preencha o rascunho manualmente.'
          : 'Não foi possível obter uma sugestão. Tente novamente ou preencha manualmente.');
        return;
      }
      const suggestion = data?.suggestion;
      if (!suggestion || typeof suggestion.title !== 'string' || !suggestion.title.trim() ||
        suggestion.title.length > 120 || typeof suggestion.description !== 'string' || suggestion.description.length > 1000) {
        setAiStatus('A sugestão veio incompleta. Preencha o rascunho manualmente.');
        return;
      }
      setTitle(suggestion.title.trim());
      setDescription(suggestion.description.trim());
      setAiStatus('Sugestão preenchida abaixo. Revise e edite antes de continuar; nada foi salvo.');
    } catch {
      if (isCurrent()) setAiStatus('Não foi possível obter uma sugestão. O preenchimento manual continua disponível.');
    } finally {
      if (aiRequest.current === controller) {
        aiRequest.current = null;
        setAiBusy(false);
      }
    }
  };

  const selectedType = INVOCATION_TYPES.find(type => type.id === entityType)!;

  const filteredAreas = AREAS.filter(area => area.elementId === selectedElement);

  const handleSubmit = () => {
    if (useAppStore.getState().currentAccountId !== accountId || submitted.current) return;
    if (!title.trim()) return;

    try {
      if (entityType === 'HABIT') validateRecurrence(schedule.type, schedule.config, new Date());
      if (dueDate && (entityType === 'ACTION' || entityType === 'QUEST' || entityType === 'PROJECT')) dateFromInput(dueDate);
    } catch (error) {
      setCreationError(error instanceof Error ? error.message : 'Confira a agenda.');
      return;
    }
    submitted.current = true;
    setCreationError('');
    try {
      let entity: { id: string; type: string; title: string } | null = null;

      switch (entityType) {
        case 'ACTION':
          const task = addTask({
            title: title.trim(),
            dueDate: dueDate || null,
            description: description.trim(),
            baseValue: 1,
            effortLevel,
            plannedTimeMinutes: plannedTime,
            areaPrimaryId: selectedArea === 'none' ? null : selectedArea,
            elementId: selectedElement,
          });
          entity = { id: task.id, type: 'Ritual', title: task.title };
          break;

        case 'HABIT':
          const habit = addHabit({
            name: title.trim(),
            description: description.trim(),
            areaId: selectedArea === 'none' ? filteredAreas[0].id : selectedArea,
            elementId: selectedElement,
            plannedTimeMinutes: plannedTime,
            plannedPoints: effortLevel * 5,
            recurrenceType: schedule.type,
            recurrenceConfig: schedule.config,
          });
          entity = { id: habit.id, type: 'Ciclo', title: habit.name };
          break;

        case 'QUEST':
          const quest = addQuest({
            title: title.trim(),
            description: description.trim(),
            areaId: selectedArea === 'none' ? filteredAreas[0].id : selectedArea,
            elementId: selectedElement,
            status: 'active',
            dueDate: dateFromInput(dueDate),
            reward: reward || undefined,
            xpBonus: 50,
          });
          entity = { id: quest.id, type: 'Jornada', title: quest.title };
          break;

        case 'PROJECT':
          const project = addProject({
            title: title.trim(),
            description: description.trim(),
            areaId: selectedArea === 'none' ? filteredAreas[0].id : selectedArea,
            elementId: selectedElement,
            status: 'active',
            dueDate: dateFromInput(dueDate),
            reward: reward || undefined,
            xpBonus: 100,
          });
          entity = { id: project.id, type: 'Grande Obra', title: project.title };
          break;

        case 'DRAFT':
          const draft = addDraft(title.trim(), description.trim());
          entity = { id: draft.id, type: 'Rascunho', title: draft.title };
          break;
      }

      const state = useAppStore.getState();
      const items = { ACTION: state.tasks, HABIT: state.habits, QUEST: state.quests, PROJECT: state.projects, DRAFT: state.drafts }[entityType];
      if (!entity?.id || !items.some(item => item.id === entity.id)) throw new Error('Creation not confirmed');
      setCreatedEntity(entity);
      setShowSuccess(true);
    } catch {
      submitted.current = false;
      setCreationError('Não foi possível confirmar a criação. Seus dados continuam preenchidos. Confira a lista de destino antes de tentar novamente.');
    }
  };

  // From the second step on, the room takes the colour of the element being shaped.
  const elementoDaCena = step > 1 && entityType !== 'DRAFT' ? selectedElement : null;

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return true;
    return false;
  };

  return (
    <AppLayout showBackButton title="Invocar">
      <CenaInvocar elemento={elementoDaCena}>
      <header className="ds-cabecalho inv-cabecalho"><h1>Invocar</h1><p>Dê forma ao seu próximo passo.</p></header>
      <InvocationProgress step={step} />

      {/* The one real pane of glass of this screen, with the room's light behind it. It stays while the steps change inside it. */}
      <div className="inv-altar">
      <div className="inv-altar-luz" aria-hidden="true" />
      <div className="inv-painel ds-glass-float" data-luz="">
      {/* Step 1: Type Selection */}
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        {step === 1 && (
          <PassoInvocar key="step1" direction={direction}>
            <InvocationStepTitle description="Escolha o formato que combina com sua intenção.">O que deseja invocar?</InvocationStepTitle>
            <InvocationChoices value={entityType} onChange={setEntityType} />
            <div className="ds-folha-pe invocation-pe" data-unico=""><button type="button" onClick={() => setStep(2)} className="ds-botao" data-tipo="primario">
              Continuar com {selectedType.name}
            </button></div>
          </PassoInvocar>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <PassoInvocar key="step2" direction={direction}>
            <InvocationStepTitle focus={false} description={`${selectedType.name}: comece pelo nome e acrescente o que fizer sentido.`}>Dê forma à sua intenção</InvocationStepTitle>

            {entityType === 'DRAFT' && (
              <section aria-labelledby="draft-ai-heading" className="invocation-ai">
                <div className="ds-secao" data-nivel="2"><h3 id="draft-ai-heading">Ajuda para escrever</h3></div>
                <p className="ds-nota">Descreva sua ideia para receber um título e uma descrição. Você revisa antes de salvar.</p>
                <label className="ds-campo" htmlFor="draft-ai-message"><span>Sua ideia</span>
                <textarea id="draft-ai-message" name="draftIdea" autoComplete="off" value={aiMessage} maxLength={2000} disabled={aiBusy}
                  onChange={e => setAiMessage(e.target.value)} placeholder="Ex.: organizar meus materiais de estudo" /></label>
                <label className="invocation-consent">
                  <input type="checkbox" checked={aiConsent} disabled={aiBusy}
                    onChange={e => setAiConsent(e.target.checked)} />
                  <span>Autorizo enviar apenas este texto à Cloudflare para gerar a sugestão.</span>
                </label>
                {!isSupabaseAuthEnabled && <p className="ds-nota">A IA precisa de uma conta conectada. Preencha o rascunho abaixo manualmente.</p>}
                <button type="button" onClick={requestSuggestion}
                  disabled={aiBusy || !aiConsent || !aiMessage.trim() || !isSupabaseAuthEnabled}
                  className="ds-botao" data-tipo="secundario">
                  {aiBusy ? 'Gerando sugestão…' : 'Sugerir título e descrição'}
                </button>
                {aiBusy && <button type="button" onClick={cancelSuggestion} className="ds-botao" data-tipo="fantasma">Cancelar sugestão</button>}
                <p role="status" aria-live="polite" className="ds-nota">{aiStatus}</p>
              </section>
            )}
            
            <label className="ds-campo" htmlFor="invocar-title">
              <span>Nome</span>
              <input
                id="invocar-title"
                placeholder="Nome do item..."
                value={title}
                disabled={aiBusy}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </label>

            <label className="ds-campo" htmlFor="invocar-description">
              <span>Descrição (opcional)</span>
              <textarea
                id="invocar-description"
                placeholder="Detalhes adicionais..."
                value={description}
                disabled={aiBusy}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            {entityType !== 'DRAFT' && (
              <>
                <div className="ds-campo">
                  <span id="invocar-element-label">Elemento</span>
                  <div className="invocation-elements" role="group" aria-labelledby="invocar-element-label">
                    {(Object.keys(ELEMENTS) as ElementId[]).map((id) => (
                      <div key={id} className="invocation-element" data-element={id}>
                        <button
                          type="button"
                          className="ds-selo"
                          aria-pressed={selectedElement === id}
                          aria-label={ELEMENTS[id].name}
                          onClick={() => {
                            setSelectedElement(id);
                            setSelectedArea('none');
                          }}
                        >
                          <ElementIcon element={id} size={20} tone="outline" />
                        </button>
                        <span aria-hidden="true">{ELEMENTS[id].name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ds-campo">
                  <span id="invocar-area-label">Área (opcional)</span>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger id="invocar-area" aria-labelledby="invocar-area-label" className="ds-campo-controle">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent className="ds-menu">
                      <SelectItem value="none">Sem categoria</SelectItem>
                      {filteredAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="ds-folha-pe invocation-pe">
              <button type="button" onClick={() => setStep(1)} className="ds-botao" data-tipo="secundario">
                Voltar
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={aiBusy || !canProceed()} className="ds-botao" data-tipo="primario">
                Continuar
              </button>
            </div>
          </PassoInvocar>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <PassoInvocar key="step3" direction={direction}>
            <InvocationStepTitle description="Ajuste os detalhes. O item será salvo ao confirmar.">Revise sua invocação</InvocationStepTitle>
            
            {/* Effort Level (for tasks and habits) */}
            {(entityType === 'ACTION' || entityType === 'HABIT') && (
              <div className="ds-campo">
                <span id="invocar-effort-label">Nível de esforço</span>
                <div className="ds-cifras invocation-effort" role="group" aria-labelledby="invocar-effort-label">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className="ds-cifra"
                      aria-pressed={effortLevel === level}
                      aria-label={`Esforço ${level}: ${EFFORT_LABELS[level].label}`}
                      onClick={() => setEffortLevel(level)}
                    >
                      {level}
                      <small>×{[1, 1.2, 1.5, 2, 2.8][level - 1]}</small>
                    </button>
                  ))}
                </div>
                <p className="ds-nota">
                  {EFFORT_LABELS[effortLevel].label}: {EFFORT_LABELS[effortLevel].description}
                </p>
              </div>
            )}
            
            {/* Time */}
            {(entityType === 'ACTION' || entityType === 'HABIT') && (
              <div className="ds-campo" data-sem-controle="">
                <label htmlFor="invocar-time" className="invocation-label">Tempo estimado</label>
                <div className="invocation-time">
                  <input
                    id="invocar-time"
                    type="range"
                    aria-valuetext={`${plannedTime} minutos`}
                    value={plannedTime}
                    onChange={event => setPlannedTime(Number(event.target.value))}
                    min={5}
                    max={120}
                    step={5}
                    className="invocation-time-range flex-1"
                  />
                  <span className="invocation-time-value">{plannedTime}min</span>
                </div>
              </div>
            )}
            
            {/* Recurrence for Habits */}
            {entityType === 'HABIT' && <RecurrenceEditor value={schedule} onChange={setSchedule} />}

            {/* Due date for Quests and Projects */}
            {(entityType === 'ACTION' || entityType === 'QUEST' || entityType === 'PROJECT') && (
              <label className="ds-campo" htmlFor="invocar-due">
                <span>{entityType === 'ACTION' ? 'Data planejada (opcional)' : 'Data limite (opcional)'}</span>
                <input
                  id="invocar-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </label>
            )}
            
            {/* Reward for Quests and Projects */}
            {(entityType === 'QUEST' || entityType === 'PROJECT') && (
              <label className="ds-campo" htmlFor="invocar-reward">
                <span>Recompensa (opcional)</span>
                <input
                  id="invocar-reward"
                  placeholder="Ex: Um dia de descanso..."
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              </label>
            )}
            
            {/* Summary */}
            <section className="invocation-review" aria-labelledby="invocation-review-heading" data-element={entityType === 'DRAFT' ? undefined : selectedElement}>
              <div className="ds-secao" data-nivel="2"><h3 id="invocation-review-heading">Sua invocação</h3></div>
              {entityType !== 'DRAFT' && <><p className="invocation-review-name">{title.trim()}</p>{description.trim() && <p className="ds-nota whitespace-pre-wrap">{description.trim()}</p>}</>}
              <dl>
                <div className="ds-linha" data-densa>
                  <dt>Tipo</dt>
                  <dd>{entityType === 'ACTION' ? 'Ritual' : entityType === 'HABIT' ? 'Ciclo' : entityType === 'QUEST' ? 'Jornada' : entityType === 'PROJECT' ? 'Grande Obra' : 'Rascunho'}</dd>
                </div>
                {entityType === 'DRAFT' && (
                  <>
                    <div className="ds-linha" data-densa>
                      <dt>Nome</dt>
                      <dd data-bloco="">{title.trim()}</dd>
                    </div>
                    <div className="ds-linha" data-densa>
                      <dt>Descrição</dt>
                      <dd data-bloco="">{description.trim() || 'Sem descrição.'}</dd>
                    </div>
                  </>
                )}
                {entityType !== 'DRAFT' && (
                  <>
                    <div className="ds-linha" data-densa>
                      <dt>Elemento</dt>
                      <dd><ElementIcon element={selectedElement} size={16} /> {ELEMENTS[selectedElement].name}</dd>
                    </div>
                    <div className="ds-linha" data-densa>
                      <dt>Pontos</dt>
                      <dd data-ouro="">
                        {entityType === 'ACTION'
                          ? `+${(1 * [1, 1.2, 1.5, 2, 2.8][effortLevel - 1]).toFixed(1)}`
                          : entityType === 'HABIT'
                            ? `+${effortLevel * 5} por dia`
                            : 'Agrega + bônus XP'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
              {entityType === 'DRAFT' && (
                <p className="ds-nota">
                  Nada foi salvo. Confirme em Invocar para salvar este rascunho ou volte para editar.
                </p>
              )}
            </section>
            
            {creationError && <p role="alert" className="invocation-erro">{creationError}</p>}
            <div className="ds-folha-pe invocation-pe">
              <button type="button" onClick={() => setStep(2)} className="ds-botao" data-tipo="secundario">
                Voltar
              </button>
              <button type="button" onClick={handleSubmit} disabled={!title.trim()} className="ds-botao" data-tipo="primario">
                <ArcaneIcon name="invocar" size={18} />
                Invocar
              </button>
            </div>
          </PassoInvocar>
        )}
      </AnimatePresence>
      </div>
      </div>
      </CenaInvocar>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={open => { if (!open) navigate('/santuario'); }}>
        <DialogContent className="ds-folha elemental-system invocation-success" data-element={entityType === 'DRAFT' ? undefined : selectedElement} aria-describedby="invocation-success-description">
          <DialogHeader>
            <DialogTitle>
              Invocação criada
            </DialogTitle>
          </DialogHeader>
          {createdEntity && <CreationResult type={entityType} title={createdEntity.title} elemento={entityType === 'DRAFT' ? null : selectedElement} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};
