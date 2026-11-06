import type { StartupBlock } from './progress-startup';

const messages: Record<StartupBlock, { title: string; detail: string }> = {
  'pending-account': { title: 'Há uma conferência de conta pendente', detail: 'Confira o recibo ou continue em modo local protegido. Não limpe os dados do navegador.' },
  'pending-restore': {
    title: 'Seu progresso precisa de uma conferência',
    detail: 'Há uma restauração ou cópia confirmada aguardando conferência. A abertura do app permanece pausada até resolver a recuperação e a forma de continuar com esse progresso. Não limpe os dados do navegador.',
  },
  'storage-unavailable': {
    title: 'Não conseguimos ler seu progresso',
    detail: 'Confira se o navegador permite armazenar dados neste site e tente novamente. Não limpe os dados existentes.',
  },
  busy: {
    title: 'Seu progresso está em uso',
    detail: 'Outra operação está usando o progresso deste app. Aguarde sua conclusão e tente novamente.',
  },
  'startup-failed': {
    title: 'Não foi possível abrir o Santuário',
    detail: 'Tente recarregar o app. Se o problema continuar, informe esta mensagem ao suporte. Não limpe os dados do navegador.',
  },
};

/** Small native-DOM screen: importing it cannot initialize React stores or auth. */
export function showProgressStartup(root: HTMLElement, reason?: StartupBlock): void {
  const doc = root.ownerDocument;
  const panel = doc.createElement('main');
  panel.className = 'progress-startup';
  panel.setAttribute('aria-labelledby', 'progress-startup-title');
  const brand = doc.createElement('p');
  brand.className = 'progress-startup-brand';
  brand.textContent = 'Conselho Elemental';
  const title = doc.createElement('h1');
  title.id = 'progress-startup-title';
  title.tabIndex = -1;
  title.textContent = reason ? messages[reason].title : 'Abrindo seu Santuário';
  const detail = doc.createElement('p');
  detail.setAttribute('role', reason ? 'alert' : 'status');
  detail.textContent = reason ? messages[reason].detail : 'Conferindo o progresso salvo neste navegador.';
  panel.append(brand, title, detail);
  if (reason) {
    const retry = doc.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Recarregar o app';
    retry.addEventListener('click', () => doc.defaultView?.location.reload());
    panel.append(retry);
  }
  root.replaceChildren(panel);
  if (reason) title.focus({ preventScroll: true });
}
