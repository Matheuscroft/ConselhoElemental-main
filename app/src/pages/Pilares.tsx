import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { ExpandedElements } from '@/components/elemental/ExpandedElements';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS } from '@/constants';
import './pilares.css';
import '@/components/elemental/element-discovery.css';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

export const Pilares = () => {
  const { getElementScores, customAreas, onboarding } = useAppStore();
  const scores = getElementScores();
  const areas = [...AREAS, ...customAreas];
  const total = scores.reduce((sum, score) => sum + score.score, 0);
  const activeCount = areas.filter((area) => onboarding.selectedAreas.includes(area.id)).length;
  const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  return <AppLayout showAura={false}>
    <div className="elemental-pillars">
      <Link className="pillars-back" to="/santuario"><ArrowLeft size={16} />Voltar ao Santuário</Link>
      <header className="pillars-heading">
        <div><p className="pillars-eyebrow"><ArcaneIcon name="pilares" size={24} />Seus quatro caminhos</p><h1>Pilares Elementais</h1><p>Seus elementos, suas áreas de vida. Abra um caminho para continuar.</p></div>
        <Link className="pillars-manage" to="/dominios">Gerenciar áreas <ArrowRight size={16} /></Link>
      </header>
      <section className="pillars-explore" aria-labelledby="pillars-explore-title">
        <h3 id="pillars-explore-title">Explore um elemento</h3><p>Abra um cartão para conhecer o elemento e acessar suas áreas.</p>
        <ExpandedElements elements={ELEMENT_ORDER.map((id) => {
          const element = ELEMENTS[id];
          const elementAreas = areas.filter((area) => area.elementId === id);
          const active = elementAreas.filter((area) => onboarding.selectedAreas.includes(area.id)).length;
          return { id, name: element.name, description: element.description, scoreLabel: `${elementAreas.length} áreas para explorar · ${active} ativas` };
        })} />
      </section>
      <details className="pillars-balance"><summary><span>Seu equilíbrio elemental<small>{format(total)} pontos registrados</small></span><ChevronDown size={20} aria-hidden="true" /></summary><div className="pillars-balance-content">
        <div className="pillars-balance-heading"><h3 id="pillars-balance-title">Seu equilíbrio elemental</h3><p>{format(total)} pontos registrados <span aria-hidden="true">·</span> {activeCount} áreas ativas</p></div>
        <div className="pillars-balance-track" aria-hidden="true">{scores.map((score) => <span key={score.elementId} style={{ width: `${score.percentage}%`, background: `var(--element-${score.elementId})` }} />)}</div>
        <ul className="pillars-balance-legend">{ELEMENT_ORDER.map((id) => {
          const score = scores.find((entry) => entry.elementId === id);
          return <li key={id} style={{ '--pillar-accent': `var(--element-${id})` } as CSSProperties}><span>{ELEMENTS[id].name}</span><strong>{format(score?.percentage ?? 0)}%</strong><small>{format(score?.score ?? 0)} pontos</small></li>;
        })}</ul>
        <p className="pillars-balance-note">{total === 0 ? 'Seu equilíbrio aparecerá aqui conforme você registrar atividades.' : 'A distribuição mostra onde seus pontos foram registrados. Cada jornada tem seu próprio ritmo.'}</p>
      </div></details>
      <Link className="pillars-footer" to="/invocar"><span><strong>Transforme intenção em prática</strong><small>Crie um ritual para uma das suas áreas de vida.</small></span><span>Criar ritual <ArrowRight size={17} /></span></Link>
    </div>
  </AppLayout>;
};
