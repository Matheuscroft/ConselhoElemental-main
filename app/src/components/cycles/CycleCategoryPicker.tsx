import type { CSSProperties } from 'react';
import { CycleSigil } from './CycleSigil';
import { ELEMENTS } from '@/constants';
import { ACENTO } from '@/lib/design/palette';
import type { Area, ElementId } from '@/types';

const ORDEM: readonly ElementId[] = ['terra', 'fogo', 'agua', 'ar'];

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
      <legend>Elemento <small>opcional</small></legend>
      <div className="cycle-picker-elementos">
        {ORDEM.map((id) => <button key={id} type="button" aria-pressed={elemento === id} style={{ '--acento': ACENTO[id] } as CSSProperties}
          onClick={() => onElemento(elemento === id ? null : id)}>
          <CycleSigil element={id} size="child" filled={elemento === id} /><span>{ELEMENTS[id].name}</span>
        </button>)}
      </div>
    </fieldset>
    {elemento ? <fieldset className="cycle-picker-grupo" key={elemento}>
      <legend>Categoria de {ELEMENTS[elemento].name}</legend>
      <div className="cycle-picker-categorias" style={{ '--acento': ACENTO[elemento] } as CSSProperties}>
        {doElemento.map((area) => <button key={area.id} type="button" aria-pressed={areaId === area.id} onClick={() => onArea(areaId === area.id ? null : area)}>{area.name}</button>)}
      </div>
      {!areaId ? <p>Sem categoria por enquanto: o ciclo é criado sem elemento e você escolhe depois.</p> : null}
    </fieldset> : null}
  </div>;
}
