import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
const output=await build({stdin:{contents:`export * from './src/lib/backup/association-review';`,loader:'ts',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent'});
function loadApi(crypto=webcrypto){const mod={exports:{}};new Function('require','module','exports','crypto',output.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,crypto);return mod.exports;}
const api=loadApi();
const origin='http://fixture.test',userId='verified-synthetic-user';
const gate=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve};};
async function setup(using=api){
 const f=fixture();f.core.getState().createAccount('Meu perfil',false);f.core.getState().addDraft('Ideia local','');f.core.getState().addExperience(13,'ar');f.fitness.getState().addBodyMeasurement({weightKg:70});
 let active=true,currentUser=userId;const context={origin,readLocal:()=>f.captureProgress(origin),isCurrent:()=>active,currentUserId:()=>currentUser,expectedUserId:userId};
 const snapshot=context.readLocal(),review=await using.prepareLocalAssociationReview(context),calls=[];
 const response={complete:true,userId,revision:'revision-1',kind:'empty',archive:null,coverage:{core:Object.keys(snapshot.stores.core.state),fitness:Object.keys(snapshot.stores.fitness.state)}};
 const reader={verifyIdentity:async()=>{calls.push(['identity']);return {userId};},readProgress:async(...args)=>{calls.push(['read',...args]);return response;}};
 return {f,context,review,reader,response,calls,cancel(){active=false;},user(value){currentUser=value;}};
}

test('local review preserves raw progress, exact XP and profiles without I/O and binds only an ephemeral immutable report',async()=>{
 const f=await setup(),before=[...f.f.memory];assert.equal(f.review.profileName,'Meu perfil');assert.equal(f.review.xp.find(x=>x.element==='Ar').amount,13);assert.equal(f.review.summary.drafts,1);assert.equal(f.review.associationAllowed,false);
 assert.ok(Object.isFrozen(f.review));assert.ok(Object.isFrozen(f.review.summary));assert.ok(Object.isFrozen(f.review.xp));assert.ok(f.review.xp.every(Object.isFrozen));
 api.assertLocalAssociationReviewCurrent(f.review,f.context);assert.deepEqual([...f.f.memory],before);assert.deepEqual(f.calls,[]);
 assert.ok(!Object.keys(output.metafile.inputs).some(path=>/stores|supabase|services|capture-progress/.test(path)));
 assert.throws(()=>api.assertLocalAssociationReviewCurrent({...f.review},f.context),/nova conferência/);
});

test('local edits, profile changes, origin changes, cancellation and critical data errors prevent a current review',async()=>{
 for(const mode of ['edit','profile','origin','cancel','audit']){
  const f=await setup();if(mode==='edit')f.f.core.getState().addDraft('Nova','');else if(mode==='profile')f.f.core.getState().createAccount('Outra',false);else if(mode==='origin')f.context.origin='https://other.test';else if(mode==='cancel')f.cancel();else f.f.core.setState(s=>({user:{...s.user,xp_fire:-1}}));
  assert.throws(()=>api.assertLocalAssociationReviewCurrent(f.review,f.context));
  if(mode==='audit')await assert.rejects(api.prepareLocalAssociationReview(f.context),/precisam de revisão/);
 }
 const f=await setup(),pending=api.prepareLocalAssociationReview(f.context);f.f.core.getState().addDraft('Editada durante hash','');await assert.rejects(pending,/progresso ou perfil mudou/);
});

test('remote comparison requires matching current and verified identities; unavailable identity never reads progress or leaks provider errors',async()=>{
 for(const kind of ['current','verified','error']){
  const f=await setup();if(kind==='current')f.user(null);else if(kind==='verified')f.reader.verifyIdentity=async()=>({userId:'foreign-user'});else f.reader.verifyIdentity=async()=>{throw Error('private-provider-details');};
  await assert.rejects(api.prepareRemoteAssociationReview(f.review,f.context,f.reader),e=>!e.message.includes('private-provider-details'));
  assert.ok(!f.calls.some(c=>c[0]==='read'));
 }
});

test('complete empty read stays read-only; omitted or partial reads are never inferred as an empty account',async()=>{
 const f=await setup(),before=[...f.f.memory],result=await api.prepareRemoteAssociationReview(f.review,f.context,f.reader);
 assert.equal(result.remoteSummary,null);assert.equal(result.comparison,null);assert.equal(result.associationAllowed,false);assert.equal(result.revision,'revision-1');assert.deepEqual([...f.f.memory],before);
 assert.deepEqual(f.calls[1],['read',userId,undefined]);
 for(const patch of [{complete:false},{userId:'someone-else'},{revision:''},{revision:'x'.repeat(513)},{coverage:{}},{coverage:{core:[],fitness:[]}},{coverage:{core:f.response.coverage.core,fitness:[...f.response.coverage.fitness,'new-field']}},{kind:undefined},{archive:undefined},{kind:'snapshot',archive:null}]){
  const g=await setup();Object.assign(g.response,patch);await assert.rejects(api.prepareRemoteAssociationReview(g.review,g.context,g.reader));
 }
 const failed=await setup();failed.reader.readProgress=async()=>{throw Error('provider detail');};await assert.rejects(api.prepareRemoteAssociationReview(failed.review,failed.context,failed.reader),/falha não significa conta vazia/);
});

test('a full snapshot can be compared with all recorded XP and data without upload, hydration or binding permission',async()=>{
 const f=await setup(),snapshot=structuredClone(f.context.readLocal());snapshot.stores.core.state.user.xp_air=7;snapshot.stores.core.state.drafts=[];
 f.response.kind='snapshot';f.response.archive=await f.f.createProgressBackup(snapshot);const before=[...f.f.memory];
 const result=await api.prepareRemoteAssociationReview(f.review,f.context,f.reader),xp=result.comparison.accounts[0].xp.find(x=>x.label==='Ar');
 assert.equal(xp.before,13);assert.equal(xp.after,7);assert.equal(result.remoteSummary.drafts,0);assert.equal(result.associationAllowed,false);assert.deepEqual([...f.f.memory],before);assert.equal(f.calls.length,2);
});

test('logout, local edits and cancellation at each remote await discard the old result',async()=>{
 for(const stage of ['identity','progress'])for(const change of ['logout','edit','cancel']){
  const f=await setup(),pending=gate(),entered=gate();
  if(stage==='identity')f.reader.verifyIdentity=async()=>{entered.resolve();await pending.promise;return {userId};};else f.reader.readProgress=async()=>{entered.resolve();await pending.promise;return f.response;};
  const run=api.prepareRemoteAssociationReview(f.review,f.context,f.reader);await entered.promise;
  if(change==='logout')f.user(null);else if(change==='edit')f.f.core.getState().addDraft('Mudou','');else f.cancel();pending.resolve();await assert.rejects(run,/mudou|cancelada/);
 }
});

test('caller mutations after validation starts cannot retarget the chosen user or replace a bound archive/revision',async()=>{
 const entered=gate(),release=gate();let pause=false;
 const guarded=loadApi({subtle:{digest(...args){const result=webcrypto.subtle.digest(...args);if(pause){pause=false;entered.resolve();return release.promise.then(()=>result);}return result;}}});
 const f=await setup(guarded),snapshot=structuredClone(f.context.readLocal());snapshot.stores.core.state.user.xp_air=5;f.response.kind='snapshot';f.response.archive=await f.f.createProgressBackup(snapshot);
 pause=true;const run=guarded.prepareRemoteAssociationReview(f.review,f.context,f.reader);await entered.promise;
 f.response.archive='mutated input';f.response.revision='changed revision';f.context.expectedUserId='hijacked';release.resolve();
 const result=await run;assert.equal(result.userId,userId);assert.equal(result.revision,'revision-1');assert.equal(result.remoteSummary.profiles,1);
});

test('abort signal and malformed/tampered snapshots fail without touching local progress',async()=>{
 const f=await setup(),controller=new AbortController();controller.abort();await assert.rejects(api.prepareRemoteAssociationReview(f.review,{...f.context,signal:controller.signal},f.reader),/cancelada/);assert.deepEqual(f.calls,[]);
 for(const archive of ['{private invalid content}',await f.f.createProgressBackup({...f.context.readLocal(),appVersion:'99.0.0'})]){
  f.response.kind='snapshot';f.response.archive=archive;const before=[...f.f.memory];await assert.rejects(api.prepareRemoteAssociationReview(f.review,f.context,f.reader));assert.deepEqual([...f.f.memory],before);
 }
});
