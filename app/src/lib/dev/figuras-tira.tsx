import { useMemo } from 'react';
import { FiguraExercicio } from '@/components/fitness-kit/FiguraExercicio';
import { PADROES } from '@/components/fitness-kit/figura-padroes';

/** Local QA only (not committed): a filmstrip of 8 frames per pattern, to look for glitches. */
const FASES = Array.from({ length: 16 }, (_, i) => i / 15);

export function FigurasTira() {
  const ids = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const de = Number(q.get('de') ?? 0), ate = Number(q.get('ate') ?? 10);
    const ids = q.get('ids');
    return ids ? ids.split(',').filter((i) => PADROES[i]) : Object.keys(PADROES).slice(de, ate);
  }, []);
  return (
    <main style={{ padding: 8, display: 'grid', gap: 6, background: '#0b0f17', color: '#ddd' }}>
      {ids.map((id) => (
        <section key={id}>
          <p style={{ margin: '0 0 2px', fontSize: 12 }}><b>{id}</b> · {PADROES[id].modo ?? 'vai-e-volta'} · {PADROES[id].duracaoS}s</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gap: 2 }}>
            {FASES.map((f) => (
              <div key={f} style={{ aspectRatio: '1', background: '#10161f' }}>
                <FiguraExercicio padraoId={id} elemento="terra" tamanho="mini" animar={false} fase={f} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
