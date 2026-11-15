import { AchievementCompletion } from '@/components/quests/AchievementCompletion';
import { ProjectChapters } from '@/components/quests/ProjectChapters';
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
import type { Project } from '@/types';

export const GrandesObras: React.FC = () => {
  const { currentAccountId, projects: storedProjects, tasks, habits, quests, addProject, addMissionToProject } = useAppStore();
  const projects = useMemo(() => {
    const trails = buildQuestTrails({ projects: storedProjects, tasks, habits, quests });
    return storedProjects.map(p => {
      const trail = trails.find(t => t.kind === 'project' && t.id === p.id)!;
      return { ...p, status: trail.completed ? 'completed' as const : p.status,
        progress: trail.completed ? 100 : trail.total ? Math.round(100 * trail.done / trail.total) : 0 };
    });
  }, [storedProjects, tasks, habits, quests]);
  const navigate = useNavigate();
  const [selection, setSelection] = useState<{ id: string; accountId: string | null } | null>(null);
  const selectedProject = selection?.accountId === currentAccountId
    ? projects.find(project => project.id === selection?.id) ?? null : null;
  const selectedTrail = useMemo(() => selectedProject
    ? buildQuestTrails({ tasks, habits, quests, projects: [selectedProject] }).find(trail => trail.kind === 'project')
    : undefined, [selectedProject, tasks, habits, quests]);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddMission, setShowAddMission] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  // Open project detail
  const openProjectDetail = (project: Project) => {
    setSelection({ id: project.id, accountId: currentAccountId });
    setShowAddMission(false);
    setNewMissionTitle('');
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
  };

  // Create new project
  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) return;
    
    addProject({ title: newProjectTitle.trim() });
    
    setNewProjectTitle('');
    setShowCreateProject(false);
  };

  const media = Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / (projects.length || 1));

  return (
    <AppLayout>
      <div className="quest-catalog">
        <header className="ds-cabecalho">
          <h1>Grandes Obras</h1>
          <p>Projetos maiores, organizados em fases, jornadas e ações.</p>
          <div className="ds-cabecalho-acao quest-catalog-actions">
            <QuestComposer key={currentAccountId ?? 'local'} initialKind="project" triggerLabel="Nova Grande Obra" onCreated={key => navigate(trailHref(key))} />
            <button type="button" className="ds-botao" data-tipo="fantasma" onClick={() => setShowCreateProject(true)}>Criar só com nome</button>
          </div>
        </header>

        <div className="ds-cifras">
          <div className="ds-cifra">{projects.length}<small>Total</small></div>
          <div className="ds-cifra">{activeProjects.length}<small>Ativas</small></div>
          <div className="ds-cifra">{media}%<small>Média</small></div>
        </div>

        <div className="ds-secao">
          <h2>Ativas</h2>
          <span className="ds-contagem">{activeProjects.length}</span>
        </div>
        <ProjectList projects={activeProjects} onSelect={openProjectDetail} onCreate={() => setShowCreateProject(true)} />

        <details className="ds-grupo">
          <summary>
            <span>Selados</span>
            <small>({completedProjects.length})</small>
            <ArcaneIcon name="chevron" size={16} />
          </summary>
          <ProjectList projects={completedProjects} completed onSelect={openProjectDetail} />
        </details>

        <details className="ds-grupo">
          <summary>
            <span>Arquivadas</span>
            <small>({archivedProjects.length})</small>
            <ArcaneIcon name="chevron" size={16} />
          </summary>
          <ProjectList projects={archivedProjects} archived onSelect={openProjectDetail} />
        </details>

        {/* Detalhe da obra */}
        <Dialog open={showDetail && !!selectedProject} onOpenChange={setShowDetail}>
          <DialogContent className="ds-folha quest-dialog quest-catalog-detail" data-element={selectedProject?.elementId} aria-labelledby="project-detail-title" aria-describedby="project-detail-description">
            {selectedProject && (
              <>
                <DialogHeader>
                  <div className="quest-catalog-rune"><QuestRune element={selectedProject.elementId} size={64} /></div>
                  <DialogTitle id="project-detail-title">{selectedProject.title}</DialogTitle>
                  <DialogDescription id="project-detail-description">Consulte a composição e abra a trilha para continuar.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 pt-4">
                  <Link className="ds-botao w-full" data-tipo="primario" to={trailHref(`project:${selectedProject.id}`)}><ArcaneIcon name="jornada" size={20} />Explorar trilha de quests</Link>
                  {selectedProject.description && <p className="ds-nota">{selectedProject.description}</p>}

                  <div className="ds-meta">
                    <MarcaElemento elemento={selectedProject.elementId} />
                    {selectedProject.areaId && <span>{getAreaById(selectedProject.areaId)?.name}</span>}
                    {selectedProject.dueDate && <span>Até {new Date(selectedProject.dueDate).toLocaleDateString('pt-BR')}</span>}
                  </div>

                  <div className="grid gap-2">
                    <div className="ds-secao" data-nivel="2" style={{ margin: 0 }}>
                      <h3>Progresso registrado da obra</h3>
                      <span className="ds-fracao">{selectedProject.progress}%</span>
                    </div>
                    <Medidor valor={selectedProject.progress / 100} espesso conquista={selectedProject.status === 'completed'} rotulo={`Progresso de ${selectedProject.title}`} />
                  </div>

                  <div className="ds-cifras">
                    <div className="ds-cifra">{selectedProject.missions.length}<small>Capítulos</small></div>
                    <div className="ds-cifra">{selectedProject.quests.length}<small>Jornadas</small></div>
                    <div className="ds-cifra">{selectedProject.tasks.length}<small>Rituais</small></div>
                    <div className="ds-cifra">{selectedProject.habits.length}<small>Ciclos</small></div>
                  </div>

                  <section>
                    <div className="ds-secao" data-nivel="2" style={{ marginTop: 0 }}>
                      <h3>Capítulos da obra</h3>
                      <button type="button" className="ds-elo" onClick={() => setShowAddMission(true)}>
                        <ArcaneIcon name="criar" size={14} />
                        Adicionar
                      </button>
                    </div>

                    {showAddMission && (
                      <div className="quest-chapter-create">
                        <label className="ds-campo flex-1">
                          <span className="sr-only">Nome do capítulo</span>
                          <input
                            type="text"
                            value={newMissionTitle}
                            onChange={(e) => setNewMissionTitle(e.target.value)}
                            aria-label="Nome do capítulo"
                            placeholder="Nome do capítulo..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddMission();
                              if (e.key === 'Escape') setShowAddMission(false);
                            }}
                          />
                        </label>
                        <button type="button" className="ds-botao" data-tipo="fantasma" onClick={() => { setShowAddMission(false); setNewMissionTitle(''); }}>Cancelar</button>
                        <button type="button" className="ds-botao" data-tipo="secundario" data-icone="" aria-label="Adicionar capítulo" disabled={!newMissionTitle.trim()} onClick={handleAddMission}>
                          <ArcaneIcon name="criar" size={18} />
                        </button>
                      </div>
                    )}

                    {selectedTrail && <ProjectChapters trail={selectedTrail} />}
                  </section>

                  {selectedProject.reward && (
                    <div className="grid gap-2">
                      <span className="ds-marca" data-tom="ouro"><ArcaneIcon name="conquista" size={14} />Recompensa</span>
                      <p className="ds-nota">{selectedProject.reward}</p>
                    </div>
                  )}

                  <AchievementCompletion kind="project" id={selectedProject.id} />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Criar só com nome */}
        <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
          <DialogContent className="ds-folha quest-dialog quest-quick-create" aria-labelledby="project-quick-title" aria-describedby="project-quick-description">
            <DialogHeader>
              <DialogTitle id="project-quick-title">Nova Grande Obra</DialogTitle>
              <DialogDescription id="project-quick-description">Comece pelo nome. Você pode organizar as etapas depois.</DialogDescription>
            </DialogHeader>
            <label className="ds-campo my-4">
              <span>Nome da Grande Obra</span>
              <input
                type="text"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                aria-label="Nome da Grande Obra"
                placeholder="Nome da Grande Obra..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setShowCreateProject(false);
                }}
              />
            </label>
            <div className="ds-folha-pe">
              <button type="button" className="ds-botao" data-tipo="fantasma" onClick={() => setShowCreateProject(false)}>Cancelar</button>
              <button type="button" className="ds-botao" data-tipo="primario" onClick={handleCreateProject} disabled={!newProjectTitle.trim()}>Criar</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

interface ProjectListProps {
  projects: Project[];
  completed?: boolean;
  archived?: boolean;
  onSelect: (project: Project) => void;
  onCreate?: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, completed, archived, onSelect, onCreate }) => {
  if (projects.length === 0) {
    return (
      <Vazio
        compacto={!!(completed || archived)}
        titulo={archived ? 'Nenhuma obra arquivada' : completed ? 'Nenhuma obra concluída' : 'Nenhuma obra ativa'}
        texto={archived
          ? 'Projetos arquivados aparecerão aqui.'
          : completed
            ? 'Complete projetos para vê-los aqui.'
            : 'Comece um novo projeto para organizar suas metas!'}
        acao={!archived && !completed && onCreate
          ? <button type="button" className="ds-botao" data-tipo="secundario" onClick={onCreate}><ArcaneIcon name="criar" size={18} />Criar só com nome</button>
          : undefined}
      />
    );
  }

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} completed={completed} archived={archived} onClick={() => onSelect(project)} />
      ))}
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  completed?: boolean;
  archived?: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, completed, archived, onClick }) => {
  const area = project.areaId ? getAreaById(project.areaId) : null;
  const totalItems = project.missions.length + project.quests.length + project.tasks.length + project.habits.length;
  return <article className="quest-catalog-card"><ShowcaseCard title={project.title} description={project.description} element={project.elementId}
    status={archived ? 'Obra arquivada' : completed ? 'Obra concluída' : 'Obra em andamento'} progress={project.progress}
    chips={[...(area ? [area.name] : []), `${totalItems} itens`, ...(project.missions.length ? [`${project.missions.length} capítulos`] : [])]}
    reward={project.reward} onOpen={onClick} /><Link className="ds-elo" to={trailHref(`project:${project.id}`)} aria-label={`Abrir trilha de ${project.title}`}>{archived || completed ? 'Consultar trilha' : 'Abrir trilha'}<ArcaneIcon name="chevron" size={16} /></Link></article>;
};
