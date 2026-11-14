import { EstacaoTela } from './EstacaoTela';
import { temaDaEstacao } from '@/lib/temporal/ceu-dos-ciclos';
import './ceu-dos-ciclos.css';

export interface BotaoEstacaoProps {
  readonly nome: string;
  readonly south: boolean;
  /** "20 de dezembro", or null when the end could not be found. */
  readonly fim: string | null;
  readonly onAbrir: () => void;
}

/** A window onto the season, with weather that moves, and a glass sill that carries the text. */
export function BotaoEstacao({ nome, south, fim, onAbrir }: BotaoEstacaoProps) {
  const tema = temaDaEstacao(nome);
  const hemisferio = south ? 'Sul' : 'Norte';

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="ceu-botao ceu-botao-estacao elemental-press"
      data-estacao={tema.tom}
      style={{
        '--ceu-cor': tema.cor,
        '--ceu-cor-2': tema.cor2,
        '--ceu-topo': tema.topo,
        '--ceu-vidro': tema.vidro,
        '--ceu-blur': tema.blur === 'strong' ? 'var(--ds-blur-strong)' : 'var(--ds-blur-soft)',
        '--ceu-sat': String(tema.saturacao),
      } as React.CSSProperties}
      aria-label={`Abrir página da Estação: ${nome}, hemisfério ${hemisferio}${fim ? `, até ${fim}` : ''}`}
    >
      <EstacaoTela tom={tema.tom} cor={tema.cor} cor2={tema.cor2} />
      <span className="ceu-peitoril">
        <span className="ceu-texto">
          <span className="ceu-nome">{nome}</span>
          {fim ? <span className="ceu-apoio">Até {fim}</span> : null}
        </span>
        <svg className="ceu-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="ceu-anel" aria-hidden="true" />
    </button>
  );
}
