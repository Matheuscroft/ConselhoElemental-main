import { useState, type CSSProperties } from 'react';
import { ELEMENTOS, type ElementoId } from '@/lib/design/palette';
import { FiguraExercicio } from '@/components/fitness-kit/FiguraExercicio';
import { PADROES } from '@/components/fitness-kit/figura-padroes';

/**
 * Galeria de inspeção (NÃO é commitada): todos os padrões do registro em grade.
 * Cada cartão traz o id, o rótulo, a figura cheia animada e, lado a lado, o
 * primeiro e o último quadro estáticos. Monte em qualquer rota de dev:
 *   import { FigurasGaleria } from '@/lib/dev/figuras-galeria';
 */
const DEMO = ['peitoral', 'biceps', 'quadriceps', 'abdomen'] as const;
const cartao: CSSProperties = {
  display: 'grid', gap: 8, padding: 10, borderRadius: 'var(--ds-raio-runa)',
  background: 'rgb(var(--el-surface) / .6)', border: '1px solid rgb(var(--el-muted) / .2)',
};
const miolo: CSSProperties = { aspectRatio: '1', width: '100%', borderRadius: 'var(--ds-raio-controle)', background: 'rgb(var(--el-canvas))' };
const legenda: CSSProperties = { margin: 0, fontSize: 'var(--ds-text-micro)', color: 'rgb(var(--el-muted))', overflowWrap: 'anywhere' };

export function FigurasGaleria() {
  const [elemento, setElemento] = useState<ElementoId>('terra');
  const [animar, setAnimar] = useState(true);
  const [acender, setAcender] = useState(true);
  const padroes = Object.values(PADROES);
  return (
    <main style={{ padding: 16, display: 'grid', gap: 16, color: 'rgb(var(--el-text))' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--ds-text-title)' }}>Figuras de exercício ({padroes.length} padrões)</h1>
        {ELEMENTOS.map((id) => (
          <button key={id} type="button" aria-pressed={elemento === id} onClick={() => setElemento(id)} style={{ minHeight: 44, padding: '0 14px', borderRadius: 'var(--ds-raio-controle)', border: '1px solid rgb(var(--el-gold) / .4)', background: elemento === id ? 'rgb(var(--el-gold) / .2)' : 'none', color: 'inherit' }}>{id}</button>
        ))}
        <button type="button" aria-pressed={acender} onClick={() => setAcender((v) => !v)} style={{ minHeight: 44, padding: '0 14px', borderRadius: 'var(--ds-raio-controle)', border: '1px solid rgb(var(--el-gold) / .4)', background: 'none', color: 'inherit' }}>Músculos (demo)</button>
        <button type="button" aria-pressed={animar} onClick={() => setAnimar((v) => !v)} style={{ minHeight: 44, padding: '0 14px', borderRadius: 'var(--ds-raio-controle)', border: '1px solid rgb(var(--el-gold) / .4)', background: 'none', color: 'inherit' }}>{animar ? 'Pausar' : 'Animar'}</button>
      </header>
      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {padroes.map((p) => (
          <article key={p.id} style={cartao}>
            <p style={{ ...legenda, color: 'rgb(var(--el-text))' }}><strong>{p.id}</strong> · {p.rotulo}</p>
            <p style={legenda}>{p.vista} · {p.equipamento} · {p.duracaoS}s · {p.quadros.length} quadros</p>
            <div style={{ ...miolo, aspectRatio: '16 / 10' }}><FiguraExercicio padraoId={p.id} elemento={elemento} tamanho="cheio" animar={animar} musculos={acender ? DEMO : undefined} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={miolo}><FiguraExercicio padraoId={p.id} elemento={elemento} tamanho="mini" animar={false} fase={0} musculos={acender ? DEMO : undefined} /></div>
              <div style={miolo}><FiguraExercicio padraoId={p.id} elemento={elemento} tamanho="mini" animar={false} fase={1} musculos={acender ? DEMO : undefined} /></div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default FigurasGaleria;
