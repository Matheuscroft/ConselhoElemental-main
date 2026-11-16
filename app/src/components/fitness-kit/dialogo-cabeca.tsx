import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';

interface DialogoCabecaProps {
  /** The sigil of the sheet: the modality's rune, or the symbol of the action. */
  icone: LucideIcon;
  /** A small line above the title, such as the modality's name. */
  sobretitulo?: ReactNode;
  /** The title and the description, already wearing the dialog's own primitives. */
  children: ReactNode;
  /** Accessible name of the close button. Without it no close button is drawn (an alert has none). */
  fechar?: string;
}

/**
 * The head of a Training dialog: a sigil lit by the element, the text in its own
 * column, and the close button in a column of its own. The title can therefore
 * never run underneath the close button, which is the collision the old sheets had.
 */
export function DialogoCabeca({ icone: Icone, sobretitulo, children, fechar }: DialogoCabecaProps) {
  return <header className="dg-cabeca" data-com-fechar={fechar ? '' : undefined}>
    <span className="dg-sigilo" aria-hidden="true"><Icone size={26} strokeWidth={1.55} /></span>
    <div className="dg-cabeca-texto">
      {sobretitulo && <p className="dg-sobretitulo">{sobretitulo}</p>}
      {children}
    </div>
    {fechar && <DialogClose className="dg-fechar" aria-label={fechar}><X size={20} aria-hidden="true" /></DialogClose>}
  </header>;
}
