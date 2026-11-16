import { Medidor } from '@/components/elemental/blocos';
import { NumeroVivo } from './NumeroVivo';
import { ABERTURA_CONQUISTAS_MS, useDeZero, useEntradaDaCena } from './entrada-conquistas';

/**
 * Total, active and average at a glance: the one real pane of glass of each
 * screen (`.ds-glass-float`, no blur of its own), lit from behind by the
 * week's element, with a glowing meter for the average underneath.
 */
export function ResumoConquistas({ total, ativas, media, rotuloMedia }: { total: number; ativas: number; media: number; rotuloMedia: string }) {
  const entrada = useEntradaDaCena();
  const medidor = useDeZero(media / 100, ABERTURA_CONQUISTAS_MS / 2, entrada === 'plena');
  return <div className="cq-resumo">
    <span className="cq-resumo-luz" aria-hidden="true" />
    <section className="cq-painel ds-glass-float" data-luz aria-label="Resumo">
      <div className="ds-cifras">
        <div className="ds-cifra"><NumeroVivo valor={total} /><small>Total</small></div>
        <div className="ds-cifra"><NumeroVivo valor={ativas} /><small>Ativas</small></div>
        <div className="ds-cifra"><NumeroVivo valor={media} sufixo="%" /><small>Média</small></div>
      </div>
      <Medidor valor={medidor} espesso conquista={total > 0 && media >= 100} rotulo={rotuloMedia} />
    </section>
  </div>;
}
