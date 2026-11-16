import type { ReactNode } from 'react';
import { Trash2, type LucideIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DialogoCabeca } from './dialogo-cabeca';
import { useLuzDoDialogo } from './dialogo-luz';
import './dialogo-uau.css';

interface DialogoAlertaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  descricao: ReactNode;
  /** The calm way out. It takes the first focus, as the primitive already does. */
  cancelar: string;
  /** The action itself, worded as the action ("Excluir treino"), never "OK". */
  confirmar: string;
  onConfirm: () => void;
  icone?: LucideIcon;
  /** A destructive action is the one thing painted in the warning colour. */
  perigo?: boolean;
}

/** The confirmation of a Training action: the same glass, head and buttons as the sheets, with a clear destructive button. */
export function DialogoAlerta({ open, onOpenChange, titulo, descricao, cancelar, confirmar, onConfirm, icone = Trash2, perigo = true }: DialogoAlertaProps) {
  const ligarLuz = useLuzDoDialogo();
  return <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent ref={ligarLuz} data-luz="" data-element="fogo" data-perigo={perigo || undefined} className="dialogo-treino dg-alerta ds-glass-float">
      <DialogoCabeca icone={icone}>
        <AlertDialogTitle className="dg-titulo">{titulo}</AlertDialogTitle>
        <AlertDialogDescription className="dg-descricao">{descricao}</AlertDialogDescription>
      </DialogoCabeca>
      <AlertDialogFooter className="dg-pe">
        <div className="dg-pe-acoes">
          <AlertDialogCancel className="dg-btn" data-tipo="secundario">{cancelar}</AlertDialogCancel>
          <AlertDialogAction className="dg-btn" data-tipo={perigo ? 'perigo' : 'primario'} onClick={onConfirm}>{confirmar}</AlertDialogAction>
        </div>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
