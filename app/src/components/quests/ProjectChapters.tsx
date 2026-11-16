import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { Medidor } from '@/components/elemental/blocos';
import './quests-uau.css';
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
      return <details key={chapter.id} className="quest-chapter ds-runa" data-forma="vitrine" data-element={trail.element} style={{ '--i': Math.min(index, 7) } as CSSProperties}>
        <summary>
          <span className="quest-chapter-rune ds-runa-arte" aria-hidden="true"><QuestRune element={trail.element} size={36} /></span>
          <span className="quest-chapter-texto"><strong className="ds-runa-titulo">{chapter.title}</strong><span className="ds-meta"><span>Capítulo {index + 1}</span><span>{tasks.length ? `${done} de ${tasks.length} rituais concluídos` : 'Sem rituais pontuais'}</span>{steps.some(step => step.kind === 'habit') && <span>inclui ciclos</span>}</span>{tasks.length > 0 && <Medidor valor={done / tasks.length} rotulo={`Rituais concluídos em ${chapter.title}`} />}</span>
          <ArcaneIcon name="chevron" className="ds-runa-chevron" size={16} />
        </summary>
        <div className="quest-chapter-content ds-runa-conteudo">
          {chapter.progress != null && Number.isFinite(chapter.progress) && <p>Progresso registrado do capítulo: {chapter.progress}%</p>}
          {next && !trail.archived && !trail.completed && <Link className="quest-primary" to={trailHref(trail.key, next.key)}>Continuar capítulo</Link>}
          {steps.length ? <ul aria-label={`Atividades de ${chapter.title}`}>{steps.map(step => <li key={step.key}>
            {step.available ? <Link className="ds-linha" data-element={step.element} data-estado={step.completed ? 'selado' : undefined} to={trailHref(trail.key, step.key)}>
              {step.completed ? <ArcaneIcon name="concluir" size={28} /> : <QuestRune element={step.element} size={28} />}
              <span><strong>{step.title}</strong><small>{step.completed ? 'Concluído' : step.kind === 'habit' ? 'Ciclo, execução no calendário' : step.native ? 'Treino, execução no módulo' : step.hasChildren ? 'Ritual com subitens' : 'Ritual disponível'}</small></span><ArcaneIcon name="chevron" className="ds-linha-chevron" size={16} />
            </Link> : <div className="quest-chapter-unavailable ds-linha" data-estado="selado"><ArcaneIcon name="alerta" size={28} /><span><strong>{step.title}</strong><small>Referência indisponível</small></span></div>}
          </li>)}</ul> : <p>Este capítulo ainda não tem atividades. Na trilha, use Adicionar etapa e selecione este capítulo.</p>}
          {!steps.length && !trail.archived && !trail.completed && <Link className="quest-secondary" to={trailHref(trail.key)}>Abrir trilha</Link>}
        </div>
      </details>;
    })}
  </div>;
}
