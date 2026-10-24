import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

/** Product vocabulary, without imposing new hierarchy or recurrence rules. */
export function ActivityGuide() {
  return <details className="activity-guide">
    <summary><ArcaneIcon name="grimorio" size={20} />Como organizar suas atividades</summary>
    <nav aria-label="Tipos de atividade">
      <Link to="/rituais"><ArcaneIcon name="ritual" size={24} /><span><strong>Rituais · tarefas</strong><small>Ações pontuais para realizar, sem repetição automática.</small></span></Link>
      <Link to="/ciclos"><ArcaneIcon name="ciclo" size={24} /><span><strong>Ciclos · hábitos</strong><small>Ações que voltam nos dias ou datas da sua recorrência.</small></span></Link>
      <Link to="/jornadas"><ArcaneIcon name="jornada" size={24} /><span><strong>Jornadas · quests</strong><small>Conquistas intermediárias organizadas em etapas.</small></span></Link>
      <Link to="/grandes-obras"><ArcaneIcon name="obra" size={24} /><span><strong>Grandes Obras · projetos</strong><small>Objetivos maiores que reúnem fases, jornadas e ações.</small></span></Link>
    </nav>
  </details>;
}
