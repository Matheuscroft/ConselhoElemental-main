import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { lunarSnapshot } from '@/components/temporal/celestial/lunar-presentation';
import type { SanctuaryCityId } from '@/lib/temporal/sanctuary-city';
import {
  avancar, avancarPorToque, elementoAtual, encerrado, ESTADO_INICIAL, type EstadoGrimorio, type SinalGrimorio,
} from '@/lib/intro/cerimonia';
import { criarMonitorQuadros, nivelInicial, type NivelGrimorio } from '@/lib/intro/qualidade';
import { INSTRUCAO, LENDA, LENDA_INTEIRA, oracoesVisiveis, TEXTO, TOTAL_ORACOES } from '@/lib/intro/textos';
import { criarSomGrimorio, type SomGrimorio } from '@/lib/intro/som';
import type { ControleGrimorio3D, PontoTela } from './cena';
import './grimorio.css';

/**
 * The first-run grimoire: replaces the old awakening scene with the same contract.
 *
 * `onComplete({ soundEnabled })` = the ceremony was done; `onSkip` = it was skipped. Both are called
 * exactly once. Nothing here reads or writes progress, scoring, the account or storage: the parent
 * remembers that the opening was seen, exactly as before.
 */
export interface GrimorioCenaProps {
  readonly at?: Date;
  readonly cityId?: SanctuaryCityId;
  readonly onSkip?: () => void;
  readonly onComplete?: (detail: { soundEnabled: boolean }) => void;
  /** Laboratory only: start straight on a beat, or force a level. */
  readonly bancada?: { readonly nivel?: NivelGrimorio; readonly aoControle?: (c: ControleGrimorio3D | null) => void };
}

const reduzMovimento = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const temWebGPU = () => typeof navigator !== 'undefined' && 'gpu' in navigator;
const temWebGL2 = () => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

const reducer = (estado: EstadoGrimorio, sinal: SinalGrimorio) => avancar(estado, sinal, TOTAL_ORACOES);

export function GrimorioCena({ at, onSkip, onComplete, bancada }: GrimorioCenaProps) {
  const momento = useMemo(() => at ?? new Date(), [at]);
  const lua = useMemo(() => lunarSnapshot(momento), [momento]);
  const [nivel, setNivel] = useState<NivelGrimorio>(() => bancada?.nivel ?? nivelInicial({
    movimentoReduzido: reduzMovimento(), webgpu: temWebGPU(), webgl2: temWebGL2(),
  }));
  const [estado, enviar] = useReducer(reducer, ESTADO_INICIAL);
  const [pronta, setPronta] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [alvoFecho, setAlvoFecho] = useState<PontoTela | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [somLigado, setSomLigado] = useState(false);
  const [somIniciado, setSomIniciado] = useState(false);
  const somRef = useRef<SomGrimorio | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cenaRef = useRef<ControleGrimorio3D | null>(null);
  const entregue = useRef(false);

  /* ---------------- 3D sob demanda ---------------- */
  useEffect(() => {
    if (nivel === 'C') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let vivo = true;
    let controle: ControleGrimorio3D | null = null;
    const monitor = criarMonitorQuadros();
    let estavel = 0;
    import('./cena')
      .then(({ criarGrimorio3D }) => criarGrimorio3D(canvas, {
        nivel,
        lua: { fracao: lua.illuminated, crescente: lua.waxing },
        aoQuadro: (ms, visivel) => {
          // na bancada, um nível escolhido à mão é ensaio daquele nível: sem queda automática
          if (bancada?.nivel) return;
          // mede só depois do primeiro quadro estável (meio segundo de cena visível)
          if (estavel < 30) { estavel += 1; return; }
          if (monitor.registrar(ms, visivel)) {
            console.warn('[grimório] quadros lentos: passando para a versão estática', monitor.ultimaMediana);
            setNivel('C');
          }
        },
        aoPerder: (motivo) => { console.warn('[grimório]', motivo); setNivel('C'); },
      }))
      .then((c) => {
        if (!vivo) { c.dispose(); return; }
        controle = c; cenaRef.current = c; setPronta(true);
        bancada?.aoControle?.(c);
      })
      .catch((erro) => { console.warn('[grimório] o 3D não carregou; versão estática', erro); if (vivo) setNivel('C'); });
    return () => {
      vivo = false;
      controle?.dispose(); cenaRef.current = null;
      bancada?.aoControle?.(null);
    };
    // o 3D nasce uma vez por nível; a lua não muda durante a cerimônia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel]);

  /* ---------------- alvo acessível sobre o fecho ---------------- */
  useEffect(() => {
    if (!pronta || estado.fase !== 'poster') { setAlvoFecho(null); return; }
    let quadro = 0;
    const seguir = () => {
      const p = cenaRef.current?.posicaoNaTela('cabecaFecho') ?? null;
      setAlvoFecho((ant) => (ant && p && Math.abs(ant.x - p.x) < 0.5 && Math.abs(ant.y - p.y) < 0.5 && Math.abs(ant.raio - p.raio) < 0.5 ? ant : p));
      quadro = requestAnimationFrame(seguir);
    };
    seguir();
    return () => cancelAnimationFrame(quadro);
  }, [pronta, estado.fase]);

  /* ---------------- entrega (uma vez) ---------------- */
  const entregar = useCallback((como: 'pular' | 'concluir') => {
    if (entregue.current) return;
    entregue.current = true;
    setSaindo(true);
    window.setTimeout(() => {
      if (como === 'pular') onSkip?.();
      else onComplete?.({ soundEnabled: somLigado });
    }, 300);
    void somRef.current?.encerrar(300);
  }, [onSkip, onComplete, somLigado]);

  useEffect(() => {
    if (estado.fase === 'pulado') entregar('pular');
    if (estado.fase === 'concluido') entregar('concluir');
  }, [estado.fase, entregar]);

  /* ---------------- abertura ---------------- */
  const abrir = useCallback(async () => {
    if (estado.fase !== 'poster' || ocupado) return;
    // o primeiro toque é o gesto que o iOS exige: o som nasce aqui, e o próprio trinco já soa
    if (!somRef.current) somRef.current = criarSomGrimorio();
    const som = somRef.current;
    const iniciando = som.iniciar().then(() => { setSomIniciado(som.iniciado); setSomLigado(som.iniciado && !som.mudo); });
    enviar({ tipo: 'abrir' });
    const c = cenaRef.current;
    if (!c) { enviar({ tipo: 'aberto' }); return; }
    setOcupado(true);
    await iniciando;
    await c.abrir((evento, dur) => {
      if (evento === 'toque') som.cue('fecho.toque', { pan: 0.35 });
      else if (evento === 'giro') som.cue('fecho.giro', { pan: 0.35 });
      else if (evento === 'capa') som.cue('capa', { dur });
      else if (evento === 'luz') som.cue('luz.sobe');
    });
    setOcupado(false);
    enviar({ tipo: 'aberto' });
  }, [estado.fase, ocupado]);

  /* ---------------- lenda: uma oração por vez; o toque adianta ---------------- */
  useEffect(() => {
    if (estado.fase !== 'lenda') return;
    const { paragrafo, ate } = oracoesVisiveis(estado.oracao);
    const fimParagrafo = ate === LENDA[paragrafo].length;
    const espera = fimParagrafo ? 3200 : 1500;
    somRef.current?.cue('lenda.linha');
    const id = window.setTimeout(() => enviar({ tipo: 'oracao' }), espera);
    return () => window.clearTimeout(id);
  }, [estado.fase, estado.oracao]);

  /* ---------------- som: aba oculta suspende; o botão alterna ---------------- */
  useEffect(() => {
    const vis = () => { void (document.hidden ? somRef.current?.suspender() : somRef.current?.retomar()); };
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); void somRef.current?.encerrar(300); };
  }, []);
  const alternarSom = useCallback(() => {
    const som = somRef.current; if (!som?.iniciado) return;
    som.definirMudo(!som.mudo); setSomLigado(!som.mudo);
  }, []);

  const tocarFundo = useCallback(() => {
    if (nivel === 'C') { enviar(avancarPorToqueSinal(estado)); return; }
    if (estado.fase === 'lenda') enviar({ tipo: 'oracao' });
  }, [estado, nivel]);

  const pular = useCallback(() => enviar({ tipo: 'pular' }), []);
  const comecar = useCallback(() => enviar({ tipo: 'comecar' }), []);

  /* ---------------- texto na tela ---------------- */
  const lenda = estado.fase === 'lenda' ? oracoesVisiveis(estado.oracao) : null;
  const elemento = elementoAtual(estado);
  const instrucao = estado.fase === 'poster' ? TEXTO.abrir
    : estado.fase === 'gesto' && elemento ? INSTRUCAO[elemento].gesto
    : null;

  return (
    <section className="grimorio" data-fase={estado.fase} data-nivel={nivel} data-pronta={pronta} data-saindo={saindo} aria-labelledby="grimorio-titulo">
      <h2 id="grimorio-titulo" className="sr-only">{TEXTO.titulo}</h2>
      <div className="grimorio-poster" aria-hidden="true" />
      {nivel !== 'C' ? <canvas ref={canvasRef} className="grimorio-canvas" aria-hidden="true" /> : null}
      <div className="grimorio-toque" onClick={tocarFundo} aria-hidden="true" />

      {alvoFecho && estado.fase === 'poster' ? (
        <button
          type="button"
          className="grimorio-alvo"
          style={{ left: alvoFecho.x, top: alvoFecho.y, width: Math.max(56, alvoFecho.raio * 2.4), height: Math.max(56, alvoFecho.raio * 2.4) }}
          onClick={() => void abrir()}
        >
          <span className="sr-only">{TEXTO.abrirRotulo}</span>
        </button>
      ) : null}

      <div className="grimorio-topo">
        {somIniciado ? (
          <button type="button" className="grimorio-pilula" aria-pressed={somLigado} onClick={alternarSom}>{somLigado ? TEXTO.somDesligar : TEXTO.somLigar}</button>
        ) : <span />}
        {!encerrado(estado) ? <button type="button" className="grimorio-pilula" onClick={pular}>{TEXTO.pular}</button> : null}
      </div>

      {lenda ? (
        <p className="grimorio-lenda" key={lenda.paragrafo} aria-live="polite">
          <span className="sr-only">{LENDA_INTEIRA[lenda.paragrafo]}</span>
          <span aria-hidden="true">
            {LENDA[lenda.paragrafo].map((oracao, i) => (
              <span key={oracao} className="grimorio-oracao" data-visivel={i < lenda.ate}>{oracao} </span>
            ))}
          </span>
        </p>
      ) : null}

      {estado.fase === 'final' ? (
        <p className="grimorio-lenda grimorio-final"><span className="grimorio-nome">{TEXTO.nome}</span>{TEXTO.frase}</p>
      ) : null}

      <div className="grimorio-base">
        {instrucao ? <p className="grimorio-instrucao" aria-live="polite">{instrucao}</p> : null}
        {estado.fase === 'gesto' && elemento ? <p className="grimorio-alternativa">{INSTRUCAO[elemento].toque}</p> : null}
        {nivel === 'C' && !encerrado(estado) && estado.fase !== 'final' ? <p className="grimorio-alternativa">{TEXTO.avancar}</p> : null}
        {estado.fase === 'final' ? <button type="button" className="grimorio-comecar" onClick={comecar}>{TEXTO.comecar}</button> : null}
      </div>
      <p className="sr-only" aria-live="polite">{TEXTO.progresso(estado.despertos.length)}</p>
    </section>
  );
}

/** The static version moves one beat per tap; this turns that into the signal the reducer expects. */
function avancarPorToqueSinal(estado: EstadoGrimorio): SinalGrimorio {
  const proximo = avancarPorToque(estado, TOTAL_ORACOES);
  if (proximo.fase === 'final' && estado.fase === 'conselho') return { tipo: 'conselhoAssentou' };
  if (estado.fase === 'poster') return { tipo: 'abrir' };
  if (estado.fase === 'abrindo') return { tipo: 'aberto' };
  if (estado.fase === 'lenda') return { tipo: 'lendaLida' };
  const el = elementoAtual(estado);
  if (el) return { tipo: 'despertou', elemento: el };
  return { tipo: 'comecar' };
}

export default GrimorioCena;
