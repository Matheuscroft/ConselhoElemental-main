import { QuestComposer } from '@/components/quests/QuestComposer';
import { QuestRune } from '@/components/quests/QuestRune';
import { Link, useNavigate } from 'react-router-dom';
import { trailHref } from '@/components/quests/quest-path';
import '@/components/quests/quests.css';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ShowcaseCard } from '@/components/elemental/ShowcaseCard';
import React, { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { 
  Plus, 
  Map, 
  Trophy, 
  Calendar,
  CheckCircle2,
  Circle,
  Gift
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { useAppStore } from '@/stores/appStore';
import { ELEMENTS, getAreaById } from '@/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Quest, ElementId } from '@/types';

export const Jornadas: React.FC = () => {
  const { currentAccountId, quests, addQuest } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreateQuest, setShowCreateQuest] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');

  const activeQuests = quests.filter(q => !q.isCompleted);
  const completedQuests = quests.filter(q => q.isCompleted);

  const filteredQuests = activeTab === 'active' ? activeQuests : completedQuests;

  const getElementIcon = (elementId: ElementId) => <QuestRune element={elementId} size={24} />;

  // Open quest detail
  const openQuestDetail = (quest: Quest) => {
    setSelectedQuest(quest);
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
      <MotionConfig reducedMotion="user"><div className="quest-catalog">
      <header className="quest-catalog-heading">
        <div><h1>Jornadas</h1><p>Quests são conquistas intermediárias, organizadas em rituais.</p><span>{activeQuests.length} ativas · {completedQuests.length} concluídas</span></div>
        <div className="quest-catalog-actions"><QuestComposer key={currentAccountId ?? 'local'} initialKind="quest" triggerLabel="Nova Jornada" onCreated={key => navigate(trailHref(key))} /><button type="button" className="quest-text-button" onClick={() => setShowCreateQuest(true)}>Criar só com nome</button></div>
      </header>

      <div className="quest-catalog-guide"><ArcaneIcon name="jornada" size={30} /><div><strong>Escolha a conquista que quer continuar</strong><p>Abra a trilha para escolher um ritual. Expanda o cartão para consultar detalhes e recompensas.</p><span>{completedQuests.length} de {quests.length} jornadas completadas</span></div></div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="quest-catalog-tabs grid w-full grid-cols-2">
          <TabsTrigger value="active" className="data-[state=active]:bg-mystic-arcane">
            <Map className="w-4 h-4 mr-1" />
            Ativas ({activeQuests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-mystic-arcane">
            <Trophy className="w-4 h-4 mr-1" />
            Concluídas ({completedQuests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <AnimatePresence mode="popLayout">
            {filteredQuests.length > 0 ? (
              <div className="space-y-4">
                {filteredQuests.map((quest, index) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest}
                    index={index}
                    onClick={() => openQuestDetail(quest)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="active" onCreate={() => setShowCreateQuest(true)} />
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <AnimatePresence mode="popLayout">
            {filteredQuests.length > 0 ? (
              <div className="space-y-4">
                {filteredQuests.map((quest, index) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest}
                    index={index}
                    completed
                    onClick={() => openQuestDetail(quest)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState type="completed" />
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Quest Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="quest-dialog quest-catalog-detail" aria-labelledby="quest-detail-title" aria-describedby="quest-detail-description">
          {selectedQuest && (
            <>
              <DialogHeader>
                <div className="text-center">
                  <div className="quest-catalog-rune"><QuestRune element={selectedQuest.elementId} size={64} /></div>
                  <DialogTitle id="quest-detail-title" className="font-mystic text-xl">
                    {selectedQuest.title}
                  </DialogTitle>
                  <DialogDescription id="quest-detail-description">Consulte a composição e abra a trilha para continuar.</DialogDescription>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 p-4">
                {/* Description */}
                <Link className="quest-primary w-full mb-4" to={trailHref(`quest:${selectedQuest.id}`)}><ArcaneIcon name="jornada" size={20} />Explorar trilha de quests</Link>
                {selectedQuest.description && (
                  <p className="text-sm text-white/70 text-center">
                    {selectedQuest.description}
                  </p>
                )}
                
                {/* Info badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedQuest.areaId && (
                    <Badge variant="outline" className="bg-white/5">
                      {getAreaById(selectedQuest.areaId)?.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/5">
                    {getElementIcon(selectedQuest.elementId)}
                    <span className="ml-1">{ELEMENTS[selectedQuest.elementId].name}</span>
                  </Badge>
                  {selectedQuest.dueDate && (
                    <Badge variant="outline" className="bg-white/5">
                      <Calendar className="w-3 h-3 mr-1" />
                      Até {new Date(selectedQuest.dueDate).toLocaleDateString('pt-BR')}
                    </Badge>
                  )}
                </div>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Progresso</span>
                    <span className="text-mystic-gold">{selectedQuest.progress}%</span>
                  </div>
                  <Progress value={selectedQuest.progress} className="h-2" />
                </div>
                
                {/* Tasks */}
                {selectedQuest.tasks.length > 0 && (
                  <div>
                    <h4 className="font-mystic text-sm mb-2">Rituais</h4>
                    <div className="space-y-2">
                      {selectedQuest.tasks.map((task) => (
                        <div 
                          key={task.id}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            task.isCompleted ? 'bg-mystic-gold/10' : 'bg-white/5'
                          }`}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-mystic-gold" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/30" />
                          )}
                          <span className={`text-sm ${task.isCompleted ? 'line-through text-white/50' : ''}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Habits */}
                {selectedQuest.habits.length > 0 && (
                  <div>
                    <h4 className="font-mystic text-sm mb-2">Ciclos</h4>
                    <div className="space-y-2">
                      {selectedQuest.habits.map((habit) => (
                        <div 
                          key={habit.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                        >
                          <div className="w-4 h-4 rounded-full bg-mystic-arcane/30 flex items-center justify-center">
                            <span className="text-[10px]">{habit.streak}</span>
                          </div>
                          <span className="text-sm">{(habit as any).name || habit.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Reward */}
                {selectedQuest.reward && (
                  <div className="p-3 rounded-xl bg-mystic-gold/10 border border-mystic-gold/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-mystic-gold" />
                      <span className="text-sm font-medium text-mystic-gold">Recompensa</span>
                    </div>
                    <p className="text-sm text-white/70">{selectedQuest.reward}</p>
                  </div>
                )}
                
                {/* XP Bonus */}
                {selectedQuest.xpBonus > 0 && (
                  <div className="text-center">
                    <Badge className="bg-mystic-arcane/20 text-mystic-arcane">
                      +{selectedQuest.xpBonus} XP ao completar
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Quest Dialog */}
      <Dialog open={showCreateQuest} onOpenChange={setShowCreateQuest}>
        <DialogContent className="quest-dialog quest-quick-create" aria-labelledby="quest-quick-title" aria-describedby="quest-quick-description">
          <DialogHeader>
            <DialogTitle id="quest-quick-title" className="font-mystic">Nova Jornada</DialogTitle>
            <DialogDescription id="quest-quick-description">Comece pelo nome. Você pode organizar as etapas depois.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <input
              type="text"
              value={newQuestTitle}
              onChange={(e) => setNewQuestTitle(e.target.value)}
              aria-label="Nome da Jornada"
              placeholder="Nome da Jornada..."
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-mystic-arcane"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateQuest();
                if (e.key === 'Escape') setShowCreateQuest(false);
              }}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateQuest(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateQuest}
                className="flex-1 bg-mystic-arcane hover:bg-mystic-arcane/80"
              >
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div></MotionConfig>
    </AppLayout>
  );
};

interface QuestCardProps {
  quest: Quest;
  index: number;
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
    reward={quest.reward} onOpen={onClick} /><Link className="quest-catalog-open" to={trailHref(`quest:${quest.id}`)} aria-label={`Abrir trilha de ${quest.title}`}><ArcaneIcon name="jornada" size={20} />{completed ? 'Consultar trilha' : 'Abrir trilha'}<span aria-hidden="true">→</span></Link></article>;
};

interface EmptyStateProps {
  type: 'active' | 'completed';
  onCreate?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onCreate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="glass-card p-8 text-center"
  >
    <div className="text-4xl mb-3"><ArcaneIcon name={type === 'active' ? 'jornada' : 'conquista'} /></div>
    <h3 className="font-mystic text-lg mb-2">
      {type === 'active' ? 'Nenhuma jornada ativa' : 'Nenhuma jornada concluída'}
    </h3>
    <p className="text-white/50 text-sm mb-4">
      {type === 'active' 
        ? 'Comece uma nova jornada para desafiar-se!' 
        : 'Complete jornadas para vê-las aqui.'}
    </p>
    {type === 'active' && onCreate && (
      <Button onClick={onCreate}>
        <Plus className="w-4 h-4 mr-2" />
        Criar só com nome
      </Button>
    )}
  </motion.div>
);
