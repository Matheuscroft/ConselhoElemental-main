import { lazy, Suspense, type CSSProperties } from 'react';
import { RefreshCw } from 'lucide-react';
import { Contagem } from '@/components/motion/Contagem';
import { MoonDisc } from '@/components/temporal/celestial/MoonDisc';
import type { LunarSnapshot } from '@/components/temporal/celestial/lunar-presentation';
import { luzDaLua, porcentagemIluminada } from '@/lib/temporal/ceu-dos-ciclos';
import { ABERTURA_DA_TELA_MS, useDeZero, useEntradaDaCena } from '@/components/mais/useCenaDaTela';
import './ceu-paginas.css';

const MoonScene = lazy(() => import('@/components/temporal/celestial/MoonScene'));

const DIA_MS = 86_400_000;
/** A synodic month, in days. */
const MES_LUNAR = 29.53;

const dataCurta = (data: Date) => data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
const hora = (data: Date) => data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Small deterministic generator: the same sky every time, so a redraw never reshuffles the stars. */
function semente(valor: number) {
  let s = valor >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Estrela { readonly x: number; readonly y: number; readonly tamanho: number; readonly atraso: number; readonly ciclo: number }

const ESTRELAS: readonly Estrela[] = (() => {
  const rnd = semente(2026);
  return Array.from({ length: 30 }, () => ({
    x: Math.round(rnd() * 1000) / 10,
    y: Math.round(rnd() * 1000) / 10,
    tamanho: rnd() < 0.2 ? 3 : 2,
    atraso: Math.round(rnd() * 90) / 10,
    ciclo: 4 + Math.round(rnd() * 30) / 10,
  }));
})();

const diaDoCiclo = (longitude: number) => Math.min(30, Math.floor((longitude / 360) * MES_LUNAR) + 1);

/** Days from now to `data`, in whole days (rounded up), and the hours when it is less than a day. */
function faltam(data: Date, agora: Date) {
  const ms = Math.max(0, data.getTime() - agora.getTime());
  return { dias: Math.ceil(ms / DIA_MS), horas: Math.max(1, Math.ceil(ms / 3_600_000)) };
}

export interface LuaPalcoProps {
  readonly moon: LunarSnapshot;
  readonly south: boolean;
  readonly now: Date;
  readonly proxima: { readonly name: string; readonly quarter: number; readonly at: Date } | undefined;
  readonly hemisphere: 'north' | 'south';
  readonly onHemisphere: (valor: 'north' | 'south') => void;
  readonly onAtualizar: () => void;
}

/**
 * The Moon as the protagonist: the real sphere in a sky of its own stars, its
 * halo and two slow rings, and over its lower edge the screen's one pane of
 * glass with the phase, the share that is lit and what comes next. It reads
 * the same snapshot the page always read.
 */
export function LuaPalco({ moon, south, now, proxima, hemisphere, onHemisphere, onAtualizar }: LuaPalcoProps) {
  const entrada = useEntradaDaCena();
  const luz = luzDaLua({ illuminated: moon.illuminated, waxing: moon.waxing }, south);
  const porcentagem = porcentagemIluminada(moon.illuminated);
  const mostrada = useDeZero(porcentagem, ABERTURA_DA_TELA_MS / 2, entrada === 'plena');
  const falta = proxima ? faltam(proxima.at, now) : null;
  const diasParaProxima = useDeZero(falta?.dias ?? 0, ABERTURA_DA_TELA_MS / 2, entrada === 'plena');
  const timeLabel = hora(now);

  return (
    <section className="lua-palco" aria-labelledby="lunar-phase-title" style={{ '--lua-halo': luz.halo.toFixed(3), '--lua-estrelas': luz.estrelas.toFixed(3) } as CSSProperties}>
      <div className="lua-ceu" role="img" aria-label={`${moon.name}, ${(moon.illuminated * 100).toFixed(1)}% iluminada. Vista de referência do hemisfério ${south ? 'Sul' : 'Norte'}.`}>
        <div className="lua-estrelas" aria-hidden="true">
          {ESTRELAS.map((e, i) => (
            <span key={i} className="lua-estrela" style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.tamanho, height: e.tamanho, '--e-atraso': e.atraso, '--e-ciclo': e.ciclo } as CSSProperties} />
          ))}
        </div>
        <div className="lua-halo" aria-hidden="true" />
        <div className="lua-aneis" aria-hidden="true"><span className="lua-anel" /><span className="lua-anel lua-anel-contra" /></div>
        <div className="lua-esfera">
          <Suspense fallback={<div className="celestial-moon-render"><div className="celestial-moon-fallback"><MoonDisc phaseAngle={moon.phaseAngle} waxing={moon.waxing} south={south} /></div></div>}>
            <MoonScene moon={moon} south={south} />
          </Suspense>
        </div>
      </div>

      <div className="cena-vidro lua-vidro">
        <span className="cena-vidro-luz" aria-hidden="true" />
        <div className="lua-painel ds-glass-float" data-luz="">
          <div className="lua-cabeca">
            <div className="lua-nome">
              <p className="temporal-eyebrow">Lua agora · {dataCurta(now)}</p>
              <h3 id="lunar-phase-title">{moon.name}</h3>
            </div>
            <p className="lua-pct" aria-hidden="true">
              <span className="lua-pct-numero"><Contagem valor={mostrada} formatar={(v) => v.toLocaleString('pt-BR')} /><small>%</small></span>
              <span className="lua-pct-rotulo">iluminada</span>
            </p>
          </div>
          <p className="lunar-description">{moon.waxing ? 'A porção iluminada está aumentando ao longo do ciclo.' : 'A porção iluminada está diminuindo ao longo do ciclo.'}</p>
          <dl className="lua-fatos">
            <div><dt>Distância da Terra</dt><dd>{Math.round(moon.distanceKm).toLocaleString('pt-BR')}<small>km</small></dd></div>
            <div><dt>Dia do ciclo</dt><dd>{diaDoCiclo(moon.longitude)}<small>de cerca de 30</small></dd></div>
          </dl>
          {proxima && falta ? (
            <div className="lua-proxima">
              <MoonDisc phaseAngle={proxima.quarter === 0 ? 180 : proxima.quarter === 2 ? 0 : 90} waxing={proxima.quarter < 2} south={south} />
              <div>
                <span>Próxima fase</span>
                <strong>{proxima.name}</strong>
                <time dateTime={proxima.at.toISOString()}>
                  {falta.dias >= 1
                    ? <>em <Contagem valor={diasParaProxima} /> {falta.dias === 1 ? 'dia' : 'dias'}</>
                    : <>em {falta.horas} {falta.horas === 1 ? 'hora' : 'horas'}</>}
                  {' · '}{dataCurta(proxima.at)}, {hora(proxima.at)}
                </time>
              </div>
            </div>
          ) : null}
          <label className="temporal-select">Orientação de referência<select value={hemisphere} onChange={(event) => onHemisphere(event.target.value === 'north' ? 'north' : 'south')}><option value="south">Hemisfério Sul</option><option value="north">Hemisfério Norte</option></select></label>
          <div className="lunar-update"><span>Atualizada às <time dateTime={now.toISOString()}>{timeLabel}</time><small>Atualização automática a cada minuto</small></span><button type="button" className="temporal-icon-button" onClick={onAtualizar} aria-label="Atualizar Lua agora"><RefreshCw size={17} /></button></div>
        </div>
      </div>
    </section>
  );
}

/** The eight names of the month, with the phase angle and side each disc is drawn with (the Sun-Moon angle falls to 0 at full). */
const FASES = [
  { nome: 'Lua Nova', graus: 0 },
  { nome: 'Lua Crescente', graus: 45 },
  { nome: 'Quarto Crescente', graus: 90 },
  { nome: 'Gibosa Crescente', graus: 135 },
  { nome: 'Lua Cheia', graus: 180 },
  { nome: 'Gibosa Minguante', graus: 225 },
  { nome: 'Quarto Minguante', graus: 270 },
  { nome: 'Lua Balsâmica', graus: 315 },
] as const;

/** The month as a line that draws itself: eight discs, the stretch already travelled lit, and a marker where the Moon is. */
export function LuaCiclo({ moon, south }: { moon: LunarSnapshot; south: boolean }) {
  // The last disc is the balsamic one at 315 degrees; past it the line is full.
  const posicao = Math.min(moon.longitude, 315) / 315;
  return (
    <section className="lua-ciclo" aria-labelledby="lua-ciclo-titulo">
      <div className="temporal-section-heading"><h3 id="lua-ciclo-titulo">O ciclo do mês</h3><span>Dia {diaDoCiclo(moon.longitude)} de cerca de 30</span></div>
      <div className="lua-trilho" style={{ '--pos': posicao.toFixed(4) } as CSSProperties}>
        <span className="lua-linha" aria-hidden="true"><span className="lua-linha-feita" /></span>
        <span className="lua-agora-trilho" aria-hidden="true"><span className="lua-agora" /></span>
        <ol className="lua-fases">
          {FASES.map((fase) => {
            const atual = fase.nome === moon.name;
            return (
              <li key={fase.nome} className="lua-fase" data-atual={atual || undefined}>
                <MoonDisc phaseAngle={Math.abs(180 - fase.graus)} waxing={fase.graus < 180} south={south} />
                <span className="lua-fase-nome">{fase.nome}{atual ? ', fase atual' : ''}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
