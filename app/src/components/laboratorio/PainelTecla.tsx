import { useState } from 'react';
import { VitroKey } from '@/components/vitro/VitroKey';
import type { EstadoDaTecla } from '@/components/vitro/tecla';

const TONS = { terra: '#86c46f', fogo: '#ff8a4a', agua: '#4aa9ec', ar: '#d3e6ef' } as const;

/** The bench of the glass key: the wide call to action, the square keys of a trail in each state, and a press counter. */
export function PainelTecla() {
  const [toques, setToques] = useState(0);
  const [elemento, setElemento] = useState<keyof typeof TONS>('fogo');
  const estados: ReadonlyArray<[EstadoDaTecla, string, string]> = [['normal', 'Próxima', '2'], ['feito', 'Feita', '✓'], ['bloqueado', 'Bloqueada', '3']];
  return (
    <section className="lab-bloco">
      <h2>Tecla de vidro</h2>
      <p>Gira com o dedo ou o cursor, afunda ao toque, o rótulo fica gravado numa placa escura dentro do vidro.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 16px' }}>
        {(Object.keys(TONS) as Array<keyof typeof TONS>).map((id) => <button key={id} type="button" className="ds-botao" data-tipo={elemento === id ? 'secundario' : 'fantasma'} aria-pressed={elemento === id} onClick={() => setElemento(id)}>{id}</button>)}
      </div>
      <VitroKey rotulo="Iniciar etapa" tom={TONS[elemento]} proporcao={3.2} flutuar aoClicar={() => setToques((n) => n + 1)} />
      <p aria-live="polite">Toques: {toques}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 8 }}>
        {estados.map(([estado, nome, rotulo]) => (
          <figure key={estado} style={{ margin: 0, display: 'grid', gap: 6, justifyItems: 'center' }}>
            <VitroKey rotulo={rotulo} rotuloAcessivel={`Etapa ${nome}`} tom={TONS[elemento]} estado={estado} proporcao={1} />
            <figcaption style={{ fontSize: 12, opacity: .7 }}>{nome}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
