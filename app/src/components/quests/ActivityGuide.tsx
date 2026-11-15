import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

/** Product vocabulary, without imposing new hierarchy or recurrence rules. */
export function ActivityGuide() {
  return <details className="activity-guide ds-grupo" data-tom="guia">
    <summary>Como organizar suas atividades<ArcaneIcon name="chevron" size={16} /></summary>
    <nav aria-label="Tipos de atividade">
      <Link className="ds-linha" to="/rituais"><ArcaneIcon name="ritual" size={28} /><span><strong>Rituais · tarefas</strong><small>Ações pontuais para realizar, sem repetição automática.</small></span><ArcaneIcon name="chevron" className="ds-linha-chevron" size={16} /></Link>
      <Link className="ds-linha" to="/ciclos"><ArcaneIcon name="ciclo" size={28} /><span><strong>Ciclos · hábitos</strong><small>Ações que voltam nos dias ou datas da sua recorrência.</small></span><ArcaneIcon name="chevron" className="ds-linha-chevron" size={16} /></Link>
      <Link className="ds-linha" to="/jornadas"><ArcaneIcon name="jornada" size={28} /><span><strong>Jornadas · quests</strong><small>Conquistas intermediárias organizadas em etapas.</small></span><ArcaneIcon name="chevron" className="ds-linha-chevron" size={16} /></Link>
      <Link className="ds-linha" to="/grandes-obras"><ArcaneIcon name="obra" size={28} /><span><strong>Grandes Obras · projetos</strong><small>Objetivos maiores que reúnem fases, jornadas e ações.</small></span><ArcaneIcon name="chevron" className="ds-linha-chevron" size={16} /></Link>
    </nav>
  </details>;
}
