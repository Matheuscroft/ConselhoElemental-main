import React, { useId } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SaudeVazioProps {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Um convite, não um erro: normalmente o botão que começa o que falta. */
  action?: React.ReactNode;
  /** Dentro de um cartão pequeno: sem o sigilo grande. */
  compact?: boolean;
}

/** Estado vazio como convite: um sigilo que respira na luz da semana, uma frase e o próximo passo. */
export const SaudeVazio: React.FC<SaudeVazioProps> = ({ icon: Icon, title, text, action, compact = false }) => {
  const id = useId();
  return (
    <div className="saude-vazio" data-compacto={compact || undefined} role="group" aria-labelledby={id}>
      <span className="saude-vazio-sigilo" aria-hidden="true">
        <span className="saude-vazio-anel" />
        <Icon strokeWidth={1.6} />
      </span>
      <h3 id={id}>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
};
