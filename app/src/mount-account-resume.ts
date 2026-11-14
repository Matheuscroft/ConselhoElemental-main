import { ACCOUNT_TAB_ACCESS_KEY } from './lib/backup/account-resume-entry';
import { accountAccessStorage } from './lib/backup/account-access-storage';
import { resumeAccountSession } from './lib/backup/resume-account-session';
import { hasExclusiveProgressSession } from './lib/backup/progress-startup';
import { isRestoredLocalDocument } from './lib/backup/progress-mode';
import { mountAccountApp } from './mount-account-app';
import { ACCOUNT_BINDING_KEY } from './lib/backup/account-binding';

/** Loaded under the exclusive progress lease; failures never fall through to App. */
export async function mountAccountResume(root: HTMLElement) {
  // The record stays wherever it was saved (this tab or this device); reads cover both.
  const access=accountAccessStorage(undefined,window);
  try {
    const config={url:import.meta.env.VITE_SUPABASE_URL,key:import.meta.env.VITE_SUPABASE_ANON_KEY};
    if(window.localStorage.getItem(ACCOUNT_BINDING_KEY)!==null){
      if(!isRestoredLocalDocument())throw new Error('Confira o vínculo local.');
      const session=await resumeAccountSession({config,origin:window.location.origin,storage:window.localStorage,accessStorage:access,isExclusive:hasExclusiveProgressSession});
      try { await mountAccountApp(root,session); } catch(error) { session.dispose();throw error; }
    }else{
      const {resumeAuthenticatedAccountSession}=await import('./lib/backup/resume-authenticated-account');
      const session=await resumeAuthenticatedAccountSession({config,origin:window.location.origin,accessStorage:access,isCurrent:hasExclusiveProgressSession});
      try{const {mountAuthenticatedAccountApp}=await import('./mount-authenticated-account-app');await mountAuthenticatedAccountApp(root,session);}
      catch(error){session.dispose();throw error;}
    }
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
        // Explicit action: clears this device and this tab. A restore may already have rotated the saved pair.
        access.removeItem(ACCOUNT_TAB_ACCESS_KEY);
        if(access.getItem(ACCOUNT_TAB_ACCESS_KEY)!==null)throw new Error();
        window.location.assign('/?progresso=conta');
      }catch{message.textContent='Não foi possível esquecer este acesso. Abra a conferência da conta; seu progresso não foi alterado.';}
    };
    main.append(title,message,link,forget);root.replaceChildren(main);title.focus({preventScroll:true});
  }
}
