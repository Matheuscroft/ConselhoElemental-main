import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Acao, Bloco, Escolha } from '@/components/laboratorio/controles';
import type { NivelGrimorio } from '@/lib/intro/qualidade';
import type { ControleGrimorio3D } from '@/components/intro/cena';
import type { EnsaioTrilha, FaixaTrilha } from '@/lib/intro/som';

/** The grimoire, rehearsed: same component the first run will use, opened here on demand. */
const GrimorioCena = lazy(() => import('@/components/intro/GrimorioCena'));

const NIVEIS: ReadonlyArray<{ valor: NivelGrimorio | 'auto'; texto: string }> = [
  { valor: 'auto', texto: 'Automático' }, { valor: 'A', texto: 'A · WebGPU' }, { valor: 'B', texto: 'B · WebGL2' }, { valor: 'C', texto: 'C · estático' },
];

type Haste = Exclude<FaixaTrilha, 'base'>;
const HASTES: ReadonlyArray<{ id: Haste; texto: string }> = [
  { id: 'agua', texto: 'Água' }, { id: 'terra', texto: 'Terra' }, { id: 'fogo', texto: 'Fogo' }, { id: 'ar', texto: 'Ar' },
];

/** The score alone: base loop, each element's stem on and off (in phase), and the Seal's resolution. */
function BlocoTrilha() {
  const [fase, setFase] = useState<'parada' | 'carregando' | 'tocando' | 'erro'>('parada');
  const [ativas, setAtivas] = useState<ReadonlySet<Haste>>(new Set());
  const [pos, setPos] = useState('');
  const ensaio = useRef<EnsaioTrilha | null>(null);
  const acordes = useRef<readonly string[]>([]);
  const compasso = useRef(1);

  useEffect(() => () => { void ensaio.current?.encerrar(); ensaio.current = null; }, []);
  useEffect(() => {
    if (fase !== 'tocando') return;
    const id = window.setInterval(() => {
      const p = ensaio.current?.posicao();
      if (p == null) { setPos('Selo: a resolução toca; o laço volta do 1º compasso…'); return; }
      const c = Math.floor(p / compasso.current);
      setPos(`Compasso ${c + 1} de 12 · ${acordes.current[c] ?? ''} · ${p.toFixed(1).replace('.', ',')} s de 32`);
    }, 200);
    return () => window.clearInterval(id);
  }, [fase]);

  const tocar = async () => {
    setFase('carregando');
    try {
      const som = await import('@/lib/intro/som');
      acordes.current = som.ACORDES_TRILHA; compasso.current = som.COMPASSO_TRILHA;
      const e = som.criarEnsaioTrilha();
      ensaio.current = e;
      await e.iniciar();
      e.tocar();
      setAtivas(new Set());
      setFase('tocando');
    } catch {
      setFase('erro');
    }
  };
  const parar = () => { void ensaio.current?.encerrar(); ensaio.current = null; setFase('parada'); setAtivas(new Set()); setPos(''); };
  const alternar = (h: Haste) => {
    const ligada = ensaio.current?.alternar(h) ?? false;
    setAtivas((a) => { const n = new Set(a); if (ligada) n.add(h); else n.delete(h); return n; });
  };

  return (
    <Bloco titulo="Trilha" nota="A música sozinha, sem os efeitos: a base em laço (tema nas trompas) e a haste de cada elemento, que entra e sai no compasso. O Selo toca a resolução e o laço volta do começo. Use fone ou o alto-falante do aparelho.">
      {fase === 'tocando'
        ? <Acao aoClicar={parar}>Parar a trilha</Acao>
        : <Acao primaria aoClicar={() => { void tocar(); }}>{fase === 'carregando' ? 'Carregando…' : 'Tocar a trilha'}</Acao>}
      <div className="lab-campo" role="group" aria-label="Hastes dos elementos">
        <span className="lab-rotulo">Hastes</span>
        <div className="lab-segmentos">
          {HASTES.map((h) => (
            <button key={h.id} type="button" aria-pressed={ativas.has(h.id)} disabled={fase !== 'tocando'} onClick={() => alternar(h.id)}>{h.texto}</button>
          ))}
        </div>
      </div>
      <Acao aoClicar={() => ensaio.current?.selo()}>Tocar o Selo</Acao>
      {pos ? <p className="lab-trilha-pos" aria-live="off">{pos}</p> : null}
      {fase === 'erro' ? <p className="lab-nota">A trilha não carregou (Web Audio indisponível ou arquivos fora do ar).</p> : null}
    </Bloco>
  );
}

interface Diag { linhas: string[] }

const HZ: ReadonlyArray<{ valor: 'auto' | '60' | '120'; texto: string }> = [
  { valor: 'auto', texto: 'Medido' }, { valor: '60', texto: '60 Hz' }, { valor: '120', texto: '120 Hz' },
];
const TRANSICOES: ReadonlyArray<{ valor: 'historia' | 'fade'; texto: string }> = [
  { valor: 'historia', texto: 'Entrar na história' }, { valor: 'fade', texto: 'Fade simples' },
];
const VELOCIDADES: ReadonlyArray<{ valor: '1' | '0.5' | '0.25'; texto: string }> = [
  { valor: '1', texto: 'Normal' }, { valor: '0.5', texto: 'Lenta ½' }, { valor: '0.25', texto: 'Lenta ¼' },
];
const INICIOS: ReadonlyArray<{ valor: 'inicio' | 'final'; texto: string }> = [
  { valor: 'inicio', texto: 'Cerimônia inteira' }, { valor: 'final', texto: 'Só a transição' },
];

const ms = (v: number | null | undefined) => (v == null ? '—' : `${v.toFixed(1).replace('.', ',')} ms`);

export function PainelGrimorio() {
  const [aberto, setAberto] = useState(false);
  const [nivel, setNivel] = useState<NivelGrimorio | 'auto'>('auto');
  const [hz, setHz] = useState<'auto' | '60' | '120'>('auto');
  const [transicao, setTransicao] = useState<'historia' | 'fade'>('historia');
  const [velocidade, setVelocidade] = useState<'1' | '0.5' | '0.25'>('1');
  const [inicio, setInicio] = useState<'inicio' | 'final'>('inicio');
  const [fim, setFim] = useState<string | null>(null);
  const [medida, setMedida] = useState<string | null>(null);
  const [diag, setDiag] = useState<Diag | null>(null);
  const controle = useRef<ControleGrimorio3D | null>(null);

  useEffect(() => {
    if (!aberto) return;
    // tarefas longas (> 50 ms na thread principal): o Safari não tem esta API, então aparece "n/d"
    let longas = 0, maior = 0, suportado = false;
    let obs: PerformanceObserver | null = null;
    try {
      if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        obs = new PerformanceObserver((lista) => { for (const e of lista.getEntries()) { longas += 1; maior = Math.max(maior, e.duration); } });
        obs.observe({ type: 'longtask', buffered: false }); suportado = true;
      }
    } catch { suportado = false; }
    const id = window.setInterval(() => {
      const c = controle.current;
      const d = c?.diagnostico();
      if (!c || !d) { setDiag({ linhas: ['nível C · estático (sem 3D)'] }); return; }
      const r = d.ritmo;
      setDiag({
        linhas: [
          `nível ${c.nivel} · ${d.backend} · ${d.triangulos.toLocaleString('pt-BR')} tri · ${d.chamadas} chamadas`,
          `tela ${r.telaHz ?? '…'} Hz → alvo ${r.alvoHz} Hz${r.travado60 ? ' (travado em 60)' : ''}`,
          `quadro p50 ${ms(r.p50)} · p95 ${ms(r.p95)} · perdidos ${r.perdidos}`,
          `CPU p95 ${ms(r.custoP95)} · tarefas longas ${suportado ? `${longas}${longas ? ` (máx ${Math.round(maior)} ms)` : ''}` : 'n/d'}`,
          `entrada→quadro p50 ${ms(r.entradaP50)} · p95 ${ms(r.entradaP95)}`,
          `escala ${r.escala} · ${d.largura}×${d.altura} @${d.pixelRatio.toFixed(2).replace('.', ',')}`,
        ],
      });
    }, 500);
    return () => { window.clearInterval(id); obs?.disconnect(); };
  }, [aberto]);

  return (
    <>
      <Bloco titulo="Grimório" nota="A abertura de primeiro acesso, ensaiada. Nada aqui marca a abertura como vista nem mexe nos seus dados. Com um nível escolhido à mão, a queda automática para a versão estática fica desligada. O medidor aparece no canto da cerimônia.">
        <Escolha rotulo="Nível" valor={nivel} opcoes={NIVEIS} aoMudar={setNivel} />
        <Escolha rotulo="Taxa de quadros" valor={hz} opcoes={HZ} aoMudar={setHz} />
        <Escolha rotulo="Transição final" valor={transicao} opcoes={TRANSICOES} aoMudar={setTransicao} />
        <Escolha rotulo="Velocidade da transição" valor={velocidade} opcoes={VELOCIDADES} aoMudar={setVelocidade} />
        <Escolha rotulo="Começar" valor={inicio} opcoes={INICIOS} aoMudar={setInicio} />
        <Acao primaria aoClicar={() => { setFim(null); setMedida(null); setAberto(true); }}>Abrir o grimório</Acao>
        {fim ? <p className="lab-nota">{fim}</p> : null}
        {medida ? <p className="lab-trilha-pos">{medida}</p> : null}
      </Bloco>
      <BlocoTrilha />
      {aberto ? createPortal(
        <Suspense fallback={null}>
          <GrimorioCena
            bancada={{
              nivel: nivel === 'auto' ? undefined : nivel,
              hz: hz === 'auto' ? null : (Number(hz) as 60 | 120),
              transicao,
              velocidade: Number(velocidade),
              inicio: inicio === 'final' ? 'final' : undefined,
              aoControle: (c) => { controle.current = c; (window as unknown as { __grimorio?: unknown }).__grimorio = c; },
              aoMedirTransicao: (m) => setMedida(`Transição a ${m.alvoHz} Hz: p95 ${ms(m.p95)} · ${m.perdidos} perdidos · CPU p95 ${ms(m.custoP95)} · ${m.quadros} quadros`),
            }}
            onSkip={() => { setAberto(false); setDiag(null); setFim('Pulado.'); }}
            onComplete={({ soundEnabled }) => { setAberto(false); setDiag(null); setFim(`Concluído${soundEnabled ? ', com som' : ''}.`); }}
          />
          {diag ? (
            <output className="lab-grimorio-diag" aria-live="off">
              {diag.linhas.map((l) => <span key={l.slice(0, 6)}>{l}</span>)}
            </output>
          ) : null}
        </Suspense>,
        document.body,
      ) : null}
    </>
  );
}

export default PainelGrimorio;
