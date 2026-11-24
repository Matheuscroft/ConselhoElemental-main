import { useState, type CSSProperties } from 'react';
import { ELEMENTS } from '@/constants';
import { ACENTO } from '@/lib/design/palette';
import type { Area, ElementId } from '@/types';
import { CycleSigil } from './CycleSigil';

const ORDEM: readonly ElementId[] = ['terra', 'fogo', 'agua', 'ar'];

function Orbe({ id }: { id: ElementId }) {
  const [falhou, setFalhou] = useState(false);
  return falhou
    ? <CycleSigil element={id} size="card" filled />
    : <img src={`/sanctuary/elements/${id}-v1.webp`} alt="" width={64} height={64} loading="lazy" onError={() => setFalhou(true)} />;
}

/**
 * Element and category chosen where the cycle is born, so nothing has to be edited afterwards.
 * Controlled: it creates nothing. The category decides the element; picking an element only shows its categories.
 * "Sem categoria" is a real answer (the cycle can be sorted later), never a blocking error.
 */
export function CycleCategoryPicker({ areas, elemento, areaId, onElemento, onArea }: {
  /** Top-level categories, built-in and the person's own. */
  areas: readonly Area[];
  elemento: ElementId | null;
  areaId: string | null;
  onElemento: (elemento: ElementId | null) => void;
  onArea: (area: Area | null) => void;
}) {
  const doElemento = elemento ? areas.filter((area) => area.elementId === elemento) : [];
  return <div className="cycle-picker">
    <fieldset className="cycle-picker-grupo">
      <legend>Qual elemento rege este ciclo? <small>opcional</small></legend>
      <div className="cycle-picker-elementos" data-escolhido={elemento ?? undefined}>
        {ORDEM.map((id) => <button key={id} type="button" aria-pressed={elemento === id} aria-label={ELEMENTS[id].name} style={{ '--acento': ACENTO[id] } as CSSProperties}
          onClick={() => onElemento(elemento === id ? null : id)}>
          <span className="cp-orbe"><Orbe id={id} /></span><span className="cp-nome">{ELEMENTS[id].name}</span>
        </button>)}
      </div>
    </fieldset>
    {elemento ? <fieldset className="cycle-picker-grupo" key={elemento}>
      <legend>Categoria de {ELEMENTS[elemento].name}</legend>
      <div className="cycle-picker-categorias" style={{ '--acento': ACENTO[elemento] } as CSSProperties}>
        {doElemento.map((area, i) => <button key={area.id} type="button" aria-pressed={areaId === area.id} style={{ '--i': i } as CSSProperties} onClick={() => onArea(areaId === area.id ? null : area)}>{area.name}</button>)}
      </div>
      {!areaId ? <p>Sem categoria por enquanto: o ciclo nasce sem elemento e você escolhe depois.</p> : null}
    </fieldset> : null}
  </div>;
}
