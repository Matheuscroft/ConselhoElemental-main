import { useEffect, useRef, useState } from 'react';
import { MAX_BACKUP_BYTES } from '@/lib/backup/progress-backup';
import type { reviewAccountVersions } from '@/lib/backup/account-conflict';
import type { AccountResolution } from '@/lib/backup/account-resolution';

type Versions = Awaited<ReturnType<typeof reviewAccountVersions>>;
export function AccountResolutionPanel({ versions, resolution, busy, released, onChoose, onRecover, onKeepLocal }: {
  versions?: Versions; resolution?: Readonly<AccountResolution>;
  busy: boolean; released: boolean;
  onChoose: (direction:'local'|'online',copies:{local:string|null;online:string;pending:string|null})=>void;
  onRecover: (retry:boolean)=>void;
  onKeepLocal: ()=>void;
}) {
  const [copies,setCopies]=useState<{local:string|null;online:string|null;pending:string|null}>({local:null,online:null,pending:null});
  const [scope,setScope]=useState(false),[replace,setReplace]=useState(false),[retry,setRetry]=useState(false),[message,setMessage]=useState('');
  const generation=useRef(0),requests=useRef({local:0,online:0,pending:0});
  useEffect(()=>{const ref=generation;return()=>{ref.current++;};},[]);
  async function checkFile(part:keyof typeof copies,file:File,expected:string) {
    const token=generation.current,request=++requests.current[part];
    setCopies(old=>({...old,[part]:null}));setScope(false);setReplace(false);
    if(file.size>MAX_BACKUP_BYTES){setMessage('Escolha uma cópia de até 20 MB.');return;}
    try { const text=await file.text();if(generation.current!==token||requests.current[part]!==request)return;
      if(text!==expected){setMessage('Este arquivo não corresponde à versão conferida. Guarde e selecione a cópia correta.');return;}
      setCopies(old=>({...old,[part]:text}));setMessage('Cópia salva conferida. Nenhum dado foi substituído.');
    } catch { if(generation.current===token&&requests.current[part]===request)setMessage('Não foi possível ler o arquivo salvo.'); }
  }
  const ready=!!versions&&copies.online===versions.remoteArchive&&(versions.localArchive===null||copies.local===versions.localArchive)&&(versions.pendingArchive===null||copies.pending===versions.pendingArchive);
  const enabled=released&&!busy&&scope&&replace;
  function choose(direction:'local'|'online') {
    if(!enabled||!ready||!versions||copies.online===null||(direction==='local'&&versions.localArchive===null))return;
    onChoose(direction,{local:versions.localArchive===null?null:copies.local,online:copies.online,pending:versions.pendingArchive===null?null:copies.pending});
  }
  return <section aria-labelledby="account-resolution-title">
    <h2 id="account-resolution-title">{resolution?'Terminar a escolha que ficou pela metade':'Escolha qual progresso usar'}</h2>
    {resolution?<p>Sua escolha foi guardada: {resolution.direction==='online'?'trazer o progresso da conta para este aparelho':'usar o progresso deste aparelho'}. Confira o recibo e termine essa mesma escolha. O app fica pausado até terminar.</p>:<>
      <p>Baixe as cópias e escolha cada arquivo baixado. A escolha troca um progresso completo por outro, com todos os perfis, histórico e XP. O XP não é somado.</p>
      {versions&&(['local','online','pending'] as const).map(part=>{
        const expected=part==='local'?versions.localArchive:part==='online'?versions.remoteArchive:versions.pendingArchive;
        if(expected===null)return null;
        return <label key={part} className="restore-workspace-file">Escolha o arquivo baixado: {part==='local'?'deste aparelho':part==='online'?'da conta':'da tentativa pendente'}
          <input type="file" name={`backup-${part}`} accept="application/json,.json" disabled={busy} onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(file)void checkFile(part,file,expected);}}/>
        </label>;
      })}
    </>}
    <label className="restore-workspace-consent"><input type="checkbox" checked={scope} disabled={busy} onChange={event=>setScope(event.target.checked)}/>Confirmo o arquivo completo de todos os perfis, atividades e Treinos.</label>
    <label className="restore-workspace-consent"><input type="checkbox" checked={replace} disabled={busy} onChange={event=>setReplace(event.target.checked)}/>Entendo que um progresso será trocado pelo outro e {resolution?'quero terminar a escolha já guardada':'que as cópias anteriores ficam guardadas'}.</label>
    {resolution?<>
      <button type="button" disabled={!enabled} onClick={()=>{if(enabled)onRecover(false);}}>Verificar e terminar a escolha</button>
      <label className="restore-workspace-consent"><input type="checkbox" checked={retry} disabled={busy} onChange={event=>setRetry(event.target.checked)}/>Se não houver recibo, autorizo repetir somente a mesma escolha guardada.</label>
      <p>Se a conta já mudou e este aparelho ainda não começou a mudar, você pode manter este aparelho como está e avaliar de novo. Nada é apagado na conta por essa ação.</p>
      <button type="button" className="restore-workspace-secondary" disabled={!enabled} onClick={()=>{if(enabled)onKeepLocal();}}>Manter este aparelho e avaliar de novo</button>
      <button type="button" className="restore-workspace-secondary" disabled={!enabled||!retry} onClick={()=>{if(enabled&&retry)onRecover(true);}}>Repetir a escolha guardada</button>
    </>:<>
      <button type="button" disabled={!enabled||!ready||versions?.localArchive===null} onClick={()=>choose('local')}>Usar o progresso deste aparelho</button>
      <p>Usar o progresso deste aparelho troca o da conta. Trazer o da conta troca o deste aparelho. Se algo mudar na conta nesse meio tempo, nada é feito.</p>
      <button type="button" disabled={!enabled||!ready} onClick={()=>choose('online')}>Trazer o progresso da conta para este aparelho</button>
    </>}
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
