import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { ativarSom, tocarConclusao, tocarNivel, tocarToque } from '@/lib/audio';
import { detectarEventos, type EstadoLido } from '@/lib/progresso/eventos';
import { emitirAscensao } from '@/lib/progresso/canal';
import { NoticiaElemental } from './NoticiaElemental';
import { empilhar, intensidadeDoXp, noticiasDeConclusoes, remover, type Noticia } from './fila';

const lerEstado = (s: { habits: unknown; actions: unknown; user: unknown }) =>
  ({ habits: s.habits, actions: s.actions, user: s.user }) as unknown as EstadoLido;

/**
 * Mount once inside the Router, in the layout. Listens to the store, never on
 * hydration or when the account changes, and answers each new completion and
 * ascension with a notice and a sound. Renders nothing but the notices.
 */
export function ProvedorDeProgresso() {
  const [fila, setFila] = useState<Noticia[]>([]);
  const navegar = useNavigate();
  const contador = useRef(0);

  useEffect(() => {
    let hidratando = false;
    const novoId = () => `n${++contador.current}`;
    const pararHidratacao = useAppStore.persist?.onHydrate(() => { hidratando = true; setFila([]); });
    const pararFim = useAppStore.persist?.onFinishHydration(() => { hidratando = false; });
    const parar = useAppStore.subscribe((depois, antes) => {
      if (depois.currentAccountId !== antes.currentAccountId) { setFila([]); return; }
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
      setFila((atual) => empilhar(atual, novas));
    });
    return () => { parar(); pararHidratacao?.(); pararFim?.(); };
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

  if (!fila.length) return null;
  return (
    <div className="noticias">
      {fila.map((n) => (
        <NoticiaElemental key={n.id} noticia={n} onFechar={fechar} onVer={n.semTela ? verNaBorda : undefined} />
      ))}
    </div>
  );
}
