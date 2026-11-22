import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Acao, Bloco, Escolha } from '@/components/laboratorio/controles';
import type { NivelGrimorio } from '@/lib/intro/qualidade';
import type { ControleGrimorio3D } from '@/components/intro/cena';

/** The grimoire, rehearsed: same component the first run will use, opened here on demand. */
const GrimorioCena = lazy(() => import('@/components/intro/GrimorioCena'));

const NIVEIS: ReadonlyArray<{ valor: NivelGrimorio | 'auto'; texto: string }> = [
  { valor: 'auto', texto: 'Automático' }, { valor: 'A', texto: 'A · WebGPU' }, { valor: 'B', texto: 'B · WebGL2' }, { valor: 'C', texto: 'C · estático' },
];

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
      <Bloco titulo="Grimório" nota="A abertura de primeiro acesso, ensaiada. Nada aqui marca a abertura como vista nem mexe nos seus dados.">
        <Escolha rotulo="Nível" valor={nivel} opcoes={NIVEIS} aoMudar={setNivel} />
        <Acao primaria aoClicar={() => { setFim(null); setAberto(true); }}>Abrir o grimório</Acao>
        {fim ? <p className="lab-nota">{fim}</p> : null}
      </Bloco>
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
