import React, { useId, useMemo, useState } from 'react';
import { Ruler } from 'lucide-react';
import { BODY_MEASUREMENT_FIELDS } from '@/components/workout';
import { medidaPadrao, medidasComDados, serieDaMedida, variacao, type ChaveMedida } from '@/lib/fitness/corpo-evolucao';
import type { BodyMeasurement } from '@/types/workout';
import { FitnessButton } from './FitnessButton';
import { SaudePainel, SaudeNumeroVivo } from './saude-painel';
import { SaudeVazio } from './saude-vazio';
import { TrendAreaChart } from './TrendAreaChart';

const um = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
/** Só sinal e valor: subir ou descer não é bom nem ruim para o app. */
export const formatarVariacao = (valor: number) => {
  const arredondado = Math.round(valor * 10) / 10;
  if (arredondado === 0) return '0';
  return `${arredondado > 0 ? '+' : '−'}${um(Math.abs(arredondado))}`;
};

interface CorpoEvolucaoProps {
  history: readonly BodyMeasurement[];
  color: string;
  order?: number;
  onRecord: () => void;
}

/** Evolução de qualquer medida: chips para escolher, o gráfico da escolhida e duas linhas de variação neutras. */
export const CorpoEvolucao: React.FC<CorpoEvolucaoProps> = ({ history, color, order = 3, onRecord }) => {
  const baseId = useId();
  const disponiveis = useMemo(() => medidasComDados(history), [history]);
  const [escolhida, setEscolhida] = useState<ChaveMedida | undefined>();
  const chave = escolhida && disponiveis.includes(escolhida) ? escolhida : medidaPadrao(disponiveis);
  const campo = BODY_MEASUREMENT_FIELDS.find((field) => field.key === chave);
  const serie = useMemo(() => (chave ? serieDaMedida(history, chave) : []), [history, chave]);
  const delta = useMemo(() => variacao(serie), [serie]);
  const data = useMemo(() => serie.slice(-7).map((ponto) => ({
    label: new Date(ponto.measuredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: ponto.value,
  })), [serie]);
  const temCurva = serie.length >= 2 && campo !== undefined;
  const unidade = campo?.unit ?? '';
  const nome = campo?.label ?? 'medida';
  const ultimo = serie.at(-1)?.value;

  return (
    <SaudePainel
      order={order}
      arrivalKey="corpo-evolucao"
      title={`Evolução · ${nome}`}
      subtitle={ultimo !== undefined ? 'Na última avaliação' : undefined}
      highlight={temCurva && ultimo !== undefined ? { value: ultimo, format: um, unit: unidade } : undefined}
      summary={temCurva ? `${nome} por avaliação: ${data.map((ponto) => `${ponto.label}: ${um(ponto.value)} ${unidade}`).join(', ')}` : undefined}
      className="corpo-evolucao"
      empty={temCurva ? undefined : (
        <>
          {disponiveis.length > 1 && <ChipsDaMedida baseId={baseId} disponiveis={disponiveis} chave={chave} onEscolher={setEscolhida} />}
          <SaudeVazio
            icon={Ruler}
            title={`A curva de ${nome.toLowerCase()} começa aqui`}
            text={`Registre pelo menos duas avaliações com ${nome.toLowerCase()} para acompanhar sua evolução.`}
            action={<FitnessButton size="md" variant="secondary" onClick={onRecord}>Registrar avaliação</FitnessButton>}
          />
        </>
      )}
    >
      {(arrived) => (
        <>
          {disponiveis.length > 1 && <ChipsDaMedida baseId={baseId} disponiveis={disponiveis} chave={chave} onEscolher={setEscolhida} />}
          <div id={`${baseId}-painel`} role="tabpanel" aria-labelledby={`${baseId}-${chave}`} className="corpo-grafico">
            <TrendAreaChart key={chave} data={data} unit={unidade} decimals={1} height={190} color={color} animate arrived={arrived} fitRange highlight={data.length - 1} />
          </div>
          <dl className="corpo-variacao">
            <LinhaVariacao rotulo="Desde a primeira avaliação" valor={delta.desdeAPrimeira} unidade={unidade} arrived={arrived} />
            <LinhaVariacao rotulo="Desde a anterior" valor={delta.desdeAAnterior} unidade={unidade} arrived={arrived} />
          </dl>
        </>
      )}
    </SaudePainel>
  );
};

const LinhaVariacao: React.FC<{ rotulo: string; valor: number | null; unidade: string; arrived: boolean }> = ({ rotulo, valor, unidade, arrived }) => (
  <div className="corpo-variacao-linha">
    <dt>{rotulo}</dt>
    <dd>{valor === null ? '—' : <SaudeNumeroVivo number={{ value: valor, format: formatarVariacao, unit: unidade }} arrived={arrived} />}</dd>
  </div>
);

const ChipsDaMedida: React.FC<{ baseId: string; disponiveis: readonly ChaveMedida[]; chave: ChaveMedida | undefined; onEscolher: (chave: ChaveMedida) => void }> = ({ baseId, disponiveis, chave, onEscolher }) => {
  const mover = (evento: React.KeyboardEvent, indice: number) => {
    const passo = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
    if (!passo) return;
    evento.preventDefault();
    const proxima = disponiveis[(indice + passo + disponiveis.length) % disponiveis.length];
    onEscolher(proxima);
    document.getElementById(`${baseId}-${proxima}`)?.focus();
  };
  return (
    <div className="corpo-chips" role="tablist" aria-label="Medida a acompanhar">
      {disponiveis.map((item, indice) => {
        const ativa = item === chave;
        return (
          <button
            key={item}
            id={`${baseId}-${item}`}
            type="button"
            role="tab"
            aria-selected={ativa}
            aria-controls={ativa ? `${baseId}-painel` : undefined}
            tabIndex={ativa ? 0 : -1}
            className="corpo-chip"
            onClick={() => onEscolher(item)}
            onKeyDown={(evento) => mover(evento, indice)}
          >
            {BODY_MEASUREMENT_FIELDS.find((field) => field.key === item)?.label}
          </button>
        );
      })}
    </div>
  );
};
