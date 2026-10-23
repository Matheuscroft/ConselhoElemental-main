import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Heart, Zap, Sparkles, ChevronDown, X, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ResourceMeter } from '@/components/grimorio/ResourceMeter';
import { ElementMasteryCard } from '@/components/grimorio/ElementMasteryCard';
import { GrimoireHistory } from '@/components/grimorio/GrimoireHistory';
import { buildGrimoireHistory } from '@/components/grimorio/history';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { ELEMENTS, AVATARS } from '@/constants';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './grimorio.css';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function Grimorio() {
  const accountId = useAppStore(state => state.currentAccountId);
  return <GrimorioContent key={accountId ?? 'local'} />;
}

function GrimorioContent() {
  const { user, updateUser, getElementScores, getLevelProgress, getMasteryProgress, getCompletedHabitsToday, getStreak, tasks, habits, actions, executionLogs } = useAppStore();
  const { getResourceSnapshot } = useWorkoutStore();
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState(user.name);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const nameTrigger = useRef<HTMLButtonElement>(null);
  const avatarTrigger = useRef<HTMLButtonElement>(null);

  // Refresh date-sensitive readouts only. Gameplay clocks and resource rules stay in their stores.
  useEffect(() => {
    const refresh = () => { if (!document.hidden) setNow(new Date()); };
    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  const elementScores = getElementScores();
  const levelProgress = getLevelProgress();
  const levelXp = levelProgress.xpTotal - levelProgress.xpAtLevelStart;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const activeHabits = habits.length;
  const totalHabitCompletions = habits.reduce((acc, h) => acc + h.completions.length, 0);
  const mastery = getMasteryProgress();
  const resourceSnapshot = getResourceSnapshot();
  const habitsToday = getCompletedHabitsToday();
  const streak = getStreak();
  const hp = Math.min(100, 70 + (habitsToday * 5) + (streak > 0 ? 10 : 0));
  const joinedAt = new Date(user.joinedAt);
  const history = useMemo(() => buildGrimoireHistory({ actions, tasks, habits, logs: executionLogs }), [actions, tasks, habits, executionLogs]);
  const radarData = elementScores.map(score => ({
    element: ELEMENTS[score.elementId].name,
    score: score.score,
    fullMark: Math.max(...elementScores.map(s => s.score), 100),
  }));
  const hasScores = radarData.some(d => d.score > 0);

  const handleNameSave = () => {
    if (newName.trim()) {
      updateUser({ name: newName.trim() });
      setEditName(false);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    updateUser({ avatar });
    setShowAvatarDialog(false);
  };

  return <AppLayout showAura={false}>
    <div className="grimoire-workspace">
      <header className="grimoire-page-heading"><div><h1>Meu Grimório</h1><p>Seu personagem. Cada conquista, uma nova página.</p></div><ArcaneIcon name="grimorio" size={32} /></header>
      <nav className="grimoire-index" aria-label="Seções do Grimório"><a href="#grimoire-character">Personagem</a><a href="#grimoire-elements">Elementos</a><a href="#grimoire-history">Histórico</a></nav>

      <section id="grimoire-character" className="grimoire-sheet" aria-labelledby="grimoire-character-name">
        <div className="grimoire-portrait" aria-hidden="true">
          <div className="grimoire-portrait-ring" />
          {portraitFailed ? <ArcaneIcon name="santuario" size={120} /> : <img src="/sanctuary/elemental-body-v1.png" alt="" width={913} height={1723} onError={() => setPortraitFailed(true)} />}
          <div className="grimoire-portrait-seal"><ArcaneIcon name="santuario" size={22} /></div>
        </div>
        <div className="grimoire-identity">
          <p className="grimoire-rank"><ArcaneIcon name="conquista" size={18} />{levelProgress.title} · Nível {levelProgress.level}</p>
          <h2 id="grimoire-character-name">{user.name}</h2>
          <div className="grimoire-profile-actions"><button ref={nameTrigger} type="button" onClick={() => { setNewName(user.name); setEditName(true); }}><Edit2 size={15} aria-hidden="true" />Editar nome</button><button ref={avatarTrigger} type="button" onClick={() => setShowAvatarDialog(true)}><ArcaneIcon name="santuario" size={16} />Ícone do perfil</button></div>
          <div className="grimoire-streak"><span><ArcaneIcon name="fogo" size={17} />{user.streak} {user.streak === 1 ? 'dia seguido' : 'dias seguidos'}</span><span>Recorde: {user.longestStreak} {user.longestStreak === 1 ? 'dia' : 'dias'}</span></div>
        </div>
        <div className="grimoire-resources">
          <div className="grimoire-resource-grid">
            <ResourceMeter label="Vitalidade · HP" value={hp} maximum={100} color="246 148 167" icon={<Heart size={18} aria-hidden="true" />} />
            <ResourceMeter label="Stamina" value={resourceSnapshot.currentStamina} maximum={100} color="231 196 119" icon={<Zap size={18} aria-hidden="true" />} />
            <ResourceMeter label="Prana" value={resourceSnapshot.currentPrana} maximum={100} color="125 207 229" icon={<Sparkles size={18} aria-hidden="true" />} />
          </div>
          <ResourceMeter label="Experiência" value={levelXp} maximum={levelProgress.xpToNextLevel} color="215 184 109" icon={<ArcaneIcon name="conquista" size={18} />} note={`Faltam ${format(levelProgress.xpToNextLevel - levelXp)} XP para o nível ${levelProgress.level + 1}`} />
          <div className="grimoire-resource-footnote"><span>{format(levelProgress.xpTotal)} XP acumulados</span><span>Recursos do jogo</span></div>
        </div>
        <footer className="grimoire-sheet-footer"><span>{Number.isFinite(joinedAt.getTime()) ? `Jornada iniciada em ${joinedAt.toLocaleDateString('pt-BR')}` : 'Sua jornada elemental'}</span><Link to="/santuario">Ir ao Santuário<ArcaneIcon name="santuario" size={17} /></Link></footer>
      </section>

      <section className="grimoire-overview" aria-labelledby="grimoire-overview-title">
        <h2 id="grimoire-overview-title" className="sr-only">Sua atividade em números</h2>
        <Link to="/rituais"><ArcaneIcon name="ritual" size={22} /><span><strong>{completedTasks}<small> / {totalTasks}</small></strong><span>Rituais concluídos</span></span></Link>
        <Link to="/ciclos"><ArcaneIcon name="ciclo" size={22} /><span><strong>{activeHabits}</strong><span>Ciclos cadastrados</span></span></Link>
        <div><ArcaneIcon name="conquista" size={22} /><span><strong>{format(user.totalScore)}</strong><span>Pontos totais</span></span></div>
        <a href="#grimoire-history"><ArcaneIcon name="calendario" size={22} /><span><strong>{format(totalHabitCompletions)}</strong><span>Conclusões de ciclos</span></span></a>
      </section>

      <section id="grimoire-elements" className="grimoire-elements" aria-labelledby="grimoire-elements-title">
        <div className="grimoire-section-heading"><div><h2 id="grimoire-elements-title">Maestria elemental</h2><p>Abra um elemento para acompanhar sua evolução.</p></div><ArcaneIcon name="dominios" size={26} /></div>
        <div className="grimoire-elements-grid">{elementScores.map(score => <ElementMasteryCard key={score.elementId} element={ELEMENTS[score.elementId]} mastery={mastery[score.elementId]} score={score} hasScores={hasScores} />)}</div>
        {hasScores && <details className="grimoire-balance"><summary><span>Ver equilíbrio dos elementos</span><ChevronDown size={18} aria-hidden="true" /></summary><div role="img" aria-label={`Pontuação por elemento: ${elementScores.map(score => `${ELEMENTS[score.elementId].name}, ${format(score.score)} pontos`).join('; ')}`}><ResponsiveContainer width="100%" height={250}><RadarChart data={radarData}><PolarGrid stroke="rgba(215,184,109,0.2)" /><PolarAngleAxis dataKey="element" tick={{ fill: '#b5bdcc', fontSize: 12 }} /><PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#b5bdcc', fontSize: 10 }} /><Radar name="Pontuação" dataKey="score" stroke="#d7b86d" fill="#d7b86d" fillOpacity={0.18} isAnimationActive={false} /></RadarChart></ResponsiveContainer></div></details>}
      </section>

      <GrimoireHistory entries={history} now={now} />
    </div>

    <Dialog open={editName} onOpenChange={setEditName}>
      <DialogContent className="grimoire-dialog" showCloseButton={false} aria-labelledby="grimoire-name-title" aria-describedby="grimoire-name-description" onCloseAutoFocus={event => { event.preventDefault(); nameTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle id="grimoire-name-title">Nome do personagem</DialogTitle><DialogDescription id="grimoire-name-description">Como você quer aparecer em sua jornada?</DialogDescription></DialogHeader>
        <DialogClose className="grimoire-dialog-close" aria-label="Fechar edição de nome"><X size={20} /></DialogClose>
        <form onSubmit={event => { event.preventDefault(); handleNameSave(); }}><label htmlFor="grimoire-name-input">Seu nome</label><input id="grimoire-name-input" value={newName} onChange={event => setNewName(event.target.value)} autoComplete="nickname" autoFocus required /><div className="grimoire-dialog-actions"><button type="button" onClick={() => setEditName(false)}>Cancelar</button><button type="submit" disabled={!newName.trim()}>Salvar nome</button></div></form>
      </DialogContent>
    </Dialog>
    <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
      <DialogContent className="grimoire-dialog" showCloseButton={false} aria-labelledby="grimoire-avatar-title" aria-describedby="grimoire-avatar-description" onCloseAutoFocus={event => { event.preventDefault(); avatarTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle id="grimoire-avatar-title">Ícone do perfil</DialogTitle><DialogDescription id="grimoire-avatar-description">Seu ícone atual: <span aria-label="Ícone atual">{user.avatar}</span>. Escolha para salvar.</DialogDescription></DialogHeader>
        <DialogClose className="grimoire-dialog-close" aria-label="Fechar seleção de ícone"><X size={20} /></DialogClose>
        <div className="grimoire-avatar-grid">{AVATARS.map((avatar, index) => <button type="button" key={avatar} onClick={() => handleAvatarSelect(avatar)} aria-pressed={user.avatar === avatar} aria-label={`Selecionar ícone ${index + 1}: ${avatar}`}><span aria-hidden="true">{avatar}</span>{user.avatar === avatar && <Check size={14} aria-hidden="true" />}</button>)}</div>
      </DialogContent>
    </Dialog>
  </AppLayout>;
}
