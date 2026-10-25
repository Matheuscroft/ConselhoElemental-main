import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, Check, CircleHelp } from 'lucide-react';
import { QuestRune } from './QuestRune';
import { trailHref, type QuestTrail } from './quest-path';

/** Chapter membership uses IDs, never titles or persisted aggregate percentages. */
export function ProjectChapters({ trail }: { trail: QuestTrail }) {
  if (!trail.chapters.length) return <div className="quest-chapter-empty"><p>Organize esta obra em capítulos.</p><small>Use Adicionar para criar o primeiro. Depois, inclua seus rituais na trilha.</small></div>;
  return <div className="quest-chapters">
    <p className="quest-chapter-help">Abra um capítulo para escolher um ritual. Você pode seguir na ordem que preferir.</p>
    {trail.chapters.map((chapter, index) => {
      const steps = trail.steps.filter(step => step.chapterId === chapter.id);
      const tasks = steps.filter(step => step.kind === 'task');
      const done = tasks.filter(step => step.completed).length;
      const next = steps.find(step => step.available && !step.completed && step.kind === 'task');
      return <details key={chapter.id} className="quest-chapter" data-element={trail.element}>
        <summary>
          <span className="quest-chapter-rune" aria-hidden="true"><QuestRune element={trail.element} size={36} /></span>
          <span><small>Capítulo {index + 1}</small><strong>{chapter.title}</strong><span>{tasks.length ? `${done} de ${tasks.length} rituais concluídos` : 'Sem rituais pontuais'}{steps.some(step => step.kind === 'habit') ? ' · inclui ciclos' : ''}</span></span>
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <div className="quest-chapter-content">
          {chapter.progress != null && Number.isFinite(chapter.progress) && <p>Progresso registrado do capítulo: {chapter.progress}%</p>}
          {next && !trail.archived && !trail.completed && <Link className="quest-primary" to={trailHref(trail.key, next.key)}>Continuar capítulo<ArrowRight size={17} aria-hidden="true" /></Link>}
          {steps.length ? <ul aria-label={`Atividades de ${chapter.title}`}>{steps.map(step => <li key={step.key}>
            {step.available ? <Link to={trailHref(trail.key, step.key)}>
              <span aria-hidden="true">{step.completed ? <Check size={19} /> : <QuestRune element={step.element} size={24} />}</span>
              <span><strong>{step.title}</strong><small>{step.completed ? 'Concluído' : step.kind === 'habit' ? 'Ciclo · execução no calendário' : step.native ? 'Treino · execução no módulo' : step.hasChildren ? 'Ritual com subitens' : 'Ritual disponível'}</small></span><ArrowRight size={16} aria-hidden="true" />
            </Link> : <div className="quest-chapter-unavailable"><CircleHelp size={19} aria-hidden="true" /><span><strong>{step.title}</strong><small>Referência indisponível</small></span></div>}
          </li>)}</ul> : <p>Este capítulo ainda não tem atividades. Na trilha, use Adicionar etapa e selecione este capítulo.</p>}
          {!steps.length && !trail.archived && !trail.completed && <Link className="quest-secondary" to={trailHref(trail.key)}>Abrir trilha</Link>}
        </div>
      </details>;
    })}
  </div>;
}
