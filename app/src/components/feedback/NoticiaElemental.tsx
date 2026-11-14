import { useCallback, useEffect, useRef, useState } from 'react';
import { ArcaneIcon, ElementIcon } from '@/components/elemental/ArcaneIcon';
import { ACENTO, AURA, TINTA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import type { Noticia } from './fila';
import './noticia-elemental.css';

const NOME: Record<string, string> = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
const NIVEL: Record<number, string> = { 2: 'Fluxo', 3: 'Domínio' };
/** Time on screen before it leaves by itself. Hovering or focusing pauses it. */
export const TEMPO_NA_TELA = 3200;
const FAISCAS = [0, 1, 2, 3, 4];

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
  const rotulo = elemento ? NOME[elemento] : 'Conclusão';
  const titulo = tipo === 'ascensao' ? `${NIVEL[noticia.nivel ?? 2]} · ${rotulo}` : noticia.nome;
  const estilo = elemento
    ? ({ '--noticia-acento': ACENTO[elemento], '--noticia-aura': AURA[elemento], '--noticia-tinta': TINTA[elemento] } as React.CSSProperties)
    : undefined;
  const classe = [
    'noticia', `noticia--${variante}`, `noticia--${tipo}`,
    tipo === 'ascensao' && noticia.nivel === 3 ? 'noticia--dominio' : '',
    saindo ? 'is-saindo' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      role="status" aria-live="polite" aria-atomic="true"
      className={classe} style={estilo}
      data-elemento={variante} data-tipo={tipo}
      onPointerEnter={pausar} onPointerLeave={retomar} onFocus={pausar} onBlur={retomar}
    >
      <span className="noticia__fx" aria-hidden="true">
        {FAISCAS.map((i) => <span key={i} className={`noticia__fx-${i}`} />)}
      </span>
      <span className="noticia__icone" aria-hidden="true">
        {elemento ? <ElementIcon element={elemento} size="1.6em" /> : <ArcaneIcon name="ciclo" size="1.6em" />}
      </span>
      <span className="noticia__texto">
        {tipo === 'ascensao' && <span className="noticia__nivel">{NIVEL[noticia.nivel ?? 2]}</span>}
        <span className="noticia__nome">{tipo === 'ascensao' ? rotulo : noticia.nome}</span>
        <span className="noticia__rotulo">{tipo === 'ascensao' ? 'Seu quadro evoluiu' : rotulo}</span>
      </span>
      {noticia.xp > 0 && <span className="noticia__xp">+{noticia.xp} XP</span>}
      {mostrarBotao && (
        <button type="button" className="noticia__ver" onClick={() => { onVer?.(); fechar(); }}>Ver na borda</button>
      )}
      <button type="button" className="noticia__fechar" aria-label={`Dispensar: ${titulo}`} onClick={fechar}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
