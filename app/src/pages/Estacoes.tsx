import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getSeason } from '@/constants';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { useLiveDate } from '@/components/temporal/celestial/useLiveDate';
import { useHemisphereView } from '@/components/temporal/celestial/useHemisphereView';
import { seasonCycle } from '@/components/temporal/celestial/season-presentation';
import { SeasonExplorer } from '@/components/temporal/celestial/SeasonExplorer';
import { CenaDaTela } from '@/components/mais/CenaDaTela';
import { EstacaoPalco, RodaDoAno } from '@/components/cycles/ceu/EstacaoPalco';

export const Estacoes = () => {
  const { now } = useLiveDate();
  const [hemisphere, setHemisphere] = useHemisphereView();
  const seasons = useMemo(() => seasonCycle(now, (date) => getSeason(date, { hemisphere })), [now, hemisphere]);
  const current = seasons[0];
  return <TemporalLayout title="Estações" subtitle="Quatro capítulos para observar a passagem do tempo e olhar para sua jornada." className="temporal-seasons">
    <CenaDaTela tela="estacoes" className="est-cena">
      <EstacaoPalco estacoes={seasons} nomeAtual={current?.name ?? getSeason(now, { hemisphere }).name} now={now} hemisphere={hemisphere} onHemisphere={setHemisphere} />
      <p className="temporal-note">Datas do calendário aproximado já usado no app. As estações são opostas entre os hemisférios; o clima local pode seguir outros ritmos.</p>
      {seasons.length > 0 ? <section className="temporal-section est-roda-secao" aria-labelledby="season-wheel-title"><div className="temporal-section-heading"><h3 id="season-wheel-title">A roda do ano</h3><span>Você está no ponto dourado</span></div><RodaDoAno estacoes={seasons} now={now} /></section> : null}
      <section className="temporal-section est-explorar" aria-labelledby="season-explore-title"><div className="temporal-section-heading"><h3 id="season-explore-title">Explore este ciclo</h3><span>Selecione uma estação para revelar seu capítulo</span></div><SeasonExplorer key={`${hemisphere}-${current?.start.toISOString()}`} seasons={seasons} /></section>
      <Link className="temporal-journey-link" to="/temporal/ano"><span><strong>Veja sua jornada ao longo do ano</strong><small>Meses, atividades e datas que você quer lembrar.</small></span><ArrowRight size={20} /></Link>
      <details className="temporal-source"><summary>Como esta página funciona</summary><p>O hemisfério inicial usa a latitude já salva no app; sem ela, o padrão é Sul. A seleção acima muda apenas esta visualização. Os textos são convites à reflexão e não alteram pontuação, hábitos ou recursos.</p></details>
    </CenaDaTela>
  </TemporalLayout>;
};
