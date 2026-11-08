/** Isolated QA deployment only. Never import this entry into the app. */
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {RestoreWorkspace} from '../../src/components/backup/RestoreWorkspace';
import {STORE_KEYS} from '../../src/lib/backup/progress-backup';
import {LOCAL_PROGRESS_MODE_KEY} from '../../src/lib/backup/progress-mode';
import {RESTORE_JOURNAL_KEY} from '../../src/lib/backup/restore-journal';
import seed from 'qa-seed';
import '../../src/components/backup/restore-workspace.css';
const marker='conselho-disposable-restore-qa-v1';
const store=window.localStorage;
// A foreign/non-fixture origin is never adopted, cleared or seeded.
if(!store.getItem(marker)){
 if(Object.values(STORE_KEYS).some(key=>store.getItem(key)!==null)||store.getItem(RESTORE_JOURNAL_KEY)!==null)throw Error('Esta origem já contém dados. Ensaio recusado sem alterar nada.');
 store.setItem(marker,'fixture-only');for(const [key,value] of seed.entries)store.setItem(key,value);
}
const interruptKey='qa-only-restore-interruption';
const nativeSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){
 const interrupt=this===store&&key===STORE_KEYS.core&&store.getItem(interruptKey)==='armed';
 if(interrupt)nativeSet.call(store,interruptKey,'used');
 nativeSet.call(this,key,value);
 if(interrupt)throw Error('Interrupção simulada após a primeira parte. Recarregue para recuperar a cópia anterior.');
};
function QaControls(){
 const [armed,setArmed]=useState(store.getItem(interruptKey)==='armed');
 const complete=location.pathname==='/santuario'&&store.getItem(RESTORE_JOURNAL_KEY)===null&&store.getItem(LOCAL_PROGRESS_MODE_KEY)!==null;
 const core=JSON.parse(store.getItem(STORE_KEYS.core)??'null');
 const drafts=(core?.state?.drafts??[]).map((item:{title:string})=>item.title);
 return <><aside className="restore-workspace"><h1>Ensaio de transferência no celular</h1><p>Somente dados sintéticos neste endereço separado. Seu backup pessoal é recusado neste ensaio.</p>
 <p><a href="/fixture-progresso.json" download="fixture-progresso.json">Baixar arquivo de teste</a></p>
 <button type="button" disabled={armed||store.getItem(RESTORE_JOURNAL_KEY)!==null} onClick={()=>{store.setItem(interruptKey,'armed');setArmed(true);}}>{armed?'Interrupção armada':'Simular interrupção na próxima gravação'}</button>
 <p>Feche outras abas deste ensaio antes de confirmar. A proteção usa os locks reais do navegador; este site não contém o app nem conexão com a nuvem.</p>
 </aside>{complete?<main className="restore-workspace"><h2>Ensaio restaurado</h2><p role="status">A cópia está local e a operação foi encerrada.</p><ul>{drafts.map((title:string)=><li key={title}>{title}</li>)}</ul><a href="/">Reabrir conferência</a></main>:<RestoreWorkspace/>}</>;
}
createRoot(document.getElementById('root')!).render(<QaControls/>);
