import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { PalcoPilares, type PilarPalco } from '@/components/pilares/PalcoPilares';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS } from '@/constants';
import './pilares.css';
import '@/components/elemental/element-discovery.css';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { MarcaElemento, Medidor } from '@/components/elemental/blocos';

export const Pilares = () => {
  const { getElementScores, customAreas, onboarding } = useAppStore();
  const scores = getElementScores();
  const areas = [...AREAS, ...customAreas];
  const total = scores.reduce((sum, score) => sum + score.score, 0);
  const activeCount = areas.filter((area) => onboarding.selectedAreas.includes(area.id)).length;
  const itens: PilarPalco[] = ELEMENT_ORDER.map((id) => {
    const score = scores.find((entry) => entry.elementId === id);
    const elementAreas = areas.filter((area) => area.elementId === id);
    const ativas = elementAreas.filter((area) => onboarding.selectedAreas.includes(area.id)).length;
    return { id, nome: ELEMENTS[id].name, descricao: ELEMENTS[id].description, pontos: score?.score ?? 0, porcentagem: score?.percentage ?? 0, areas: elementAreas.length, ativas };
  });
  const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

  return <AppLayout>
    <div className="elemental-pillars">
      <header className="ds-cabecalho pillars-heading">
        <h1>Pilares Elementais</h1>
        <Link className="ds-elo pillars-manage" to="/dominios">Gerenciar áreas</Link>
      </header>
      <section className="pillars-explore" aria-labelledby="pillars-explore-title">
        <h3 id="pillars-explore-title" className="sr-only">Explore um elemento</h3>
        <PalcoPilares itens={itens} />
      </section>
      <details className="ds-grupo pillars-balance"><summary><span>Seu equilíbrio elemental</span><small>{format(total)} pontos registrados</small><ArcaneIcon name="chevron" size={16} /></summary><div className="pillars-balance-content">
        <p className="ds-meta pillars-balance-resumo"><span>{format(total)} pontos registrados</span><span>{activeCount} áreas ativas</span></p>
        <div className="pillars-balance-track" aria-hidden="true">{ELEMENT_ORDER.map((id) => {
          const score = scores.find((entry) => entry.elementId === id);
          return <span key={id} className="pillars-balance-segment" style={{ flexGrow: score?.percentage ?? 0 }}><Medidor forma="fio" espesso valor={1} cor={`var(--element-${id})`} /></span>;
        })}</div>
        <ul className="pillars-balance-legend">{ELEMENT_ORDER.map((id) => {
          const score = scores.find((entry) => entry.elementId === id);
          return <li key={id} className="ds-linha" data-densa><MarcaElemento elemento={id} /><span className="ds-linha-valor"><strong>{format(score?.percentage ?? 0)}%</strong> <small>{format(score?.score ?? 0)} pontos</small></span></li>;
        })}</ul>
        <p className="ds-nota">{total === 0 ? 'Seu equilíbrio aparecerá aqui conforme você registrar atividades.' : 'A distribuição mostra onde seus pontos foram registrados. Cada jornada tem seu próprio ritmo.'}</p>
      </div></details>
      <div className="ds-linha pillars-footer">
        <ArcaneIcon name="invocar" size={28} />
        <span><strong>Transforme intenção em prática</strong><small>Crie um ritual para uma das suas áreas de vida.</small></span>
        <Link className="ds-botao" data-tipo="secundario" to="/invocar">Criar ritual</Link>
      </div>
    </div>
  </AppLayout>;
};
