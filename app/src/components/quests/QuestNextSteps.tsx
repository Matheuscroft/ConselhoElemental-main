import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { Medidor } from '@/components/elemental/blocos/Medidor';
import { Vazio } from '@/components/elemental/blocos/Vazio';
import { useAppStore } from '@/stores/appStore';
import { buildQuestTrails, nextQuestCards, trailHref } from './quest-path';
import './quests.css';

export function QuestNextSteps() {
  const { quests, projects, tasks, habits } = useAppStore(useShallow(state => ({ quests: state.quests, projects: state.projects, tasks: state.tasks, habits: state.habits })));
  const trails = useMemo(() => buildQuestTrails({ quests, projects, tasks, habits }), [quests, projects, tasks, habits]);
  const next = nextQuestCards(trails);
  return <section className="quest-home" aria-labelledby="quest-home-title">
    <div className="ds-secao"><h2 id="quest-home-title">Jornadas em curso</h2><Link className="ds-elo" to="/rituais?view=trilhas">Ver jornadas</Link></div>
    {next.length ? <div className="quest-home-lista">{next.map(trail => <Link className="ds-linha quest-home-linha" key={trail.key} data-element={trail.element} to={trailHref(trail.key, trail.next!.key)}>
      <ArcaneIcon name={trail.element} size={28} />
      <span className="quest-home-copy"><strong>{trail.title}</strong><small>{trail.next!.title}</small><Medidor forma="fio" valor={trail.total ? trail.done / trail.total : 0} cor="var(--elem-acento)" rotulo={`${trail.done} de ${trail.total} rituais concluídos em ${trail.title}`} /></span>
      <span className="ds-linha-valor">{trail.done}/{trail.total}</span>
    </Link>)}</div> : <Vazio compacto titulo={trails.length ? 'Explore suas trilhas' : 'Sua próxima aventura começa aqui'} texto={trails.length ? 'Veja as etapas das suas Jornadas e Grandes Obras.' : 'Organize uma Jornada ou Grande Obra em pequenas etapas.'} acao={<Link className="ds-botao" data-tipo="secundario" to="/rituais?view=trilhas">Explorar trilhas</Link>} />}
  </section>;
}
