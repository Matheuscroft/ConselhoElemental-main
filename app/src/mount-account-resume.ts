import { ACCOUNT_TAB_ACCESS_KEY } from './lib/backup/account-resume-entry';
import { resumeAccountSession } from './lib/backup/resume-account-session';
import { hasExclusiveProgressSession } from './lib/backup/progress-startup';
import { isRestoredLocalDocument } from './lib/backup/progress-mode';
import { mountAccountApp } from './mount-account-app';

/** Loaded under the exclusive progress lease; failures never fall through to App. */
export async function mountAccountResume(root: HTMLElement) {
  let captured: string | null | undefined;
  try {
    captured=window.sessionStorage.getItem(ACCOUNT_TAB_ACCESS_KEY);
    if(!isRestoredLocalDocument())throw new Error('Confira o vínculo local.');
    const session=await resumeAccountSession({
      config:{url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY},
      origin:window.location.origin,storage:window.localStorage,accessStorage:window.sessionStorage,isExclusive:hasExclusiveProgressSession,
    });
    try { await mountAccountApp(root,session); } catch(error) { session.dispose();throw error; }
  }catch{
    // Use DOM/textContent, never render credentials or server error strings.
    // Full navigation releases this document's lease before another workspace.
    const main=document.createElement('main');main.className='restore-workspace';
    const title=document.createElement('h1');title.textContent='Confira seu acesso';title.tabIndex=-1;
    const message=document.createElement('p');message.textContent='A retomada não foi concluída. Suas atividades e tentativas pendentes continuam neste navegador. Entre para conferir as versões.';
    const link=document.createElement('a');link.href='/?progresso=conta';link.textContent='Conferir conta e progresso';
    const forget=document.createElement('button');forget.type='button';forget.textContent='Esquecer acesso salvo';
    forget.onclick=()=>{
      try{
        if(captured===undefined || window.sessionStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)!==captured)throw new Error();
        window.sessionStorage.removeItem(ACCOUNT_TAB_ACCESS_KEY);
        if(window.sessionStorage.getItem(ACCOUNT_TAB_ACCESS_KEY)!==null)throw new Error();
        window.location.assign('/?progresso=conta');
      }catch{message.textContent='Não foi possível esquecer este acesso. Abra a conferência da conta; seu progresso não foi alterado.';}
    };
    main.append(title,message,link,forget);root.replaceChildren(main);title.focus({preventScroll:true});
  }
}
