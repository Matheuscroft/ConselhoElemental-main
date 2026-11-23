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

interface Diag { fps: number; triangulos: number; chamadas: number; backend: string; px: string }

export function PainelGrimorio() {
  const [aberto, setAberto] = useState(false);
  const [nivel, setNivel] = useState<NivelGrimorio | 'auto'>('auto');
  const [fim, setFim] = useState<string | null>(null);
  const [diag, setDiag] = useState<Diag | null>(null);
  const controle = useRef<ControleGrimorio3D | null>(null);

  useEffect(() => {
    if (!aberto) return;
    let quadros = 0, inicio = performance.now(), raf = 0;
    const contar = () => { quadros += 1; raf = requestAnimationFrame(contar); };
    raf = requestAnimationFrame(contar);
    const id = window.setInterval(() => {
      const agora = performance.now();
      const fps = (quadros * 1000) / (agora - inicio); quadros = 0; inicio = agora;
      const d = controle.current?.diagnostico();
      setDiag(d ? { fps, triangulos: d.triangulos, chamadas: d.chamadas, backend: d.backend, px: `${d.largura}×${d.altura} @${d.pixelRatio}` } : { fps, triangulos: 0, chamadas: 0, backend: '—', px: '—' });
    }, 1000);
    return () => { cancelAnimationFrame(raf); window.clearInterval(id); };
  }, [aberto]);

  return (
    <>
      <Bloco titulo="Grimório" nota="A abertura de primeiro acesso, ensaiada. Nada aqui marca a abertura como vista nem mexe nos seus dados. Com um nível escolhido à mão, a queda automática para a versão estática fica desligada.">
        <Escolha rotulo="Nível" valor={nivel} opcoes={NIVEIS} aoMudar={setNivel} />
        <Acao primaria aoClicar={() => { setFim(null); setAberto(true); }}>Abrir o grimório</Acao>
        {fim ? <p className="lab-nota">{fim}</p> : null}
      </Bloco>
      <BlocoTrilha />
      {aberto ? createPortal(
        <Suspense fallback={null}>
          <GrimorioCena
            bancada={{ nivel: nivel === 'auto' ? undefined : nivel, aoControle: (c) => { controle.current = c; (window as unknown as { __grimorio?: unknown }).__grimorio = c; } }}
            onSkip={() => { setAberto(false); setFim('Pulado.'); }}
            onComplete={({ soundEnabled }) => { setAberto(false); setFim(`Concluído${soundEnabled ? ', com som' : ''}.`); }}
          />
          {diag ? (
            <output className="lab-grimorio-diag" aria-live="off">
              {diag.backend} · {Math.round(diag.fps)} qps · {diag.triangulos.toLocaleString('pt-BR')} tri · {diag.chamadas} chamadas · {diag.px}
            </output>
          ) : null}
        </Suspense>,
        document.body,
      ) : null}
    </>
  );
}

export default PainelGrimorio;
