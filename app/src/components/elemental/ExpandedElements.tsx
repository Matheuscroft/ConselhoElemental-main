import { RevealPanel } from '@/components/motion/RevealPanel';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { ElementIcon } from './ArcaneIcon';
import { createMaterialEffect } from './material-effects';
import { elementHref } from './navigation';
import type { ElementId } from '@/types';
import './element-cards.css';

export interface ElementPanel {
  id: ElementId;
  name: string;
  description: string;
  scoreLabel: string;
}

/**
 * The four elements as glass cards. The one in focus lights from within and
 * its material comes alive; the others stay quiet.
 *
 * The material only runs for the open card. It is a canvas per element and
 * four of them animating at once on a phone buys nothing: three of the four
 * are dimmed to the point where the motion cannot be read anyway.
 */
function Material({ id, playing }: { id: ElementId; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !playing) return;

    const effect = createMaterialEffect(canvas, id, imageRef.current);
    if (!effect) return;

    let frame = 0;
    let tempo = 0;
    let anterior = performance.now();
    const passo = (agora: number) => {
      tempo += Math.min((agora - anterior) / 1000, 0.1);
      anterior = agora;
      effect.paint(tempo);
      frame = requestAnimationFrame(passo);
    };
    const parar = () => { if (frame) { cancelAnimationFrame(frame); frame = 0; } };
    const tocar = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(passo); };
    const aoTrocarVisibilidade = () => (document.hidden ? parar() : tocar());

    effect.resize();
    tocar();
    document.addEventListener('visibilitychange', aoTrocarVisibilidade);
    return () => {
      parar();
      document.removeEventListener('visibilitychange', aoTrocarVisibilidade);
      effect.clear();
    };
  }, [id, playing]);

  return (
    <span className="element-card-material" aria-hidden="true">
      <img ref={imageRef} src={`/sanctuary/elements/${id}-v1.webp`} alt="" width={120} height={120} loading="lazy" />
      {playing ? <canvas ref={canvasRef} /> : null}
    </span>
  );
}

export function ExpandedElements({ elements }: { elements: ElementPanel[] }) {
  const instance = useId();
  const reduced = useMotionPreference();
  const [selected, setSelected] = useState<ElementId | undefined>();

  return (
    <div className="pillar-element-cards" aria-label="Explorar elementos">
      {elements.map((element) => {
        const open = selected === element.id;
        return (
          <section
            key={element.id}
            className="pillar-element-card"
            data-open={open}
            data-quieto={selected !== undefined && !open}
            style={{ '--pillar-accent': `var(--element-${element.id})` } as CSSProperties}
          >
            <button
              type="button"
              className="pillar-element-trigger"
              aria-expanded={open}
              aria-controls={`expanded-${instance}-${element.id}`}
              onClick={() => setSelected(open ? undefined : element.id)}
            >
              <Material id={element.id} playing={open && !reduced} />
              <span>
                <strong><ElementIcon element={element.id} size={20} />{element.name}</strong>
                <small>{element.scoreLabel}</small>
              </span>
              <ChevronDown size={20} aria-hidden="true" />
            </button>
            <RevealPanel id={`expanded-${instance}-${element.id}`} open={open}>
              <div className="pillar-element-content">
                <p>{element.description}</p>
                <Link to={elementHref(element.id)}>
                  Explorar {element.name}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </RevealPanel>
          </section>
        );
      })}
    </div>
  );
}
