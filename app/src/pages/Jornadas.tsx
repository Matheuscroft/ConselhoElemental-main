import { AchievementCompletion } from '@/components/quests/AchievementCompletion';
import { QuestComposer } from '@/components/quests/QuestComposer';
import { QuestRune } from '@/components/quests/QuestRune';
import { Link, useNavigate } from 'react-router-dom';
import { buildQuestTrails, trailHref } from '@/components/quests/quest-path';
import '@/components/quests/quests.css';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ShowcaseCard } from '@/components/elemental/ShowcaseCard';
import { Medidor, MarcaElemento, Vazio } from '@/components/elemental/blocos';
import React, { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout';
import { useAppStore } from '@/stores/appStore';
import { getAreaById } from '@/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Quest } from '@/types';

export const Jornadas: React.FC = () => {
  const { currentAccountId, quests: storedQuests, projects, tasks, habits, addQuest } = useAppStore();
  const quests = useMemo(() => {
    const trails = buildQuestTrails({ quests: storedQuests, projects, tasks, habits });
    return storedQuests.map(q => {
      const trail = trails.find(t => t.kind === 'quest' && t.id === q.id)!;
      return { ...q, isCompleted: trail.completed, progress: trail.completed ? 100 : trail.total ? Math.round(100 * trail.done / trail.total) : 0,
        tasks: trail.steps.filter(s => s.kind === 'task').map(s => tasks.find(t => t.id === s.id) ?? q.tasks.find(t => t.id === s.id)).filter((t): t is NonNullable<typeof t> => !!t) };
    });
  }, [storedQuests, projects, tasks, habits]);
  const navigate = useNavigate();
  const [selection, setSelection] = useState<{ id: string; accountId: string | null } | null>(null);
  const selectedQuest = selection?.accountId === currentAccountId ? quests.find(q => q.id === selection.id) ?? null : null;
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateQuest, setShowCreateQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');

  const activeQuests = quests.filter(q => !q.isCompleted);
  const completedQuests = quests.filter(q => q.isCompleted);

  // Open quest detail
  const openQuestDetail = (quest: Quest) => {
    setSelection({ id: quest.id, accountId: currentAccountId });
    setShowDetail(true);
  };

  // Create new quest
  const handleCreateQuest = () => {
    if (!newQuestTitle.trim()) return;
    
    addQuest({ title: newQuestTitle.trim() });
    
    setNewQuestTitle('');
    setShowCreateQuest(false);
  };

  return (
    <AppLayout>
      <div className="quest-catalog">
        <header className="ds-cabecalho">
          <h1>Jornadas</h1>
          <p>Quests são conquistas intermediárias, organizadas em rituais.</p>
          <div className="ds-cabecalho-acao quest-catalog-actions">
            <QuestComposer key={currentAccountId ?? 'local'} initialKind="quest" triggerLabel="Nova Jornada" onCreated={key => navigate(trailHref(key))} />
            <button type="button" className="ds-botao" data-tipo="fantasma" onClick={() => setShowCreateQuest(true)}>Criar só com nome</button>
          </div>
        </header>

        <p className="ds-nota">Abra a trilha para escolher um ritual. Expanda o cartão para consultar detalhes e recompensas. {completedQuests.length} de {quests.length} jornadas completadas.</p>

        <div className="ds-secao">
          <h2>Ativas</h2>
          <span className="ds-contagem">{activeQuests.length}</span>
        </div>
        {activeQuests.length > 0 ? (
          <div>
            {activeQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} onClick={() => openQuestDetail(quest)} />
            ))}
          </div>
        ) : (
          <Vazio
            titulo="Nenhuma jornada ativa"
            texto="Comece uma nova jornada para desafiar-se!"
            acao={<button type="button" className="ds-botao" data-tipo="secundario" onClick={() => setShowCreateQuest(true)}><ArcaneIcon name="criar" size={18} />Criar só com nome</button>}
          />
        )}

        <details className="ds-grupo">
          <summary>
            <span>Selados</span>
            <small>({completedQuests.length})</small>
            <ArcaneIcon name="chevron" size={16} />
          </summary>
          {completedQuests.length > 0 ? (
            <div>
              {completedQuests.map(quest => (
                <QuestCard key={quest.id} quest={quest} completed onClick={() => openQuestDetail(quest)} />
              ))}
            </div>
          ) : (
            <Vazio compacto titulo="Nenhuma jornada concluída" texto="Complete jornadas para vê-las aqui." />
          )}
        </details>

        {/* Detalhe da jornada */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="ds-folha quest-dialog quest-catalog-detail" data-element={selectedQuest?.elementId} aria-labelledby="quest-detail-title" aria-describedby="quest-detail-description">
            {selectedQuest && (
              <>
                <DialogHeader>
                  <div className="quest-catalog-rune"><QuestRune element={selectedQuest.elementId} size={64} /></div>
                  <DialogTitle id="quest-detail-title">{selectedQuest.title}</DialogTitle>
                  <DialogDescription id="quest-detail-description">Consulte a composição e abra a trilha para continuar.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 pt-4">
                  <Link className="ds-botao w-full" data-tipo="primario" to={trailHref(`quest:${selectedQuest.id}`)}><ArcaneIcon name="jornada" size={20} />Explorar trilha de quests</Link>
                  {selectedQuest.description && <p className="ds-nota">{selectedQuest.description}</p>}

                  <div className="ds-meta">
                    <MarcaElemento elemento={selectedQuest.elementId} />
                    {selectedQuest.areaId && <span>{getAreaById(selectedQuest.areaId)?.name}</span>}
                    {selectedQuest.dueDate && <span>Até {new Date(selectedQuest.dueDate).toLocaleDateString('pt-BR')}</span>}
                  </div>

                  <div className="grid gap-2">
                    <div className="ds-secao" data-nivel="2" style={{ margin: 0 }}>
                      <h3>Progresso</h3>
                      <span className="ds-fracao">{selectedQuest.progress}%</span>
                    </div>
                    <Medidor valor={selectedQuest.progress / 100} espesso conquista={selectedQuest.isCompleted} rotulo={`Progresso de ${selectedQuest.title}`} />
                  </div>

                  {selectedQuest.tasks.length > 0 && (
                    <section>
                      <div className="ds-secao" data-nivel="2" style={{ marginTop: 0 }}><h3>Rituais</h3><span className="ds-contagem">{selectedQuest.tasks.length}</span></div>
                      <div>
                        {selectedQuest.tasks.map(task => (
                          <div key={task.id} className="ds-linha" data-densa="" data-estado={task.isCompleted ? 'selado' : undefined}>
                            <span>{task.title}</span>
                            <span className="ds-meta">{task.isCompleted ? 'Selado' : 'Pendente'}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedQuest.habits.length > 0 && (
                    <section>
                      <div className="ds-secao" data-nivel="2" style={{ marginTop: 0 }}><h3>Ciclos</h3><span className="ds-contagem">{selectedQuest.habits.length}</span></div>
                      <div>
                        {selectedQuest.habits.map(habit => (
                          <div key={habit.id} className="ds-linha" data-densa="">
                            <span>{(habit as any).name || habit.title}</span>
                            <span className="ds-linha-valor">{habit.streak}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {selectedQuest.reward && (
                    <div className="grid gap-2">
                      <span className="ds-marca" data-tom="ouro"><ArcaneIcon name="conquista" size={14} />Recompensa</span>
                      <p className="ds-nota">{selectedQuest.reward}</p>
                    </div>
                  )}

                  <AchievementCompletion kind="quest" id={selectedQuest.id} />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Criar só com nome */}
        <Dialog open={showCreateQuest} onOpenChange={setShowCreateQuest}>
          <DialogContent className="ds-folha quest-dialog quest-quick-create" aria-labelledby="quest-quick-title" aria-describedby="quest-quick-description">
            <DialogHeader>
              <DialogTitle id="quest-quick-title">Nova Jornada</DialogTitle>
              <DialogDescription id="quest-quick-description">Comece pelo nome. Você pode organizar as etapas depois.</DialogDescription>
            </DialogHeader>
            <label className="ds-campo my-4">
              <span>Nome da Jornada</span>
              <input
                type="text"
                value={newQuestTitle}
                onChange={(e) => setNewQuestTitle(e.target.value)}
                aria-label="Nome da Jornada"
                placeholder="Nome da Jornada..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateQuest();
                  if (e.key === 'Escape') setShowCreateQuest(false);
                }}
              />
            </label>
            <div className="ds-folha-pe">
              <button type="button" className="ds-botao" data-tipo="fantasma" onClick={() => setShowCreateQuest(false)}>Cancelar</button>
              <button type="button" className="ds-botao" data-tipo="primario" onClick={handleCreateQuest} disabled={!newQuestTitle.trim()}>Criar</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

interface QuestCardProps {
  quest: Quest;
  completed?: boolean;
  onClick?: () => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, completed, onClick }) => {
  const area = quest.areaId ? getAreaById(quest.areaId) : null;
  const totalItems = quest.tasks.length + quest.habits.length;
  const completedItems = quest.tasks.filter(t => t.isCompleted).length + quest.habits.filter(h => h.isCompleted).length;
  return <article className="quest-catalog-card"><ShowcaseCard title={quest.title} description={quest.description} element={quest.elementId}
    status={completed ? 'Jornada concluída' : 'Jornada em andamento'} progress={quest.progress}
    chips={[...(area ? [area.name] : []), `${completedItems}/${totalItems} itens`, ...(quest.dueDate ? [new Date(quest.dueDate).toLocaleDateString('pt-BR')] : [])]}
    reward={quest.reward} onOpen={onClick} /><Link className="ds-elo" to={trailHref(`quest:${quest.id}`)} aria-label={`Abrir trilha de ${quest.title}`}>{completed ? 'Consultar trilha' : 'Abrir trilha'}<ArcaneIcon name="chevron" size={16} /></Link></article>;
};
