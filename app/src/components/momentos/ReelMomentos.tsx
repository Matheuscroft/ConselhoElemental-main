import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { MENSAGEM_RECUSA } from '@/lib/momentos/momento';
import {
  apagarMomento,
  enderecoTemporario,
  lerMomento,
  momentosDisponiveis,
  salvarMomento,
} from '@/lib/momentos/momento-store';
import { distanciaDoCentro, indiceAtivo, posicaoReel } from '@/lib/momentos/reel';
import './reel-momentos.css';

export interface DiaDoReel {
  readonly dia: string;
  readonly titulo: string;
  readonly detalhe: string;
}

const MENSAGENS: Record<string, string> = {
  ...MENSAGEM_RECUSA,
  indisponivel: 'Este navegador não guarda fotos. Tente pelo app instalado.',
  espaco: 'Não há espaço no aparelho para mais uma foto.',
  falha: 'Não consegui guardar essa foto. Tente de novo.',
};

/**
 * The days as a coverflow you throw with a finger.
 *
 * The rail is a native scroller with snap points, so the momentum, the
 * keyboard and the screen reader are the browser's own and not a
 * reimplementation. The turn and the softening are written straight to the
 * cards from a rAF loop reading scrollLeft: a scroll fires far too often for
 * React to be in the middle of it.
 */
export function ReelMomentos({ dias }: { dias: DiaDoReel[] }) {
  const reduced = useMotionPreference();
  const trilhoRef = useRef<HTMLUListElement>(null);
  const [ativo, setAtivo] = useState(0);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const soltarRef = useRef<Array<() => void>>([]);

  // Every object URL is released on the way out. Thirty blobs held by URLs
  // nobody revoked is how a gallery eats a phone's memory.
  useEffect(() => () => {
    soltarRef.current.forEach((soltar) => soltar());
    soltarRef.current = [];
  }, []);

  useEffect(() => {
    if (!momentosDisponiveis()) return;
    let vivo = true;

    void (async () => {
      for (const { dia } of dias) {
        const momento = await lerMomento(dia);
        if (!vivo || !momento) continue;
        const { url, soltar } = enderecoTemporario(momento.miniatura);
        soltarRef.current.push(soltar);
        setFotos((atual) => ({ ...atual, [dia]: url }));
      }
    })();

    return () => { vivo = false; };
  }, [dias]);

  // The turn follows the finger, so it is written per frame rather than per
  // render, and only while the rail is actually moving.
  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    let frame = 0;
    let parar = 0;

    const pintar = () => {
      const cartoes = [...trilho.children] as HTMLElement[];
      if (!cartoes.length) return;
      const largura = cartoes[0].offsetWidth;
      const passo = cartoes.length > 1 ? cartoes[1].offsetLeft - cartoes[0].offsetLeft : largura;
      const recuo = cartoes[0].offsetLeft;

      cartoes.forEach((cartao, indice) => {
        const d = distanciaDoCentro(trilho.scrollLeft, trilho.clientWidth, passo, largura, recuo, indice);
        const p = posicaoReel(d);
        cartao.style.transform = reduced
          ? 'none'
          : `perspective(1100px) translateZ(${p.profundidade}px) rotateY(${p.rotacao}deg) scale(${p.escala})`;
        cartao.style.opacity = String(reduced ? 1 : p.opacidade);
        cartao.style.filter = reduced || p.desfoque < 0.2 ? 'none' : `blur(${p.desfoque.toFixed(2)}px)`;
      });

      setAtivo(indiceAtivo(trilho.scrollLeft, trilho.clientWidth, passo, largura, recuo, cartoes.length));
    };

    const aoRolar = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; pintar(); });
      window.clearTimeout(parar);
      parar = window.setTimeout(pintar, 120);
    };

    pintar();
    trilho.addEventListener('scroll', aoRolar, { passive: true });
    const observador = new ResizeObserver(pintar);
    observador.observe(trilho);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(parar);
      trilho.removeEventListener('scroll', aoRolar);
      observador.disconnect();
    };
  }, [reduced, dias.length]);

  const escolher = useCallback(async (dia: string, arquivo: File | undefined) => {
    if (!arquivo) return;
    setAviso(null);
    const resultado = await salvarMomento(dia, arquivo);
    if (!resultado.ok) {
      setAviso(MENSAGENS[resultado.motivo] ?? MENSAGENS.falha);
      return;
    }
    const { url, soltar } = enderecoTemporario(resultado.momento.miniatura);
    soltarRef.current.push(soltar);
    setFotos((atual) => ({ ...atual, [dia]: url }));
  }, []);

  const remover = useCallback(async (dia: string) => {
    if (!(await apagarMomento(dia))) return;
    setFotos((atual) => {
      const proximo = { ...atual };
      delete proximo[dia];
      return proximo;
    });
  }, []);

  return (
    <div className="reel-momentos">
      <ul className="reel-trilho" ref={trilhoRef} aria-label="Seus dias, um momento por dia">
        {dias.map((item, indice) => {
          const foto = fotos[item.dia];
          const eAtivo = indice === ativo;
          return (
            <li key={item.dia} className="reel-cartao" data-ativo={eAtivo} aria-current={eAtivo ? 'true' : undefined}>
              <div className="reel-moldura">
                {foto ? (
                  <img src={foto} alt={`Seu momento de ${item.titulo}`} loading="lazy" decoding="async" />
                ) : (
                  <p className="reel-vazio">O ápice do seu dia ainda não tem foto.</p>
                )}
                <div className="reel-legenda">
                  <strong>{item.titulo}</strong>
                  <small>{item.detalhe}</small>
                </div>
              </div>
              <div className="reel-acoes">
                <label className="reel-acao">
                  <Camera size={16} aria-hidden="true" />
                  {foto ? 'Trocar foto' : 'Guardar momento'}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(evento) => void escolher(item.dia, evento.target.files?.[0])}
                  />
                </label>
                {foto ? (
                  <button type="button" className="reel-acao" onClick={() => void remover(item.dia)}>
                    <Trash2 size={16} aria-hidden="true" />
                    Remover
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {aviso ? <p className="reel-aviso" role="alert">{aviso}</p> : null}
    </div>
  );
}

export default ReelMomentos;
