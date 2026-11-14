import type { AuthenticatedAccountSession } from './lib/backup/account-live-access';
import { hasExclusiveProgressSession } from './lib/backup/progress-startup';

/** Auth alone never opens editable routes while progress still belongs only to this browser. */
export async function mountAuthenticatedAccountApp(root: HTMLElement, session: AuthenticatedAccountSession) {
  if(!hasExclusiveProgressSession())throw new Error('Reabra o app para validar seu acesso.');
  session.dispose();
  const main=document.createElement('main');main.className='restore-workspace';
  const title=document.createElement('h1');title.textContent='Conecte sua jornada para continuar';title.tabIndex=-1;
  const message=document.createElement('p');message.textContent='A conta está autenticada, mas ainda não há uma jornada integral confirmada para este aparelho. Confira seus dados e o recibo antes de editar.';
  const link=document.createElement('a');link.href='/?progresso=conta';link.textContent='Conferir conta e jornada';
  main.append(title,message,link);root.replaceChildren(main);title.focus({preventScroll:true});
}
