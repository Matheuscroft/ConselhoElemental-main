import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { lunarSnapshot, nextLunarQuarters } from '@/components/temporal/celestial/lunar-presentation';
import { MoonDisc } from '@/components/temporal/celestial/MoonDisc';
import { useLiveDate } from '@/components/temporal/celestial/useLiveDate';
import { useHemisphereView } from '@/components/temporal/celestial/useHemisphereView';
import { CenaDaTela } from '@/components/mais/CenaDaTela';
import { LuaCiclo, LuaPalco } from '@/components/cycles/ceu/LuaPalco';

const dateLabel = (date: Date) => date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

export const Lua = () => {
  const { now, refresh } = useLiveDate();
  const [hemisphere, setHemisphere] = useHemisphereView();
  const moon = useMemo(() => lunarSnapshot(now), [now]);
  const upcoming = useMemo(() => nextLunarQuarters(now), [now]);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const south = hemisphere === 'south';

  return <TemporalLayout title="Lua" subtitle="Acompanhe a luz, a fase e os próximos marcos do ciclo lunar." className="temporal-lunar">
    <CenaDaTela tela="lua" className="lua-cena">
      <LuaPalco moon={moon} south={south} now={now} proxima={upcoming[0]} hemisphere={hemisphere} onHemisphere={setHemisphere} onAtualizar={refresh} />
      <p className="temporal-note">Vista 3D calculada para o instante atual. A inclinação aparente no céu depende da sua localização e não é reproduzida nesta vista.</p>
      <LuaCiclo moon={moon} south={south} />
      <section aria-labelledby="lunar-next-title" className="temporal-section lua-proximas-secao"><div className="temporal-section-heading"><h3 id="lunar-next-title">Próximas fases principais</h3><span>Horários em {timeZone}</span></div>
        <ol className="lua-proximas">{upcoming.map((event, index) => <li key={event.at.toISOString()} className="lua-quarto ds-pane" data-primeiro={index === 0 || undefined}><MoonDisc phaseAngle={event.quarter === 0 ? 180 : event.quarter === 2 ? 0 : 90} waxing={event.quarter < 2} south={south} /><span>{index === 0 ? 'Próxima fase' : 'Depois'}</span><h4>{event.name}</h4><time dateTime={event.at.toISOString()}>{dateLabel(event.at)} · {event.at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time></li>)}</ol>
      </section>
      <Link className="temporal-journey-link" to="/temporal/mes"><span><strong>Encontre espaço no seu mês</strong><small>Volte ao planejamento das suas atividades.</small></span><ArrowRight size={20} /></Link>
      <details className="temporal-source"><summary>Sobre esta visualização</summary><p>Efemérides calculadas localmente com Astronomy Engine. Mapas de superfície: <a href="https://svs.gsfc.nasa.gov/4720/" target="_blank" rel="noreferrer">NASA’s Scientific Visualization Studio — CGI Moon Kit</a>, com dados LRO/LROC/LOLA. Sem transmissão de vídeo, simulação de eclipses ou efeitos sobre pontos e recursos do jogo.</p></details>
    </CenaDaTela>
  </TemporalLayout>;
};
