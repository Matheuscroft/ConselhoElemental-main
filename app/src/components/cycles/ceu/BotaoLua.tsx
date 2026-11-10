import { LuaTela } from './LuaTela';
import { luzDaLua, porcentagemIluminada, variaveisDaLua } from '@/lib/temporal/ceu-dos-ciclos';
import './ceu-dos-ciclos.css';

export interface BotaoLuaProps {
  readonly nome: string;
  readonly phaseAngle: number;
  readonly illuminated: number;
  readonly waxing: boolean;
  readonly south: boolean;
  readonly onAbrir: () => void;
}

/** A window onto the real Moon for the selected day, with a glass sill that carries the text. */
export function BotaoLua({ nome, phaseAngle, illuminated, waxing, south, onAbrir }: BotaoLuaProps) {
  const luz = luzDaLua({ illuminated, waxing }, south);
  const porcentagem = porcentagemIluminada(illuminated);

  return (
    <button
      type="button"
      onClick={onAbrir}
      className="ceu-botao ceu-botao-lua elemental-press"
      style={variaveisDaLua(luz) as React.CSSProperties}
      aria-label={`Abrir página da Lua: ${nome}, ${porcentagem}% iluminada`}
    >
      <LuaTela phaseAngle={phaseAngle} illuminated={illuminated} waxing={waxing} south={south} />
      <span className="ceu-peitoril">
        <span className="ceu-texto">
          <span className="ceu-nome">{nome}</span>
          <span className="ceu-apoio">{porcentagem}% iluminada</span>
        </span>
        <svg className="ceu-chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="ceu-anel" aria-hidden="true" />
    </button>
  );
}
