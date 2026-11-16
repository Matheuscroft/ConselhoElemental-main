import type { ReactNode, CSSProperties } from 'react';
import { Contagem } from '@/components/motion/Contagem';

const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
/**
 * Fio espesso dos blocos (`ds-medidor`). Mantém os números exatos em aria-*, porque o `Medidor` só expõe porcentagem inteira.
 * `color` é um valor CSS (ACENTO ou `var(--elem-acento)`); `conquista` pinta em ouro.
 * `chegou` falso deixa o número em zero para ele contar até o valor real quando a tela acender; o preenchimento
 * se desenha por CSS, escalonado por `ordem`, e um brilho passa por ele de tempos em tempos.
 */
export function ResourceMeter({ label, value, maximum, color, icon, note, conquista = false, chegou = true, ordem = 0 }: {
  label: string; value: number; maximum: number; color?: string; icon: ReactNode; note?: string; conquista?: boolean;
  chegou?: boolean; ordem?: number;
}) {
  const valid = Number.isFinite(value) && Number.isFinite(maximum) && maximum > 0;
  const fraction = valid ? Math.min(1, Math.max(0, value / maximum)) : 0;
  const style = { '--ordem': ordem, ...(color ? { '--medidor-cor': color } : null) } as CSSProperties;
  const track = { '--medidor-valor': fraction } as CSSProperties;
  return <div className="grimoire-meter" style={style} data-vazio={fraction <= 0 ? '' : undefined}>
    <div className="grimoire-meter-label"><span>{icon}{label}</span><strong>{valid ? <Contagem valor={chegou ? value : 0} formatar={format} /> : '—'}<small> / {valid ? format(maximum) : '—'}</small></strong></div>
    <div className="ds-medidor" data-forma="fio" data-espesso="" data-conquista={conquista ? '' : undefined} style={track} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={valid ? maximum : undefined} aria-valuenow={valid ? Math.min(maximum, Math.max(0, value)) : undefined} aria-valuetext={valid ? `${format(value)} de ${format(maximum)}` : 'Sem valor disponível'}>
      <span className="gr-fio" aria-hidden="true"><i /></span>
    </div>
    {note && <p>{note}</p>}
  </div>;
}
