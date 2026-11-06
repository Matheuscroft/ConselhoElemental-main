import { RecurrenceEditor, type RecurrenceEditorValue } from '@/components/cycles/RecurrenceEditor';
import { dateFromInput, defaultRecurrenceConfig, validateRecurrence } from '@/lib/temporal/recurrence';
import { InvocationChoices, InvocationProgress, InvocationStepTitle, INVOCATION_TYPES } from '@/components/invocation/InvocationChoices';
import '@/styles/elemental-design-system.css';
import '@/components/invocation/invocation.css';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CreationStep } from '@/components/motion/CreationStep';
import { CreationResult } from '@/components/invocation/CreationResult';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS, EFFORT_LABELS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
            areaId: selectedArea === 'none' ? AREAS[0].id : selectedArea,
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
            areaId: selectedArea === 'none' ? AREAS[0].id : selectedArea,
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
            areaId: selectedArea === 'none' ? AREAS[0].id : selectedArea,
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

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return true;
    return false;
  };

  return (
    <AppLayout showBackButton title="Invocar">
      <div className="elemental-system invocation">
      <header className="invocation-heading"><ArcaneIcon name="invocar" size={48} /><div><h1>Invocar</h1><p>Dê forma ao seu próximo passo.</p></div></header>
      <InvocationProgress step={step} />

      {/* Step 1: Type Selection */}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 1 && (
          <CreationStep key="step1" direction={direction}>
            <InvocationStepTitle description="Escolha o formato que combina com sua intenção.">O que deseja invocar?</InvocationStepTitle>
            <InvocationChoices value={entityType} onChange={setEntityType} />
            <div className="invocation-actions"><Button onClick={() => setStep(2)} className="elemental-press elemental-action">
              Continuar com {selectedType.name}<ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button></div>
          </CreationStep>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <CreationStep key="step2" direction={direction}>
            <InvocationStepTitle focus={false} description={`${selectedType.name}: comece pelo nome e acrescente o que fizer sentido.`}>Dê forma à sua intenção</InvocationStepTitle>

            {entityType === 'DRAFT' && (
              <section aria-labelledby="draft-ai-heading" className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <h4 id="draft-ai-heading" className="font-mystic">Ajuda para escrever</h4>
                <p className="text-sm text-white/70">Descreva sua ideia para receber um título e uma descrição. Você revisa antes de salvar.</p>
                <Label htmlFor="draft-ai-message">Sua ideia</Label>
                <Textarea id="draft-ai-message" name="draftIdea" autoComplete="off" value={aiMessage} maxLength={2000} disabled={aiBusy}
                  onChange={e => setAiMessage(e.target.value)} placeholder="Ex.: organizar meus materiais de estudo"
                  className="bg-white/5 border-white/10" />
                <label className="flex items-start gap-2 text-sm text-white/70">
                  <input type="checkbox" checked={aiConsent} disabled={aiBusy}
                    onChange={e => setAiConsent(e.target.checked)} className="mt-1 shrink-0 accent-mystic-arcane focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mystic-gold" />
                  <span>Autorizo enviar apenas este texto à Cloudflare para gerar a sugestão.</span>
                </label>
                {!isSupabaseAuthEnabled && <p className="text-sm text-white/70">A IA precisa de uma conta conectada. Preencha o rascunho abaixo manualmente.</p>}
                <Button type="button" onClick={requestSuggestion}
                  disabled={aiBusy || !aiConsent || !aiMessage.trim() || !isSupabaseAuthEnabled}
                  className="w-full bg-mystic-arcane">
                  {aiBusy ? 'Gerando sugestão…' : 'Sugerir título e descrição'}
                </Button>
                {aiBusy && <Button type="button" variant="outline" onClick={cancelSuggestion} className="elemental-action elemental-action-secondary">Cancelar sugestão</Button>}
                <p role="status" aria-live="polite" className="text-sm text-white/70">{aiStatus}</p>
              </section>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="invocar-title">Nome</Label>
              <Input
                id="invocar-title"
                placeholder="Nome do item..."
                value={title}
                disabled={aiBusy}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invocar-description">Descrição (opcional)</Label>
              <Textarea
                id="invocar-description"
                placeholder="Detalhes adicionais..."
                value={description}
                disabled={aiBusy}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border-white/10 min-h-[80px]"
              />
            </div>
            
            {entityType !== 'DRAFT' && (
              <>
                <div className="space-y-2">
                  <Label id="invocar-element-label">Elemento</Label>
                  <div className="invocation-elements grid grid-cols-4 gap-2" role="group" aria-labelledby="invocar-element-label">
                    {(Object.keys(ELEMENTS) as ElementId[]).map((id) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={selectedElement === id}
                        style={{ '--invocation-element': `var(--element-${id})` } as React.CSSProperties}
                        onClick={() => {
                          setSelectedElement(id);
                          setSelectedArea('none');
                        }}
                        className={`p-3 rounded-xl border transition-colors ${
                          selectedElement === id
                            ? 'border-mystic-gold bg-mystic-gold/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <ElementIcon element={id} size={28} />
                        <span>{ELEMENTS[id].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invocar-area">Área (opcional)</Label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger id="invocar-area" className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent className="bg-mystic-purple border-white/10">
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
            
            <div className="invocation-actions">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="elemental-press elemental-action elemental-action-secondary"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={aiBusy || !canProceed()}
                className="elemental-press elemental-action"
              >
                Continuar
              </Button>
            </div>
          </CreationStep>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <CreationStep key="step3" direction={direction}>
            <InvocationStepTitle description="Ajuste os detalhes. O item será salvo ao confirmar.">Revise sua invocação</InvocationStepTitle>
            
            {/* Effort Level (for tasks and habits) */}
            {(entityType === 'ACTION' || entityType === 'HABIT') && (
              <div className="space-y-2">
                <Label id="invocar-effort-label">Nível de esforço</Label>
                <div className="flex gap-2" role="group" aria-labelledby="invocar-effort-label">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={effortLevel === level}
                      aria-label={`Esforço ${level}: ${EFFORT_LABELS[level].label}`}
                      onClick={() => setEffortLevel(level)}
                      className={`flex-1 p-2 rounded-lg border transition-colors ${
                        effortLevel === level
                          ? 'border-mystic-gold bg-mystic-gold/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-lg font-bold">{level}</div>
                      <div className="text-[10px] text-white/50">
                        ×{[1, 1.2, 1.5, 2, 2.8][level - 1]}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/50">
                  {EFFORT_LABELS[effortLevel].label}: {EFFORT_LABELS[effortLevel].description}
                </p>
              </div>
            )}
            
            {/* Time */}
            {(entityType === 'ACTION' || entityType === 'HABIT') && (
              <div className="space-y-2">
                <Label htmlFor="invocar-time">Tempo estimado</Label>
                <div className="flex items-center gap-4">
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
                  <Badge variant="outline" className="min-w-[70px] text-center">
                    {plannedTime}min
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Recurrence for Habits */}
            {entityType === 'HABIT' && <RecurrenceEditor value={schedule} onChange={setSchedule} />}

            {/* Due date for Quests and Projects */}
            {(entityType === 'ACTION' || entityType === 'QUEST' || entityType === 'PROJECT') && (
              <div className="space-y-2">
                <Label htmlFor="invocar-due">{entityType === 'ACTION' ? 'Data planejada (opcional)' : 'Data limite (opcional)'}</Label>
                <Input
                  id="invocar-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            )}
            
            {/* Reward for Quests and Projects */}
            {(entityType === 'QUEST' || entityType === 'PROJECT') && (
              <div className="space-y-2">
                <Label htmlFor="invocar-reward">Recompensa (opcional)</Label>
                <Input
                  id="invocar-reward"
                  placeholder="Ex: Um dia de descanso..."
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
            )}
            
            {/* Summary */}
            <section className="invocation-review space-y-2" aria-labelledby="invocation-review-heading">
              <h3 id="invocation-review-heading">Sua invocação</h3>
              {entityType !== 'DRAFT' && <><p className="invocation-review-name">{title.trim()}</p>{description.trim() && <p className="text-sm whitespace-pre-wrap">{description.trim()}</p>}</>}
              <div className="text-sm">
                <span className="text-white/50">Tipo:</span>{' '}
                {entityType === 'ACTION' ? 'Ritual' : entityType === 'HABIT' ? 'Ciclo' : entityType === 'QUEST' ? 'Jornada' : entityType === 'PROJECT' ? 'Grande Obra' : 'Rascunho'}
              </div>
              {entityType === 'DRAFT' && (
                <>
                  <div className="text-sm break-words">
                    <span className="text-white/50">Nome:</span>{' '}
                    {title.trim()}
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    <span className="text-white/50">Descrição:</span>{' '}
                    {description.trim() || 'Sem descrição.'}
                  </div>
                  <p className="text-sm text-white/70">
                    Nada foi salvo. Confirme em Invocar para salvar este rascunho ou volte para editar.
                  </p>
                </>
              )}
              {entityType !== 'DRAFT' && (
                <>
                  <div className="text-sm">
                    <span className="text-white/50">Elemento:</span>{' '}
                    <ElementIcon element={selectedElement} /> {ELEMENTS[selectedElement].name}
                  </div>
                  <div className="text-sm">
                    <span className="text-white/50">Pontos:</span>{' '}
                    <span className="text-mystic-gold">
                      {entityType === 'ACTION' 
                        ? `+${(1 * [1, 1.2, 1.5, 2, 2.8][effortLevel - 1]).toFixed(1)}`
                        : entityType === 'HABIT'
                          ? `+${effortLevel * 5} por dia`
                          : 'Agrega + bônus XP'}
                    </span>
                  </div>
                </>
              )}
            </section>
            
            {creationError && <p role="alert">{creationError}</p>}
            <div className="invocation-actions">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="elemental-press elemental-action elemental-action-secondary"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="elemental-press elemental-action"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Invocar
              </Button>
            </div>
          </CreationStep>
        )}
      </AnimatePresence>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={open => { if (!open) navigate('/santuario'); }}>
        <DialogContent className="elemental-system invocation-success" aria-describedby="invocation-success-description">
          <DialogHeader>
            <DialogTitle className="font-mystic text-xl">
              Invocação criada
            </DialogTitle>
          </DialogHeader>
          {createdEntity && <CreationResult type={entityType} title={createdEntity.title} />}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};
