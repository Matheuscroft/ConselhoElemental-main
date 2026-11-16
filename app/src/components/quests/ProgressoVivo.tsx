import { Medidor } from '@/components/elemental/blocos';
import { DURATION } from '@/lib/motion/motion';
import { NumeroVivo } from './NumeroVivo';
import { useDeZero } from './entrada-conquistas';

/** The progress of a sheet that just opened: the meter draws itself and the percentage counts to the real value. */
export function ProgressoVivo({ titulo, valor, conquista, rotulo }: { titulo: string; valor: number; conquista: boolean; rotulo: string }) {
  const desenhado = useDeZero(valor / 100, DURATION.reveal, true);
  return <div className="grid gap-2">
    <div className="ds-secao" data-nivel="2" style={{ margin: 0 }}>
      <h3>{titulo}</h3>
      <span className="ds-fracao"><NumeroVivo valor={valor} atraso={DURATION.reveal} sempre sufixo="%" /></span>
    </div>
    <Medidor valor={desenhado} espesso conquista={conquista} rotulo={rotulo} />
  </div>;
}
