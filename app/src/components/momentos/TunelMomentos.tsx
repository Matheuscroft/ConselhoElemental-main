import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { enderecoTemporario, lerMomento, momentosDisponiveis } from '@/lib/momentos/momento-store';
import { diaNoFoco, lugarNoTunel, vooTotal } from '@/lib/momentos/tunel';
import type { DiaDoReel } from './ReelMomentos';
import './tunel-momentos.css';

/**
 * The days as a corridor you fly down, toward a vanishing point of light.
 *
 * The flying is a native scroller again: a tall empty column whose scrollTop
 * is the distance travelled, with the corridor itself sticky over it. That
 * buys momentum, the keyboard, the scrollbar and the browser's own sense of
 * how far a flick should carry -- none of which is worth rewriting.
 *
 * The photograph of the day in focus sits behind everything, enlarged and
 * blurred, so flying through the days also moves through their light.
 */
export function TunelMomentos({ dias }: { dias: DiaDoReel[] }) {
  const reduced = useMotionPreference();
  const vooRef = useRef<HTMLDivElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState(0);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const soltarRef = useRef<Array<() => void>>([]);

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

  useEffect(() => {
    const voo = vooRef.current;
    const palco = palcoRef.current;
    if (!voo || !palco) return;

    let frame = 0;

    const pintar = () => {
      const distancia = voo.scrollTop;
      const cartoes = [...palco.children] as HTMLElement[];

      cartoes.forEach((cartao, indice) => {
        const lugar = lugarNoTunel(distancia, indice);
        if (!lugar.visivel) {
          cartao.style.visibility = 'hidden';
          return;
        }
        cartao.style.visibility = 'visible';
        cartao.style.transform =
          `translate3d(${lugar.x * 100}%, -50%, ${-lugar.z}px) rotateY(${lugar.giro}deg) scale(${lugar.escala})`;
        cartao.style.opacity = String(lugar.opacidade);
        cartao.style.filter = lugar.desfoque < 0.2 ? 'none' : `blur(${lugar.desfoque.toFixed(2)}px)`;
        // Nearer days paint over further ones without a z-index per card.
        cartao.style.zIndex = String(1000 - Math.round(lugar.z));
      });

      setFoco(diaNoFoco(distancia, dias.length));
    };

    const aoRolar = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; pintar(); });
    };

    pintar();
    voo.addEventListener('scroll', aoRolar, { passive: true });
    const observador = new ResizeObserver(pintar);
    observador.observe(voo);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      voo.removeEventListener('scroll', aoRolar);
      observador.disconnect();
    };
  }, [dias.length]);

  const atual = dias[foco];
  const fundo = atual ? fotos[atual.dia] : undefined;

  return (
    <div className="tunel-momentos" data-parado={reduced}>
      {/* The light of the day you are on, behind the corridor. */}
      <div className="tunel-fundo" aria-hidden="true">
        {fundo ? <img src={fundo} alt="" decoding="async" /> : null}
      </div>

      <div className="tunel-voo" ref={vooRef} tabIndex={0} aria-label="Voe pelos seus dias">
        <div className="tunel-palco" ref={palcoRef} aria-hidden="true">
          {dias.map((item) => (
            <figure key={item.dia} className="tunel-quadro">
              {fotos[item.dia] ? (
                <img src={fotos[item.dia]} alt="" loading="lazy" decoding="async" />
              ) : (
                <figcaption className="tunel-sem-foto">Sem foto</figcaption>
              )}
            </figure>
          ))}
        </div>
        {/* The scroller needs height to fly through; the corridor is sticky over it. */}
        <div className="tunel-trilha" style={{ blockSize: `${vooTotal(dias.length) + 100}px` }} />
      </div>

      <p className="tunel-nome" aria-live="polite">
        {atual ? (
          <>
            <strong>{atual.titulo}</strong>
            <small>{atual.detalhe}</small>
          </>
        ) : null}
      </p>
    </div>
  );
}

export default TunelMomentos;
