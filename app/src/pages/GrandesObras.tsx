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
  Building2, 
  CheckCircle2, 
  Layers, 
  Calendar,
  Gift,
  Flag
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
import type { Project, ElementId } from '@/types';

export const GrandesObras: React.FC = () => {
  const { currentAccountId, projects, addProject, addMissionToProject } = useAppStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddMission, setShowAddMission] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  const getElementIcon = (elementId: ElementId) => <QuestRune element={elementId} size={24} />;

  // Open project detail
  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setShowDetail(true);
  };

  // Add mission to project
  const handleAddMission = () => {
    if (!selectedProject || !newMissionTitle.trim()) return;
    
    addMissionToProject(selectedProject.id, {
      title: newMissionTitle.trim(),
      elementId: selectedProject.elementId,
      areaId: selectedProject.areaId,
    });
    
    setNewMissionTitle('');
    setShowAddMission(false);
    
    // Refresh project data
    const updatedProject = projects.find(p => p.id === selectedProject.id);
    if (updatedProject) {
      setSelectedProject(updatedProject);
    }
  };

  // Create new project
  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    
    addProject({ title: newProjectTitle.trim() });
    
    setNewProjectTitle('');
    setShowCreateProject(false);
  };

  return (
    <AppLayout>
      <MotionConfig reducedMotion="user"><div className="quest-catalog">
      <header className="quest-catalog-heading">
        <div><h1>Grandes Obras</h1><p>Projetos maiores, organizados em fases, jornadas e ações.</p><span>{activeProjects.length} ativas · {completedProjects.length} concluídas</span></div>
        <div className="quest-catalog-actions"><QuestComposer key={currentAccountId ?? 'local'} initialKind="project" triggerLabel="Nova Grande Obra" onCreated={key => navigate(trailHref(key))} /><button type="button" className="quest-text-button" onClick={() => setShowCreateProject(true)}>Criar só com nome</button></div>
      </header>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="quest-catalog-summary grid grid-cols-3 gap-3 mb-6"
      >
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-mystic-gold">{projects.length}</div>
          <div className="text-[10px] text-white/50">Total</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{activeProjects.length}</div>
          <div className="text-[10px] text-white/50">Ativas</div>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="text-2xl font-bold text-mystic-arcane">
            {projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1)}%
          </div>
          <div className="text-[10px] text-white/50">Média</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="quest-catalog-tabs grid w-full grid-cols-3">
          <TabsTrigger value="active" className="data-[state=active]:bg-mystic-arcane">
            <Building2 className="w-4 h-4 mr-1" />
            Ativas
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-mystic-arcane">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Concluídas
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-mystic-arcane">
            <Layers className="w-4 h-4 mr-1" />
            Arquivadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <ProjectList 
            projects={activeProjects} 
            onSelect={openProjectDetail}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <ProjectList 
            projects={completedProjects} 
            completed
            onSelect={openProjectDetail}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          <ProjectList 
            projects={archivedProjects} 
            archived
            onSelect={openProjectDetail}
          />
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="quest-dialog quest-catalog-detail" aria-labelledby="project-detail-title" aria-describedby="project-detail-description">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="text-center">
                  <div className="quest-catalog-rune"><QuestRune element={selectedProject.elementId} size={64} /></div>
                  <DialogTitle id="project-detail-title" className="font-mystic text-xl">
                    {selectedProject.title}
                  </DialogTitle>
                  <DialogDescription id="project-detail-description">Consulte a composição e abra a trilha para continuar.</DialogDescription>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 p-4">
                {/* Description */}
                <Link className="quest-primary w-full mb-4" to={trailHref(`project:${selectedProject.id}`)}><ArcaneIcon name="jornada" size={20} />Explorar trilha de quests</Link>
                {selectedProject.description && (
                  <p className="text-sm text-white/70 text-center">
                    {selectedProject.description}
                  </p>
                )}
                
                {/* Info badges */}
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedProject.areaId && (
                    <Badge variant="outline" className="bg-white/5">
                      {getAreaById(selectedProject.areaId)?.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/5">
                    {getElementIcon(selectedProject.elementId)}
                    <span className="ml-1">{ELEMENTS[selectedProject.elementId].name}</span>
                  </Badge>
                  {selectedProject.dueDate && (
                    <Badge variant="outline" className="bg-white/5">
                      <Calendar className="w-3 h-3 mr-1" />
                      Até {new Date(selectedProject.dueDate).toLocaleDateString('pt-BR')}
                    </Badge>
                  )}
                </div>
                
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Progresso Geral</span>
                    <span className="text-mystic-gold">{selectedProject.progress}%</span>
                  </div>
                  <Progress value={selectedProject.progress} className="h-2" />
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold">{selectedProject.missions.length}</div>
                    <div className="text-[10px] text-white/50">Campanhas</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold">{selectedProject.quests.length}</div>
                    <div className="text-[10px] text-white/50">Jornadas</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold">{selectedProject.tasks.length}</div>
                    <div className="text-[10px] text-white/50">Rituais</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold">{selectedProject.habits.length}</div>
                    <div className="text-[10px] text-white/50">Ciclos</div>
                  </div>
                </div>
                
                {/* Missions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-mystic text-sm">Campanhas</h4>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="quest-secondary"
                      onClick={() => setShowAddMission(true)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  {showAddMission && (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newMissionTitle}
                        onChange={(e) => setNewMissionTitle(e.target.value)}
                        aria-label="Nome da campanha"
                        placeholder="Nome da campanha..."
                        className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddMission();
                          if (e.key === 'Escape') setShowAddMission(false);
                        }}
                      />
                      <Button size="sm" className="quest-primary" aria-label="Adicionar campanha" onClick={handleAddMission}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {selectedProject.missions.map((mission) => (
                      <div 
                        key={mission.id}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          mission.isCompleted ? 'bg-mystic-gold/10' : 'bg-white/5'
                        }`}
                      >
                        <Flag className={`w-4 h-4 ${mission.isCompleted ? 'text-mystic-gold' : 'text-white/30'}`} />
                        <span className={`text-sm flex-1 ${mission.isCompleted ? 'line-through text-white/50' : ''}`}>
                          {mission.title}
                        </span>
                        <div className="h-1.5 w-16 bg-black/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-mystic-arcane rounded-full"
                            style={{ width: `${mission.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {selectedProject.missions.length === 0 && (
                      <p className="text-xs text-white/30 text-center py-2">
                        Nenhuma campanha ainda
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Reward */}
                {selectedProject.reward && (
                  <div className="p-3 rounded-xl bg-mystic-gold/10 border border-mystic-gold/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Gift className="w-4 h-4 text-mystic-gold" />
                      <span className="text-sm font-medium text-mystic-gold">Recompensa</span>
                    </div>
                    <p className="text-sm text-white/70">{selectedProject.reward}</p>
                  </div>
                )}
                
                {/* XP Bonus */}
                {selectedProject.xpBonus > 0 && (
                  <div className="text-center">
                    <Badge className="bg-mystic-arcane/20 text-mystic-arcane">
                      +{selectedProject.xpBonus} XP ao completar
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="quest-dialog quest-quick-create" aria-labelledby="project-quick-title" aria-describedby="project-quick-description">
          <DialogHeader>
            <DialogTitle id="project-quick-title" className="font-mystic">Nova Grande Obra</DialogTitle>
            <DialogDescription id="project-quick-description">Comece pelo nome. Você pode organizar as etapas depois.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              aria-label="Nome da Grande Obra"
              placeholder="Nome da Grande Obra..."
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-mystic-arcane"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateProject();
                if (e.key === 'Escape') setShowCreateProject(false);
              }}
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateProject(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateProject}
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

interface ProjectListProps {
  projects: Project[];
  completed?: boolean;
  archived?: boolean;
  onSelect: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, completed, archived, onSelect }) => {
  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="text-4xl mb-3"><ArcaneIcon name={archived ? 'arquivo' : completed ? 'conquista' : 'obra'} /></div>
        <h3 className="font-mystic text-lg mb-2">
          {archived ? 'Nenhuma obra arquivada' : completed ? 'Nenhuma obra concluída' : 'Nenhuma obra ativa'}
        </h3>
        <p className="text-white/50 text-sm">
          {archived 
            ? 'Projetos arquivados aparecerão aqui.' 
            : completed 
              ? 'Complete projetos para vê-los aqui.'
              : 'Comece um novo projeto para organizar suas metas!'}
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <div className="space-y-4">
        {projects.map((project, index) => (
          <ProjectCard 
            key={project.id} 
            project={project}
            index={index}
            completed={completed}
            archived={archived}
            onClick={() => onSelect(project)}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};

interface ProjectCardProps {
  project: Project;
  index: number;
  completed?: boolean;
  archived?: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, completed, archived, onClick }) => {
  const area = project.areaId ? getAreaById(project.areaId) : null;
  const totalItems = project.missions.length + project.quests.length + project.tasks.length + project.habits.length;
  return <article className="quest-catalog-card"><ShowcaseCard title={project.title} description={project.description} element={project.elementId}
    status={archived ? 'Obra arquivada' : completed ? 'Obra concluída' : 'Obra em andamento'} progress={project.progress}
    chips={[...(area ? [area.name] : []), `${totalItems} itens`, ...(project.missions.length ? [`${project.missions.length} campanhas`] : [])]}
    reward={project.reward} onOpen={onClick} /><Link className="quest-catalog-open" to={trailHref(`project:${project.id}`)} aria-label={`Abrir trilha de ${project.title}`}><ArcaneIcon name="jornada" size={20} />{archived || completed ? 'Consultar trilha' : 'Abrir trilha'}<span aria-hidden="true">→</span></Link></article>;
};
