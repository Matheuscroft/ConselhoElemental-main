import test from 'node:test';
import assert from 'node:assert/strict';
import { createQaStorage, QA_KEY, QA_INTERRUPT_KEY } from '../fixtures/qa-storage.mjs';
const core='conselho-elemental-storage', journal='conselho-elemental-restore-journal-v1';
function native(){const memory=new Map([['personal-key','untouched']]),keys=[];return {memory,keys,getItem:k=>{keys.push(k);return memory.get(k)??null;},setItem:(k,v)=>{keys.push(k);memory.set(k,v);},removeItem:k=>{keys.push(k);memory.delete(k);}};}
test('reads and writes only QA envelope, preserves fixture across simulated reload without touching personal keys',()=>{
 const n=native(),q=createQaStorage(n,[[core,'before']]);assert.equal(q.fresh,true);q.storage.setItem('fixture-extra','test');const reload=createQaStorage(n,[]);assert.equal(reload.fresh,false);assert.equal(reload.storage.getItem(core),'before');assert.equal(reload.storage.getItem('fixture-extra'),'test');assert.equal(n.memory.get('personal-key'),'untouched');assert.ok(n.keys.every(k=>k===QA_KEY));
});
test('interrupts once AFTER core write, persists journal and disarms across reload for recovery',()=>{
 const n=native(),q=createQaStorage(n,[[core,'before']]);q.storage.setItem(QA_INTERRUPT_KEY,'armed');q.storage.setItem(journal,'prepared');assert.throws(()=>q.storage.setItem(core,'target'),/Interrupção simulada/);const reload=createQaStorage(n,[]);assert.equal(reload.storage.getItem(core),'target');assert.equal(reload.storage.getItem(journal),'prepared');assert.equal(reload.storage.getItem(QA_INTERRUPT_KEY),'used');assert.doesNotThrow(()=>reload.storage.setItem(core,'before'));assert.equal(reload.storage.getItem(core),'before');
});
test('reset deletes only QA fixture; a new seed is used next time',()=>{
 const n=native(),q=createQaStorage(n,[[core,'before']]);q.storage.setItem(core,'changed');q.reset();assert.equal(n.memory.has(QA_KEY),false);assert.equal(n.memory.get('personal-key'),'untouched');assert.equal(createQaStorage(n,[[core,'new']]).storage.getItem(core),'new');
});
