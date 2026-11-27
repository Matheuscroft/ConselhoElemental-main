import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ELEMENTS } from '@/constants';
import { ACENTO } from '@/lib/design/palette';
import type { Area, ElementId } from '@/types';
import { ElementStackSlider } from './ElementStackSlider';

/** A compact row of chips that scrolls sideways, with a way to see them all at once when that is easier. */
function Trilho({ titulo, itens, escolhido, aoEscolher, cor }: {
  titulo: string; itens: readonly Area[]; escolhido: string | null; aoEscolher: (area: Area | null) => void; cor: string;
}) {
  const [aberto, setAberto] = useState(false);
  const trilho = useRef<HTMLDivElement>(null);
  // The chosen chip comes into view in its own row.
  useEffect(() => {
    const alvo = trilho.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    alvo?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [escolhido]);
  return (
    <section className="cp-secao" style={{ '--acento': cor } as CSSProperties} aria-label={titulo}>
      <header>
        <h4>{titulo} <small>opcional</small></h4>
        {itens.length > 4 ? <button type="button" aria-expanded={aberto} onClick={() => setAberto((v) => !v)}>{aberto ? 'Recolher' : `Ver as ${itens.length}`}</button> : null}
      </header>
      <div ref={trilho} className="cp-trilho" data-aberto={aberto || undefined}>
        {itens.map((area, i) => (
          <button key={area.id} type="button" aria-pressed={escolhido === area.id} style={{ '--i': i } as CSSProperties} onClick={() => aoEscolher(escolhido === area.id ? null : area)}>{area.name}</button>
        ))}
      </div>
    </section>
  );
}

/**
 * Element, area and focus chosen where the thing is born, so nothing has to be edited afterwards. The element is a
 * vertical stack slider; the area (the category) and the focus (its subcategory) are compact rows that appear under it,
 * so the whole choice fits in one screen. Controlled: it creates nothing.
 */
export function CycleCategoryPicker({ areas, elemento, areaId, onElemento, onArea, subareas = [], subareaId = null, onSubarea, rotulo = 'Qual elemento rege este ciclo?' }: {
  /** Top-level categories, built-in and the person's own. */
  areas: readonly Area[];
  elemento: ElementId | null;
  areaId: string | null;
  onElemento: (elemento: ElementId | null) => void;
  onArea: (area: Area | null) => void;
  /** The subcategories of the chosen area, when the caller offers them. */
  subareas?: readonly Area[];
  subareaId?: string | null;
  onSubarea?: (subarea: Area | null) => void;
  /** Kept for callers that still pass it: the slider is always the big one. */
  grande?: boolean;
  /** The question above the slider. */
  rotulo?: string;
}) {
  const doElemento = elemento ? areas.filter((area) => area.elementId === elemento) : [];
  const cor = elemento ? ACENTO[elemento] : 'rgb(var(--el-gold))';
  return (
    <div className="cycle-picker">
      <fieldset className="cycle-picker-grupo">
        <legend>{rotulo} <small>opcional</small></legend>
        <ElementStackSlider elemento={elemento} onElemento={onElemento} />
      </fieldset>
      {elemento ? <Trilho key={elemento} titulo={`Área de ${ELEMENTS[elemento].name}`} itens={doElemento} escolhido={areaId} aoEscolher={onArea} cor={cor} /> : null}
      {elemento && areaId && onSubarea && subareas.length > 0
        ? <Trilho key={areaId} titulo="Foco" itens={subareas} escolhido={subareaId} aoEscolher={onSubarea} cor={cor} />
        : null}
    </div>
  );
}
