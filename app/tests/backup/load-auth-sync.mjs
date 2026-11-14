import {build} from 'esbuild';
import {existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';

// Real cloud service (the old authStore was removed in LOTE 8), with a synthetic client. No real Supabase module,
// env files, HTTP, credentials, browser storage or personal sessions are evaluated.
const output=await build({stdin:{contents:`export * from './src/services/supabaseCloudSync';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent',define:{'import.meta.env.VITE_FORCE_BOOTSTRAP_CLOUD_SYNC':'false'},plugins:[{name:'synthetic-boundaries',setup(b){
 b.onResolve({filter:/account-release$/},()=>({path:'synthetic-account-release',external:true}));
 b.onResolve({filter:/^@\/lib\/supabase$/},()=>({path:'synthetic-supabase',external:true}));
 b.onResolve({filter:/^@\/stores\/appStore$/},()=>({path:'synthetic-core',external:true}));
 b.onResolve({filter:/^@\//},args=>{const base=resolve('src',args.path.slice(2));return {path:[base,base+'.ts',base+'.tsx',resolve(base,'index.ts')].find(p=>existsSync(p)&&statSync(p).isFile())};});
}}]});
export const authGraph=Object.keys(output.metafile.inputs);
const clone=value=>JSON.parse(JSON.stringify(value));
const tick=()=>new Promise(r=>setImmediate(r));
export const settle=async()=>{for(let i=0;i<3;i++)await tick();};
export const gate=()=>{let resolve;return {promise:new Promise(r=>{resolve=r;}),resolve:()=>resolve()};};
export function authFixture({enabled=true,session={user:{id:'synthetic-remote-a'}},profile=true,released=false}={}){
 const local=fixture();local.core.getState().addDraft('Ideia local preservada','Notas locais');
 const db=new Map();if(profile)db.set('profiles',[{id:'synthetic-remote-a',display_name:'Perfil remoto sintético',avatar:'symbol'}]);
 const calls=[],timers=new Map(),listeners={window:new Map(),document:new Map()},authListeners=new Set(),logs=[];let timerId=0,visibility='visible';
 const hooks={beforeQuery:async()=>{},beforeSession:async()=>{},guardUser:async()=>({data:{user:session?.user??null},error:null}),guardRead:async userId=>({data:{userId,complete:false,kind:'legacy',revision:'legacy'},error:null})};
 const matches=(row,filters)=>filters.every(([column,value])=>Array.isArray(value)?value.includes(row[column]):row[column]===value);
 function from(table){
  const q={table,operation:'select',columns:'*',filters:[],rows:undefined,single:false,limit:undefined};
  const api={select(columns){q.columns=columns;return api;},eq(column,value){q.filters.push([column,value]);return api;},in(column,values){q.filters.push([column,values]);return api;},limit(value){q.limit=value;return api;},maybeSingle(){q.single=true;return api;},upsert(rows){q.operation='upsert';q.rows=clone(Array.isArray(rows)?rows:[rows]);return api;},delete(){q.operation='delete';return api;},then(onFulfilled,onRejected){return execute().then(onFulfilled,onRejected);}};
  async function execute(){
   const call=clone(q);calls.push(call);const failure=await hooks.beforeQuery(call);if(failure)return {data:null,error:failure};
   let rows=db.get(table)??[];
   if(q.operation==='select'){
    rows=rows.filter(row=>matches(row,q.filters));if(q.limit!==undefined)rows=rows.slice(0,q.limit);
    if(q.columns!=='*'){const keys=q.columns.split(',').map(x=>x.trim());rows=rows.map(row=>Object.fromEntries(keys.filter(k=>k in row).map(k=>[k,row[k]])));}
    return {data:clone(q.single?rows[0]??null:rows),error:null};
   }
   if(q.operation==='upsert'){for(const entry of q.rows){const i=rows.findIndex(row=>row.id===entry.id);if(i<0)rows.push(entry);else rows[i]={...rows[i],...entry};}db.set(table,rows);}
   else db.set(table,rows.filter(row=>!matches(row,q.filters)));
   return {data:null,error:null};
  }
  return api;
 }
 const client={from,async rpc(name,args){calls.push({operation:'rpc',name,args});return hooks.guardRead(args.p_expected_user_id);},auth:{async getUser(){calls.push({operation:'getUser'});return hooks.guardUser();},async getSession(){calls.push({operation:'getSession'});await hooks.beforeSession();return {data:{session},error:null};},onAuthStateChange(fn){authListeners.add(fn);return {data:{subscription:{unsubscribe:()=>authListeners.delete(fn)}}};},async signOut(){return {error:null};}}};
 const add=(surface,key,fn)=>{const set=listeners[surface].get(key)??new Set();set.add(fn);listeners[surface].set(key,set);};
 const remove=(surface,key,fn)=>listeners[surface].get(key)?.delete(fn);
 const window={addEventListener:(key,fn)=>add('window',key,fn),removeEventListener:(key,fn)=>remove('window',key,fn)};
 const document={get visibilityState(){return visibility;},addEventListener:(key,fn)=>add('document',key,fn),removeEventListener:(key,fn)=>remove('document',key,fn)};
 const storage={getItem:key=>local.memory.get(key)??null,setItem:(key,value)=>local.memory.set(key,value),removeItem:key=>local.memory.delete(key)};
 const mod={exports:{}};
 new Function('require','module','exports','window','document','localStorage','crypto','setTimeout','clearTimeout','console','fetch',output.outputFiles[0].text)(name=>{
  if(name==='synthetic-account-release')return {ACCOUNT_TRANSFER_WRITES_RELEASED:released};
  if(name==='synthetic-supabase')return {supabase:enabled?client:null,isSupabaseAuthEnabled:enabled};
  if(name==='synthetic-core')return {useAppStore:local.core};
  throw Error('Unexpected external dependency: '+name);
 },mod,mod.exports,window,document,storage,webcrypto,(fn,delay)=>{const id=++timerId;timers.set(id,{fn,delay});return id;},id=>timers.delete(id),{error:(...args)=>logs.push(args),warn:(...args)=>logs.push(args),info:(...args)=>logs.push(args)},()=>{throw Error('Network is forbidden in this fixture');});
 return {...mod.exports,local,db,calls,timers,listeners,hooks,logs,
  async emit(event,nextSession){for(const fn of authListeners)fn(event,nextSession);await settle();},
  async focus(){for(const fn of listeners.window.get('focus')??[])fn();await settle();},
  async visibility(value){visibility=value;for(const fn of listeners.document.get('visibilitychange')??[])fn();await settle();},
  async runTimers(){const pending=[...timers];for(const [id,timer]of pending){timers.delete(id);await timer.fn();}await settle();},
  async close(){},
  // Inert stand-in kept only for post-restore-barrier.test.mjs (outside LOTE 8 scope); drop with its call.
  useAuthStore:{getState:()=>({initialize:async()=>{},signOut:async()=>{}})},
 };
}
