import { ProgressBackup } from '@/components/backup/ProgressBackup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ResourceMeter } from '@/components/grimorio/ResourceMeter';
import { ElementMasteryCard } from '@/components/grimorio/ElementMasteryCard';
import { useGrimoireAnchor } from '@/components/grimorio/useGrimoireAnchor';
import { useSecaoAtiva } from '@/components/grimorio/useSecaoAtiva';
import { GrimoireHistory } from '@/components/grimorio/GrimoireHistory';
import { CenaGrimorio } from '@/components/grimorio/CenaGrimorio';
import { useEntradaGrimorio } from '@/components/grimorio/useEntradaGrimorio';
import { useChegadaGrimorio } from '@/components/grimorio/useChegadaGrimorio';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { DURATION } from '@/lib/motion/motion';
import { buildGrimoireHistory } from '@/components/grimorio/history';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { ELEMENTS, AVATARS } from '@/constants';
import { ACENTO } from '@/lib/design/palette';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './grimorio.css';
import { hpDoDia } from '@/lib/recursos/vitalidade';

const SECOES = [["grimoire-character", "Personagem"], ["grimoire-elements", "Elementos"], ["grimoire-history", "Histórico"], ["grimoire-backup", "Cópia de segurança"]] as const;
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

export function Grimorio() {
  const accountId = useAppStore(state => state.currentAccountId);
  return <GrimorioContent key={accountId ?? 'local'} />;
}

function GrimorioContent() {
  const secaoAtiva = useSecaoAtiva(SECOES.map(([id]) => id));
  // The active tab is brought into view in its own bar: with four tabs on a phone the last one hides at the edge.
  useEffect(() => {
    document.querySelector<HTMLElement>('.gr-cena .ds-abas > a[aria-current]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [secaoAtiva]);
  useGrimoireAnchor();
  const { entrada, acesa } = useEntradaGrimorio();
  const reduzido = useMotionPreference();
  const elementosRef = useRef<HTMLElement>(null);
  const elementosChegaram = useChegadaGrimorio(elementosRef, 'elementos');
  const [balanceOpen, setBalanceOpen] = useState(false);
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
  const hp = hpDoDia({ habitosHoje: habitsToday, ofensiva: streak });
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

  return <AppLayout>
    <CenaGrimorio entrada={entrada}>
      <header className="ds-cabecalho gr-cabecalho"><h1>Meu Grimório</h1><p>Seu personagem. Cada conquista, uma nova página.</p></header>
      <nav className="ds-abas" aria-label="Seções do Grimório">{SECOES.map(([id, rotulo]) => <a key={id} href={`#${id}`} aria-current={secaoAtiva === id ? 'location' : undefined}>{rotulo}</a>)}</nav>

      <section id="grimoire-character" tabIndex={-1} className="grimoire-sheet ds-glass-float" data-luz="" aria-labelledby="grimoire-character-name">
        <div className="grimoire-portrait" aria-hidden="true">
          <div className="grimoire-portrait-ring" />
          {portraitFailed ? <ArcaneIcon name="santuario" size={120} /> : <img src="/sanctuary/elemental-body-v1.png" alt="" width={913} height={1723} onError={() => setPortraitFailed(true)} />}
          <div className="grimoire-portrait-seal"><ArcaneIcon name="santuario" size={22} /></div>
        </div>
        <div className="grimoire-identity">
          <p className="grimoire-rank ds-meta"><ArcaneIcon name="conquista" size={18} /><span>{levelProgress.title}</span><span>Nível {levelProgress.level}</span></p>
          <h2 id="grimoire-character-name">{user.name}</h2>
          <div className="grimoire-streak ds-meta" data-element="fogo"><span><ArcaneIcon name="ofensiva" size={17} />{user.streak} {user.streak === 1 ? 'dia seguido' : 'dias seguidos'}</span><span>Recorde: {user.longestStreak} {user.longestStreak === 1 ? 'dia' : 'dias'}</span></div>
        </div>
        <div className="grimoire-profile-actions"><button ref={nameTrigger} className="ds-botao" data-tipo="secundario" type="button" onClick={() => { setNewName(user.name); setEditName(true); }}><ArcaneIcon name="editar" size={16} />Editar nome</button><button ref={avatarTrigger} className="ds-botao" data-tipo="secundario" type="button" onClick={() => setShowAvatarDialog(true)}><ArcaneIcon name="santuario" size={16} />Ícone do perfil</button></div>
        <div className="grimoire-resources ds-pane">
          <div className="grimoire-resource-grid">
            <ResourceMeter label="Vitalidade · HP" value={hp} maximum={100} color={ACENTO.terra} icon={<ArcaneIcon name="vida" size={18} />} chegou={acesa} ordem={0} />
            <ResourceMeter label="Stamina" value={resourceSnapshot.currentStamina} maximum={100} color={ACENTO.agua} icon={<ArcaneIcon name="stamina" size={18} />} chegou={acesa} ordem={1} />
            <ResourceMeter label="Prana" value={resourceSnapshot.currentPrana} maximum={100} color={ACENTO.ar} icon={<ArcaneIcon name="prana" size={18} />} chegou={acesa} ordem={2} />
          </div>
          <ResourceMeter label="Experiência" value={levelXp} maximum={levelProgress.xpToNextLevel} conquista chegou={acesa} ordem={3} icon={<ArcaneIcon name="conquista" size={18} />} note={`Faltam ${format(levelProgress.xpToNextLevel - levelXp)} XP para o nível ${levelProgress.level + 1}`} />
          <div className="grimoire-resource-footnote"><span><Contagem valor={acesa ? levelProgress.xpTotal : 0} formatar={format} /> XP acumulados</span><span>Recursos do jogo</span></div>
        </div>
        <footer className="grimoire-sheet-footer"><span>{Number.isFinite(joinedAt.getTime()) ? `Jornada iniciada em ${joinedAt.toLocaleDateString('pt-BR')}` : 'Sua jornada elemental'}</span><Link className="ds-elo" to="/santuario">Ir ao Santuário</Link></footer>
      </section>

      <section className="grimoire-overview ds-cifras" aria-labelledby="grimoire-overview-title">
        <h2 id="grimoire-overview-title" className="sr-only">Sua atividade em números</h2>
        <Link className="ds-cifra" to="/rituais" data-luz=""><span className="gr-brilho" aria-hidden="true" /><span><Contagem valor={acesa ? completedTasks : 0} /> / {totalTasks}</span><small>Rituais concluídos</small></Link>
        <Link className="ds-cifra" to="/ciclos" data-luz=""><span className="gr-brilho" aria-hidden="true" /><span><Contagem valor={acesa ? activeHabits : 0} /></span><small>Ciclos cadastrados</small></Link>
        <div className="ds-cifra" data-luz=""><span className="gr-brilho" aria-hidden="true" /><span><Contagem valor={acesa ? user.totalScore : 0} formatar={format} /></span><small>Pontos totais</small></div>
        <a className="ds-cifra" href="#grimoire-history" data-luz=""><span className="gr-brilho" aria-hidden="true" /><span><Contagem valor={acesa ? totalHabitCompletions : 0} formatar={format} /></span><small>Conclusões de ciclos</small></a>
      </section>

      <section ref={elementosRef} id="grimoire-elements" tabIndex={-1} className="grimoire-elements" data-chegou={elementosChegaram} aria-labelledby="grimoire-elements-title">
        <div className="ds-secao"><h2 id="grimoire-elements-title">Maestria elemental</h2></div>
        <p className="ds-nota">{hasScores ? 'Abra um elemento para acompanhar sua evolução.' : 'Cada elemento acende conforme você pontua. Abra um para ver o caminho.'}</p>
        <div className="grimoire-elements-grid">{elementScores.map((score, ordem) => <ElementMasteryCard key={score.elementId} element={ELEMENTS[score.elementId]} mastery={mastery[score.elementId]} score={score} hasScores={hasScores} chegou={elementosChegaram} ordem={ordem} />)}</div>
        {hasScores && <details className="ds-grupo grimoire-balance" onToggle={event => setBalanceOpen(event.currentTarget.open)}><summary><span>Ver equilíbrio dos elementos</span><ArcaneIcon name="chevron" size={16} /></summary><div role="img" aria-label={`Pontuação por elemento: ${elementScores.map(score => `${ELEMENTS[score.elementId].name}, ${format(score.score)} pontos`).join('; ')}`}>{balanceOpen && <ResponsiveContainer width="100%" height={250}><RadarChart data={radarData}><PolarGrid stroke="rgb(var(--el-gold) / .2)" /><PolarAngleAxis dataKey="element" tick={{ fill: 'rgb(var(--el-muted))', fontSize: 12 }} /><PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: 'rgb(var(--el-muted))', fontSize: 12 }} /><Radar name="Pontuação" dataKey="score" stroke="rgb(var(--el-gold))" fill="rgb(var(--el-gold))" fillOpacity={0.26} strokeWidth={2} isAnimationActive={!reduzido} animationDuration={DURATION.conjure} /></RadarChart></ResponsiveContainer>}</div></details>}
      </section>

      <GrimoireHistory entries={history} now={now} />
      <ProgressBackup />
    </CenaGrimorio>

    <Dialog open={editName} onOpenChange={setEditName}>
      <DialogContent className="grimoire-dialog ds-folha" showCloseButton={false} aria-labelledby="grimoire-name-title" aria-describedby="grimoire-name-description" onCloseAutoFocus={event => { event.preventDefault(); nameTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle id="grimoire-name-title">Nome do personagem</DialogTitle><DialogDescription id="grimoire-name-description">Como você quer aparecer em sua jornada?</DialogDescription></DialogHeader>
        <DialogClose className="grimoire-dialog-close" aria-label="Fechar edição de nome"><ArcaneIcon name="fechar" size={20} /></DialogClose>
        <form onSubmit={event => { event.preventDefault(); handleNameSave(); }}><label className="ds-campo" htmlFor="grimoire-name-input"><span>Seu nome</span><input id="grimoire-name-input" value={newName} onChange={event => setNewName(event.target.value)} autoComplete="nickname" autoFocus required /></label><div className="ds-folha-pe"><button className="ds-botao" data-tipo="fantasma" type="button" onClick={() => setEditName(false)}>Cancelar</button><button className="ds-botao" data-tipo="primario" type="submit" disabled={!newName.trim()}>Salvar nome</button></div></form>
      </DialogContent>
    </Dialog>
    <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
      <DialogContent className="grimoire-dialog ds-folha" showCloseButton={false} aria-labelledby="grimoire-avatar-title" aria-describedby="grimoire-avatar-description" onCloseAutoFocus={event => { event.preventDefault(); avatarTrigger.current?.focus(); }}>
        <DialogHeader><DialogTitle id="grimoire-avatar-title">Ícone do perfil</DialogTitle><DialogDescription id="grimoire-avatar-description">Seu ícone atual: <span aria-label="Ícone atual">{user.avatar}</span>. Escolha para salvar.</DialogDescription></DialogHeader>
        <DialogClose className="grimoire-dialog-close" aria-label="Fechar seleção de ícone"><ArcaneIcon name="fechar" size={20} /></DialogClose>
        <div className="grimoire-avatar-grid">{AVATARS.map((avatar, index) => <button type="button" key={avatar} onClick={() => handleAvatarSelect(avatar)} aria-pressed={user.avatar === avatar} aria-label={`Selecionar ícone ${index + 1}: ${avatar}`}><span aria-hidden="true">{avatar}</span>{user.avatar === avatar && <ArcaneIcon name="concluir" size={14} />}</button>)}</div>
      </DialogContent>
    </Dialog>
  </AppLayout>;
}
