import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { fixture } from './load-progress.mjs';

const bundled = await build({ stdin:{contents:"export * from './src/lib/backup/account-data-inventory';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':`${process.cwd()}/src`},logLevel:'silent'});
const mod={exports:{}};
new Function('require','module','exports','crypto',bundled.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);
const {inspectAccountDataInventory}=mod.exports;
const uid='11111111-1111-4111-8111-111111111111';

function setup() {
 const f=fixture();f.core.getState().addDraft('Rascunho privado','');
 f.core.getState().addTask({title:'Ritual privado',elementId:'ar',baseValue:2,plannedTimeMinutes:5,effortLevel:2});
 const snapshot=f.captureProgress('https://fixture.test');
 const task=JSON.parse(JSON.stringify(snapshot.stores.core.state.tasks[0]));
 const memory=new Map([
  [f.STORE_KEYS.core,JSON.stringify({state:snapshot.stores.core.state,version:0})],
  [f.STORE_KEYS.fitness,JSON.stringify({state:snapshot.stores.fitness.state,version:0})],
 ]);
 const reads=[];
 const storage={getItem:key=>{reads.push(key);return memory.get(key)??null;},setItem(){throw Error('Unexpected local write');},removeItem(){throw Error('Unexpected local delete');}};
 const calls=[];let identity=uid,truncated=false,remoteTaskPayload=task;
 const client={
  auth:{getUser:async()=>({data:{user:identity?{id:identity}:null},error:null})},
  from(table){
   const call={table,column:null,owner:null};calls.push(call);
   return {select(column){
    call.column=column;
    return {eq(field,owner){
     assert.equal(field,'user_id');call.owner=owner;
     const data=table==='tasks'?[{title:'Ritual privado',local_id:task.id,payload:remoteTaskPayload}]
      :table==='drafts'?[{title:'Rascunho online'}]
      :table==='custom_areas'?[{name:'Área padrão',metadata:{syncSource:'base-catalog'}},{name:'Área minha',metadata:{}}]
      :table==='custom_subareas'?[{name:'Subárea padrão',metadata:{syncSource:'base-catalog'}}]:[];
     return {range:async()=>({data,count:truncated?data.length+1:data.length,error:null})};
    }};
   }};
  },
 };
 return {f,memory,storage,reads,calls,client,identity:value=>{identity=value;},truncated:value=>{truncated=value;},remoteTask:value=>{remoteTaskPayload=value;},task,input:()=>({client,userId:uid,origin:'https://fixture.test',storage,isCurrent:()=>true,readProgress:async userId=>({kind:'legacy',userId})})};
}

test('authenticated legacy inventory reads only own names and leaves both local stores unchanged',async()=>{
 const s=setup(),before=new Map(s.memory);
 const result=await inspectAccountDataInventory(s.input());
 assert.equal(result.kind,'legacy');assert.equal(result.onlineXp,null);
 assert.deepEqual(result.groups.find(g=>g.label==='Rascunhos').local,['Rascunho privado']);
 assert.deepEqual(result.groups.find(g=>g.label==='Rascunhos').online,['Rascunho online']);
 assert.deepEqual(result.groups.find(g=>g.label==='Áreas personalizadas').online,['Área minha']);
 assert.deepEqual(result.groups.find(g=>g.label==='Subáreas personalizadas').online,[]);
 assert.equal(result.legacyCatalogAreas,1);assert.equal(result.legacyCatalogSubareas,1);
 assert.equal(result.groups.find(g=>g.label==='Treinos salvos').online,null);
 assert.deepEqual(result.groups.find(g=>g.label==='Rituais').comparison,{identical:1,changed:0,onlyLocal:0,onlyOnline:0,ambiguous:false});
 assert.ok(s.calls.every(call=>call.owner===uid));
 assert.deepEqual(s.memory,before);
});

test('same name and ID with changed payload is reported as changed',async()=>{
 const s=setup();s.remoteTask({...s.task,baseValue:99});
 const result=await inspectAccountDataInventory(s.input());
 assert.deepEqual(result.groups.find(g=>g.label==='Rituais').comparison,{identical:0,changed:1,onlyLocal:0,onlyOnline:0,ambiguous:false});
});

test('wrong identity and incomplete online list never produce a comparison',async()=>{
 const s=setup();s.identity('another-user');
 await assert.rejects(inspectAccountDataInventory(s.input()),/Entre novamente/);assert.equal(s.calls.length,0);
 s.identity(uid);s.truncated(true);
 await assert.rejects(inspectAccountDataInventory(s.input()),/toda a lista online/);
});

test('integral account reads the verified online archive without querying legacy tables',async()=>{
 const s=setup();
 const snapshot=s.f.captureProgress('https://fixture.test');
 const archive=await s.f.createProgressBackup(snapshot);
 const result=await inspectAccountDataInventory({...s.input(),readProgress:async userId=>({kind:'snapshot',userId,archive})});
 assert.equal(result.kind,'snapshot');
 assert.deepEqual(result.groups.find(g=>g.label==='Rascunhos').online,['Rascunho privado']);
 assert.equal(result.onlineXp,0);assert.equal(s.calls.length,0);
});
