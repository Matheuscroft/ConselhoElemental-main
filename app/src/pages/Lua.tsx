import { lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { lunarSnapshot, nextLunarQuarters } from '@/components/temporal/celestial/lunar-presentation';
import { MoonDisc } from '@/components/temporal/celestial/MoonDisc';
import { useLiveDate } from '@/components/temporal/celestial/useLiveDate';
import { useHemisphereView } from '@/components/temporal/celestial/useHemisphereView';

const MoonScene = lazy(() => import('@/components/temporal/celestial/MoonScene'));
const dateLabel = (date: Date) => date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

export const Lua = () => {
  const { now, refresh } = useLiveDate();
  const [hemisphere, setHemisphere] = useHemisphereView();
  const moon = useMemo(() => lunarSnapshot(now), [now]);
  const upcoming = useMemo(() => nextLunarQuarters(now), [now]);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeLabel = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const south = hemisphere === 'south';

  return <TemporalLayout title="Lua" subtitle="Acompanhe a luz, a fase e os próximos marcos do ciclo lunar." className="temporal-lunar">
    <section className="lunar-observatory" aria-labelledby="lunar-phase-title">
      <div className="lunar-visual" role="img" aria-label={`${moon.name}, ${(moon.illuminated * 100).toFixed(1)}% iluminada. Vista de referência do hemisfério ${south ? 'Sul' : 'Norte'}.`}>
        <div className="lunar-orbit-line" aria-hidden="true" />
        <Suspense fallback={<div className="celestial-moon-render"><div className="celestial-moon-fallback"><MoonDisc phaseAngle={moon.phaseAngle} waxing={moon.waxing} south={south} /></div></div>}><MoonScene moon={moon} south={south} /></Suspense>
      </div>
      <div className="lunar-reading">
        <p className="temporal-eyebrow">Lua agora · {dateLabel(now)}</p>
        <h3 id="lunar-phase-title">{moon.name}</h3>
        <p className="lunar-description">{moon.waxing ? 'A porção iluminada está aumentando ao longo do ciclo.' : 'A porção iluminada está diminuindo ao longo do ciclo.'}</p>
        <dl className="lunar-facts"><div><dt>Superfície iluminada</dt><dd>{(moon.illuminated * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}<small>%</small></dd></div><div><dt>Distância da Terra</dt><dd>{Math.round(moon.distanceKm).toLocaleString('pt-BR')}<small>km</small></dd></div></dl>
        <label className="temporal-select">Orientação de referência<select value={hemisphere} onChange={(event) => setHemisphere(event.target.value === 'north' ? 'north' : 'south')}><option value="south">Hemisfério Sul</option><option value="north">Hemisfério Norte</option></select></label>
        <div className="lunar-update"><span>Atualizada às <time dateTime={now.toISOString()}>{timeLabel}</time><small>Atualização automática a cada minuto</small></span><button type="button" className="temporal-icon-button" onClick={refresh} aria-label="Atualizar Lua agora"><RefreshCw size={17} /></button></div>
      </div>
    </section>
    <p className="temporal-note">Vista 3D calculada para o instante atual. A inclinação aparente no céu depende da sua localização e não é reproduzida nesta vista.</p>
    <section aria-labelledby="lunar-next-title" className="temporal-section"><div className="temporal-section-heading"><h3 id="lunar-next-title">Próximas fases principais</h3><span>Horários em {timeZone}</span></div>
      <ol className="lunar-upcoming">{upcoming.map((event, index) => <li key={event.at.toISOString()}><MoonDisc phaseAngle={event.quarter === 0 ? 180 : event.quarter === 2 ? 0 : 90} waxing={event.quarter < 2} south={south} /><div><span>{index === 0 ? 'Próxima fase' : 'Depois'}</span><h4>{event.name}</h4><time dateTime={event.at.toISOString()}>{dateLabel(event.at)} · {event.at.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time></div></li>)}</ol>
    </section>
    <Link className="temporal-journey-link" to="/temporal/mes"><span><strong>Encontre espaço no seu mês</strong><small>Volte ao planejamento das suas atividades.</small></span><ArrowRight size={20} /></Link>
    <details className="temporal-source"><summary>Sobre esta visualização</summary><p>Efemérides calculadas localmente com Astronomy Engine. Mapas de superfície: <a href="https://svs.gsfc.nasa.gov/4720/" target="_blank" rel="noreferrer">NASA’s Scientific Visualization Studio — CGI Moon Kit</a>, com dados LRO/LROC/LOLA. Sem transmissão de vídeo, simulação de eclipses ou efeitos sobre pontos e recursos do jogo.</p></details>
  </TemporalLayout>;
};
