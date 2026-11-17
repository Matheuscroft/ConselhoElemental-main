import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ACENTO, AURA, TINTA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import type { Noticia } from './fila';
import './noticia-elemental.css';

const NOME: Record<string, string> = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
const NIVEL: Record<number, string> = { 2: 'Fluxo', 3: 'Domínio' };
/** Time on screen before it leaves by itself. Hovering or focusing pauses it. */
export const TEMPO_NA_TELA = 3200;
const FAISCAS = [0, 1, 2, 3, 4, 5, 6, 7] as const;
/** An upward drag longer than this dismisses the notice, like a toast swiped back to the top. */
const DESLIZE_PARA_FECHAR = 36;

/** The value a counter should read: zero for one beat, then the exact value, so it visibly counts. Final at once when there is no motion. */
function useChegada(valor: number, direto: boolean) {
  const [chegou, setChegou] = useState(false);
  useEffect(() => {
    if (direto) return undefined;
    const t = setTimeout(() => setChegou(true), DURATION.press);
    return () => clearTimeout(t);
  }, [direto]);
  return direto || chegou ? valor : 0;
}

export interface NoticiaElementalProps {
  noticia: Noticia;
  onFechar?: (id: string) => void;
  /** Ascension nobody heard: the button that goes to the frame. */
  onVer?: () => void;
  /** Server rendering and tests: no timers. */
  semTemporizador?: boolean;
}

export function NoticiaElemental({ noticia, onFechar, onVer, semTemporizador = false }: NoticiaElementalProps) {
  const { elemento, tipo } = noticia;
  const [saindo, setSaindo] = useState(false);
  const pausado = useRef(false);
  const restante = useRef(TEMPO_NA_TELA);
  const inicio = useRef(0);
  const relogio = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toqueY = useRef<number | null>(null);
  const reduzido = useMotionPreference();
  const xpMostrado = useChegada(noticia.xp, semTemporizador || reduzido);
  const qtdMostrada = useChegada(noticia.quantidade ?? 0, semTemporizador || reduzido);
  const [mostrarBotao] = useState(Boolean(noticia.semTela && onVer));

  const fechar = useCallback(() => {
    clearTimeout(relogio.current);
    setSaindo(true);
    relogio.current = setTimeout(() => onFechar?.(noticia.id), DURATION.reveal);
  }, [noticia.id, onFechar]);

  const armar = useCallback(() => {
    clearTimeout(relogio.current);
    inicio.current = Date.now();
    relogio.current = setTimeout(fechar, restante.current);
  }, [fechar]);

  useEffect(() => {
    if (semTemporizador) return undefined;
    armar();
    return () => clearTimeout(relogio.current);
  }, [armar, semTemporizador]);

  const pausar = () => {
    if (semTemporizador || pausado.current || saindo) return;
    pausado.current = true;
    clearTimeout(relogio.current);
    restante.current = Math.max(TEMPO_NA_TELA / 2, restante.current - (Date.now() - inicio.current));
  };
  const retomar = () => {
    if (semTemporizador || !pausado.current || saindo) return;
    pausado.current = false;
    armar();
  };

  const variante = elemento ?? 'neutro';
  const rotulo = elemento ? NOME[elemento] : tipo === 'resumo' ? 'Conclusões' : 'Conclusão';
  const nivelNome = NIVEL[noticia.nivel ?? 2];
  const titulo = tipo === 'ascensao' ? `${nivelNome} · ${rotulo}` : noticia.nome;
  const estilo = elemento
    ? ({ '--noticia-acento': ACENTO[elemento], '--noticia-aura': AURA[elemento], '--noticia-tinta': TINTA[elemento] } as CSSProperties)
    : undefined;
  const classe = [
    'noticia', `noticia--${variante}`, `noticia--${tipo}`,
    tipo === 'ascensao' && noticia.nivel === 3 ? 'noticia--dominio' : '',
    !elemento && tipo === 'resumo' ? 'noticia--mista' : '',
    saindo ? 'is-saindo' : '',
  ].filter(Boolean).join(' ');

  const aoPressionar = (e: PointerEvent) => { toqueY.current = e.clientY; };
  const aoSoltar = (e: PointerEvent) => {
    if (toqueY.current !== null && toqueY.current - e.clientY > DESLIZE_PARA_FECHAR && !saindo) fechar();
    toqueY.current = null;
  };

  return (
    <div
      role="status" aria-live="polite" aria-atomic="true"
      className={classe} style={estilo}
      data-elemento={variante} data-tipo={tipo}
      onPointerEnter={pausar} onPointerLeave={retomar} onFocus={pausar} onBlur={retomar}
      onPointerDown={aoPressionar} onPointerUp={aoSoltar} onPointerCancel={() => { toqueY.current = null; }}
    >
      <span className="noticia__selo" aria-hidden="true">
        <svg className="noticia__anel" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" pathLength="1" /></svg>
        {tipo === 'ascensao' && <svg className="noticia__anel noticia__anel--duplo" viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" pathLength="1" /></svg>}
        {FAISCAS.map((i) => <i key={i} style={{ '--faisca': i } as CSSProperties} />)}
        <span className="noticia__icone">
          {tipo === 'resumo'
            ? <Contagem valor={qtdMostrada} className="noticia__contador" />
            : elemento ? <ElementIcon element={elemento} size="1.6em" /> : <ArcaneIcon name="ciclo" size="1.6em" />}
        </span>
      </span>
      <span className="noticia__texto">
        {tipo === 'ascensao' && <span className="noticia__nivel">{nivelNome}</span>}
        <span className="noticia__nome">{tipo === 'ascensao' ? rotulo : noticia.nome}</span>
        <span className="noticia__rotulo">{tipo === 'ascensao' ? 'Seu quadro evoluiu' : rotulo}</span>
      </span>
      {noticia.xp > 0 && (
        <span className="noticia__xp">
          <span className="noticia__sr">+{noticia.xp} XP</span>
          <span aria-hidden="true"><Contagem valor={xpMostrado} formatar={(v) => `+${v} XP`} className="noticia__xp-conta" /></span>
        </span>
      )}
      {mostrarBotao && (
        <button type="button" className="noticia__ver" onClick={() => { onVer?.(); fechar(); }}>Ver na borda</button>
      )}
      <button type="button" className="noticia__fechar" aria-label={`Dispensar: ${titulo}`} onClick={fechar}>
        <span aria-hidden="true">×</span>
      </button>
      {!semTemporizador && <span className="noticia__tempo" aria-hidden="true" />}
    </div>
  );
}
