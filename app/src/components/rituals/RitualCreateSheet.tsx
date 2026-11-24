import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ELEMENTS } from '@/constants';
import { ACENTO, type ElementoId } from '@/lib/design/palette';
import type { Area } from '@/types';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { CycleCategoryPicker } from '@/components/cycles/CycleCategoryPicker';
import { DURACOES, ESFORCOS } from '@/components/cycles/CycleCreationWizard';
import './ritual-create-sheet.css';

const rotuloDuracao = (minutos: number) => (minutos === 0 ? 'Sem tempo' : minutos === 60 ? '1 h' : `${minutos} min`);

function Orbe({ elemento }: { elemento: ElementoId | null }) {
  const [falhou, setFalhou] = useState(false);
  return elemento && !falhou
    ? <img src={`/sanctuary/elements/${elemento}-v1.webp`} alt="" width={52} height={52} onError={() => setFalhou(true)} />
    : <ArcaneIcon name="ritual" size={30} />;
}

/**
 * Creating a one-off ritual in one living sheet: a card that answers every touch, the name, the element and category
 * that rule it, and how much it is worth and how long it takes (they decide the XP), so nothing is edited afterwards.
 * Controlled: it creates nothing, the caller owns the values and the command.
 */
export function RitualCreateSheet({ name, onNameChange, areas, elemento, areaId, onElemento, onArea, esforco, onEsforco, minutos, onMinutos, onSubmit, onCancel }: {
  name: string; onNameChange: (nome: string) => void;
  areas: readonly Area[]; elemento: ElementoId | null; areaId: string | null;
  onElemento: (elemento: ElementoId | null) => void; onArea: (area: Area | null) => void;
  esforco: number; onEsforco: (pontos: number) => void;
  minutos: number; onMinutos: (minutos: number) => void;
  onSubmit: () => void; onCancel: () => void;
}) {
  const nome = name.trim();
  const area = areas.find((a) => a.id === areaId);
  const esforcoAtual = ESFORCOS.find((e) => e.pontos === esforco);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus({ preventScroll: true }); }, []);
  const estilo = { '--cc-acento': elemento ? ACENTO[elemento] : 'rgb(var(--el-gold))' } as CSSProperties;
  const resumo = [nome, elemento ? ELEMENTS[elemento].name : '', area?.name ?? '', esforco !== 1 ? esforcoAtual?.nome ?? '' : '', minutos > 0 ? rotuloDuracao(minutos) : ''].filter(Boolean).join(' · ');
  return (
    <form className="rc-folha" data-elemento={elemento ?? undefined} style={estilo} onSubmit={(evento) => { evento.preventDefault(); if (nome) onSubmit(); }}>
      <div className="rc-cartao" data-pronto={Boolean(nome)}>
        <span key={elemento ?? 'ritual'} className="rc-orbe"><Orbe elemento={elemento} /></span>
        <div>
          <small>{elemento ? <>{ELEMENTS[elemento].name}{area ? ` · ${area.name}` : ''}</> : 'Uma tarefa pontual'}</small>
          <strong>{nome || 'Seu novo ritual'}</strong>
          <p>{esforcoAtual ? `${esforcoAtual.nome}` : ''}{minutos > 0 ? ` · ${rotuloDuracao(minutos)}` : ' · sem tempo previsto'}</p>
        </div>
      </div>

      <label className="rc-campo"><span className="sr-only">Nome do ritual</span>
        <input ref={inputRef} required value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="O que você vai fazer?" enterKeyHint="done" />
      </label>

      <CycleCategoryPicker rotulo="Qual elemento rege este ritual?" areas={areas} elemento={elemento} areaId={areaId} onElemento={onElemento} onArea={onArea} />

      <h4 className="rc-subtitulo">Quanto vale?</h4>
      <div className="rc-esforcos" role="group" aria-label="Esforço do ritual">
        {ESFORCOS.map((e, i) => (
          <button key={e.pontos} type="button" aria-pressed={esforco === e.pontos} onClick={() => onEsforco(e.pontos)}>
            <span className="rc-chama" aria-hidden="true">{Array.from({ length: i + 1 }, (_, k) => <i key={k} />)}</span>
            <strong>{e.nome}</strong>
          </button>
        ))}
      </div>
      <h4 className="rc-subtitulo">Quanto tempo leva?</h4>
      <div className="rc-duracoes" role="group" aria-label="Tempo previsto">
        {DURACOES.map((d) => <button key={d} type="button" aria-pressed={minutos === d} onClick={() => onMinutos(d)}>{rotuloDuracao(d)}</button>)}
      </div>

      <footer className="rc-pe">
        <p className="rc-resumo" aria-live="polite">{resumo || 'Dê um nome para criar o ritual'}</p>
        <div className="rc-botoes">
          <button type="button" className="ds-botao" data-tipo="secundario" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="ds-botao" data-tipo="primario" disabled={!nome}>Criar ritual</button>
        </div>
      </footer>
    </form>
  );
}

export default RitualCreateSheet;
