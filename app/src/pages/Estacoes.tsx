import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getSeason } from '@/constants';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { useLiveDate } from '@/components/temporal/celestial/useLiveDate';
import { useHemisphereView } from '@/components/temporal/celestial/useHemisphereView';
import { seasonCycle } from '@/components/temporal/celestial/season-presentation';
import { SeasonExplorer } from '@/components/temporal/celestial/SeasonExplorer';

export const Estacoes = () => {
  const { now } = useLiveDate();
  const [hemisphere, setHemisphere] = useHemisphereView();
  const seasons = useMemo(() => seasonCycle(now, (date) => getSeason(date, { hemisphere })), [now, hemisphere]);
  const current = seasons[0];
  const next = seasons[1];
  return <TemporalLayout title="Estações" subtitle="Quatro capítulos para observar a passagem do tempo e olhar para sua jornada." className="temporal-seasons">
    <section className="season-current" aria-labelledby="season-current-title"><div><p className="temporal-eyebrow">Estação atual · hemisfério {hemisphere === 'south' ? 'Sul' : 'Norte'}</p><h3 id="season-current-title">{current?.name ?? getSeason(now, { hemisphere }).name}</h3><p>{next ? `A próxima mudança é para ${next.name.toLocaleLowerCase('pt-BR')}, em ${next.start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}.` : 'Acompanhe os capítulos do ano.'}</p></div><label className="temporal-select">Explorar hemisfério<select value={hemisphere} onChange={(event) => setHemisphere(event.target.value === 'north' ? 'north' : 'south')}><option value="south">Hemisfério Sul</option><option value="north">Hemisfério Norte</option></select></label></section>
    <p className="temporal-note">Datas do calendário aproximado já usado no app. As estações são opostas entre os hemisférios; o clima local pode seguir outros ritmos.</p>
    <section className="temporal-section" aria-labelledby="season-explore-title"><div className="temporal-section-heading"><h3 id="season-explore-title">Explore este ciclo</h3><span>Selecione uma estação para revelar seu capítulo</span></div><SeasonExplorer key={`${hemisphere}-${current?.start.toISOString()}`} seasons={seasons} /></section>
    <Link className="temporal-journey-link" to="/temporal/ano"><span><strong>Veja sua jornada ao longo do ano</strong><small>Meses, atividades e datas que você quer lembrar.</small></span><ArrowRight size={20} /></Link>
    <details className="temporal-source"><summary>Como esta página funciona</summary><p>O hemisfério inicial usa a latitude já salva no app; sem ela, o padrão é Sul. A seleção acima muda apenas esta visualização. Os textos são convites à reflexão e não alteram pontuação, hábitos ou recursos.</p></details>
  </TemporalLayout>;
};
