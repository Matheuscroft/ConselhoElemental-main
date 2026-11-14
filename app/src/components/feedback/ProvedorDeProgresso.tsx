import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { ativarSom, tocarConclusao, tocarConquista, tocarNivel, tocarToque } from '@/lib/audio';
import { detectarEventos, type EstadoLido } from '@/lib/progresso/eventos';
import { emitirAscensao } from '@/lib/progresso/canal';
import { CerimoniaDeNivel } from '@/components/cerimonia/CerimoniaDeNivel';
import {
  adicionarPedido, atrasoDaCerimonia, concluirPedido, pedidoAtual, progressoDoNivel, xpParaNivel,
  type PedidoDeNivel,
} from '@/lib/cerimonia/nivel';
import { NoticiaElemental } from './NoticiaElemental';
import { empilhar, intensidadeDoXp, noticiasDeConclusoes, remover, type Noticia } from './fila';

const lerEstado = (s: { habits: unknown; actions: unknown; user: unknown }) =>
  ({ habits: s.habits, actions: s.actions, user: s.user }) as unknown as EstadoLido;

type Disparo = (de: number, para: number, titulo: string) => void;
let disparoDeTeste: Disparo | null = null;

/**
 * DEV only, to see the mage's level ceremony without earning XP. Also on
 * `window.__cerimoniaNivel(de, para, titulo)`. Undefined in production.
 */
export const dispararCerimoniaDeNivelDeTeste: Disparo | undefined = import.meta.env.DEV
  ? (de, para, titulo) => disparoDeTeste?.(de, para, titulo)
  : undefined;

/**
 * Mount once inside the Router, in the layout. Listens to the store, never on
 * hydration or when the account changes, and answers each new completion and
 * ascension with a notice and a sound. Renders nothing but the notices.
 */
export function ProvedorDeProgresso() {
  const [fila, setFila] = useState<Noticia[]>([]);
  const [cerimonias, setCerimonias] = useState<PedidoDeNivel[]>([]);
  const navegar = useNavigate();
  const contador = useRef(0);

  useEffect(() => {
    let hidratando = false;
    const novoId = () => `n${++contador.current}`;
    const temporizadores = new Set<number>();
    const pedir = (de: number, para: number, titulo: string, atraso: number) => {
      const pedido: PedidoDeNivel = { id: `nivel${++contador.current}`, de, para, titulo };
      if (atraso <= 0) { setCerimonias((atual) => adicionarPedido(atual, pedido)); return; }
      const t = window.setTimeout(() => {
        temporizadores.delete(t);
        setCerimonias((atual) => adicionarPedido(atual, pedido));
      }, atraso);
      temporizadores.add(t);
    };
    disparoDeTeste = (de, para, titulo) => pedir(de, para, titulo, 0);
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__cerimoniaNivel = disparoDeTeste;
    }
    const pararHidratacao = useAppStore.persist?.onHydrate(() => { hidratando = true; setFila([]); setCerimonias([]); });
    const pararFim = useAppStore.persist?.onFinishHydration(() => { hidratando = false; });
    const parar = useAppStore.subscribe((depois, antes) => {
      if (depois.currentAccountId !== antes.currentAccountId) { setFila([]); setCerimonias([]); return; }
      if (hidratando) return;
      if (depois.habits === antes.habits && depois.actions === antes.actions && depois.user === antes.user) return;
      let eventos;
      try { eventos = detectarEventos(lerEstado(antes), lerEstado(depois)); } catch { return; }
      if (!eventos.length) return;

      const conclusoes = eventos.flatMap((e) => (e.tipo === 'conclusao' ? [e] : []));
      const novas: Noticia[] = noticiasDeConclusoes(conclusoes, novoId);
      // One sound per completion, except a burst: a single sound at the strength of the total.
      if (novas.length === 1 && novas[0].tipo === 'resumo') {
        const resumo = novas[0];
        if (resumo.elemento) tocarConclusao(resumo.elemento, intensidadeDoXp(resumo.xp)); else tocarToque();
      } else {
        for (const c of conclusoes) {
          if (c.elemento) tocarConclusao(c.elemento, intensidadeDoXp(c.xp)); else tocarToque();
        }
      }
      for (const e of eventos) {
        if (e.tipo !== 'ascensao') continue;
        const ouvida = emitirAscensao(e);
        tocarNivel(e.elemento, e.nivel);
        novas.push({ id: novoId(), tipo: 'ascensao', nome: '', elemento: e.elemento, xp: 0, nivel: e.nivel, semTela: !ouvida });
      }
      const haAscensao = eventos.some((e) => e.tipo === 'ascensao');
      for (const e of eventos) {
        if (e.tipo !== 'nivel') continue;
        tocarConquista();
        // An ascension plays its own ceremony in Ciclos; the mage's waits so they do not overlap.
        pedir(e.de, e.para, e.titulo, atrasoDaCerimonia(haAscensao));
      }
      setFila((atual) => empilhar(atual, novas));
    });
    return () => {
      parar(); pararHidratacao?.(); pararFim?.();
      temporizadores.forEach((t) => window.clearTimeout(t));
      disparoDeTeste = null;
    };
  }, []);

  // The first real gesture authorises audio, once.
  useEffect(() => {
    const aoGesto = () => {
      document.removeEventListener('pointerdown', aoGesto);
      document.removeEventListener('keydown', aoGesto);
      void ativarSom();
    };
    document.addEventListener('pointerdown', aoGesto);
    document.addEventListener('keydown', aoGesto);
    return () => { document.removeEventListener('pointerdown', aoGesto); document.removeEventListener('keydown', aoGesto); };
  }, []);

  const fechar = useCallback((id: string) => setFila((atual) => remover(atual, id)), []);
  const verNaBorda = useCallback(() => navegar('/ciclos'), [navegar]);

  const fecharCerimonia = useCallback(() => setCerimonias(concluirPedido), []);
  const cerimonia = pedidoAtual(cerimonias);
  // Read when it opens: the same XP the HUD counts. A test ceremony for a level
  // the account has not reached shows the start of that level instead.
  const progresso = useMemo(() => {
    if (!cerimonia) return null;
    const { xp_fire, xp_water, xp_air, xp_earth } = useAppStore.getState().user;
    const real = progressoDoNivel(xp_fire + xp_water + xp_air + xp_earth);
    return real.nivel === cerimonia.para ? real : progressoDoNivel(xpParaNivel(cerimonia.para) + 1);
  }, [cerimonia]);

  return (
    <>
      {fila.length ? (
        <div className="noticias">
          {fila.map((n) => (
            <NoticiaElemental key={n.id} noticia={n} onFechar={fechar} onVer={n.semTela ? verNaBorda : undefined} />
          ))}
        </div>
      ) : null}
      {cerimonia && progresso ? (
        <CerimoniaDeNivel
          key={cerimonia.id}
          de={cerimonia.de}
          para={cerimonia.para}
          titulo={cerimonia.titulo}
          fracao={progresso.fracao}
          faltam={progresso.faltam}
          onFechar={fecharCerimonia}
        />
      ) : null}
    </>
  );
}
