import { useId, type CSSProperties } from 'react';

const NOMES = ['Muito leve', 'Leve', 'Moderado', 'Intenso', 'Muito intenso'] as const;

/**
 * The effort of the whole workout as a scale of five seals: every seal up to the
 * chosen one is lit, so the choice reads as a level and not as a list. Native radios
 * underneath: one choice, arrow keys, the same value the old select carried.
 */
export function DialogoEsforco({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const nome = useId();
  const rotulo = useId();
  return <div className="dg-esforco">
    <span id={rotulo} className="dg-rotulo">Esforço do treino</span>
    <div role="radiogroup" aria-labelledby={rotulo} className="dg-esforco-escala" style={{ '--nivel': value } as CSSProperties}>
      {NOMES.map((descricao, indice) => {
        const nivel = indice + 1;
        return <label key={nivel} className="dg-esforco-selo" data-aceso={nivel <= value || undefined} data-atual={nivel === value || undefined}>
          <input type="radio" name={nome} value={nivel} checked={value === nivel} aria-label={`${nivel}, ${descricao}`} onChange={() => onChange(nivel)} />
          <span className="dg-esforco-face" aria-hidden="true">{nivel}</span>
        </label>;
      })}
    </div>
    <p className="dg-esforco-leitura" aria-live="polite"><strong>{value}</strong> · {NOMES[value - 1] ?? 'Sem esforço definido'}</p>
  </div>;
}
