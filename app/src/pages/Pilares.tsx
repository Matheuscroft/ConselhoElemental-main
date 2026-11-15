import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { PalcoPilares, type PilarPalco } from '@/components/pilares/PalcoPilares';
import { ELEMENT_ORDER } from '@/components/elemental/navigation';
import { useAppStore } from '@/stores/appStore';
import { AREAS, ELEMENTS } from '@/constants';
import './pilares.css';
import '@/components/elemental/element-discovery.css';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { EquilibrioElemental } from '@/components/pilares/EquilibrioElemental';

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
    return { id, nome: ELEMENTS[id].name, dominio: ELEMENTS[id].domain, descricao: ELEMENTS[id].description, pontos: score?.score ?? 0, porcentagem: score?.percentage ?? 0, areas: elementAreas.length, ativas };
  });

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
      <EquilibrioElemental
        fatias={itens.map(({ id, pontos, porcentagem }) => ({ id, pontos, porcentagem }))}
        total={total}
        areasAtivas={activeCount}
      />
      <section className="ds-altar pillars-altar" aria-labelledby="pillars-altar-title">
        <span className="pillars-altar-sigilo" aria-hidden="true"><ArcaneIcon name="invocar" size={28} /></span>
        <div className="pillars-altar-texto">
          <h3 id="pillars-altar-title">Transforme intenção em prática</h3>
          <p>Crie um ritual para uma das suas áreas de vida.</p>
        </div>
        <Link className="ds-botao pillars-altar-acao" data-tipo="secundario" to="/invocar">Criar ritual</Link>
      </section>
    </div>
  </AppLayout>;
};
