/** Present quota failures without asking the user to clear the site's data. */
export function restoreFailureMessage(reason: unknown): string {
  if (reason && typeof reason === 'object') {
    const error = reason as { name?: string; message?: string; code?: number };
    if (error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014 || /quota.*exceed|exceed.*quota/i.test(error.message ?? '')) {
      return 'O espaço deste navegador foi insuficiente para concluir. Seu arquivo original permanece intacto. Reabra esta página e use “Concluir importação” para retomar a operação protegida. Não limpe os dados do app.';
    }
    if (typeof error.message === 'string') return error.message;
  }
  return 'Não foi possível concluir. Preserve sua cópia de progresso.';
}
