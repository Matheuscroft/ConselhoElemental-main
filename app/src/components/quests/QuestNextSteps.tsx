import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { useAppStore } from '@/stores/appStore';
import { buildQuestTrails, nextQuestCards, trailHref } from './quest-path';
import './quests.css';

export function QuestNextSteps() {
  const { quests, projects, tasks, habits } = useAppStore(useShallow(state => ({ quests: state.quests, projects: state.projects, tasks: state.tasks, habits: state.habits })));
  const trails = useMemo(() => buildQuestTrails({ quests, projects, tasks, habits }), [quests, projects, tasks, habits]);
  const next = nextQuestCards(trails);
  return <section className="quest-home quest-surface" aria-labelledby="quest-home-title">
    <div className="quest-section-heading"><div><h2 id="quest-home-title">Suas próximas quests</h2><p>Um passo de cada vez nas suas grandes conquistas.</p></div><Link to="/rituais">Ver trilhas<ArrowRight size={17} /></Link></div>
    {next.length ? <div className="quest-home-grid">{next.map(trail => <Link className="quest-home-card" key={trail.key} to={trailHref(trail.key, trail.next!.key)}>
      <span className="quest-mini-stone"><ElementIcon element={trail.element} size={26} /></span><span className="quest-home-copy"><small>{trail.title}</small><strong>{trail.next!.title}</strong><span>{trail.done} de {trail.total} rituais concluídos</span><progress value={trail.done} max={Math.max(1, trail.total)} aria-label={`Rituais concluídos em ${trail.title}`} /></span><ArrowRight size={18} aria-hidden="true" />
    </Link>)}</div> : <Link className="quest-home-empty" to="/rituais"><ArcaneIcon name="jornada" size={32} /><span><strong>{trails.length ? 'Explore suas trilhas' : 'Sua próxima aventura começa aqui'}</strong><span>{trails.length ? 'Veja conquistas, ciclos e novas etapas.' : 'Organize uma Jornada ou Grande Obra em pequenas etapas.'}</span></span><ArrowRight size={19} /></Link>}
  </section>;
}
