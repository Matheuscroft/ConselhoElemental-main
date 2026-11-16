import { Contagem } from '@/components/motion/Contagem';
import { Medidor } from '@/components/elemental/blocos';
import { ABERTURA_DOMINIOS_MS, useDeZero, useEntradaDaCena } from './entrada-dominios';

/**
 * The areas at a glance: the one real pane of glass of the list
 * (`.ds-glass-float`, no blur of its own), lit from behind by the week's
 * element. Only counts of what already exists, never a score or a target.
 */
export function ResumoDominios({ total, vinculadas, personalizadas }: { total: number; vinculadas: number; personalizadas: number }) {
  const entrada = useEntradaDaCena();
  const plena = entrada === 'plena';
  const atraso = ABERTURA_DOMINIOS_MS / 2;
  const medidor = useDeZero(total > 0 ? vinculadas / total : 0, atraso, plena);
  const mostradasTotal = useDeZero(total, atraso, plena);
  const mostradasVinculadas = useDeZero(vinculadas, atraso, plena);
  const mostradasPersonalizadas = useDeZero(personalizadas, atraso, plena);
  return <div className="dom-resumo">
    <span className="dom-resumo-luz" aria-hidden="true" />
    <section className="dom-painel ds-glass-float" data-luz aria-label="Resumo dos Domínios">
      <div className="ds-cifras">
        <div className="ds-cifra"><span className="dom-numero"><Contagem valor={mostradasVinculadas} beat="settle" /></span><small>Vinculadas</small></div>
        <div className="ds-cifra"><span className="dom-numero"><Contagem valor={mostradasTotal} beat="settle" /></span><small>Áreas no total</small></div>
        <div className="ds-cifra"><span className="dom-numero"><Contagem valor={mostradasPersonalizadas} beat="settle" /></span><small>Criadas por você</small></div>
      </div>
      <Medidor valor={medidor} espesso conquista={total > 0 && vinculadas >= total} rotulo={`${vinculadas} de ${total} áreas vinculadas`} />
    </section>
  </div>;
}
