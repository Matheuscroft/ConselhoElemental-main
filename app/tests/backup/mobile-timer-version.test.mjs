import test from'node:test';import assert from'node:assert/strict';import{createHash,randomUUID}from'node:crypto';import{createAccountDatabase,mobileTimerVersionMigration as migration}from'./load-account-db.mjs';import{fixture}from'./load-progress.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
test('producer142 accepts current/previous archives with active or closed gate and retains all saved account bytes',async()=>{
 for(const release of [true,false]){const db=await createAccountDatabase({release,producerVersion:141});try{
 const f=fixture(),snapshot=f.captureProgress('https://fixture.test'),old=await f.createProgressBackup({...snapshot,appVersion:'0.1.141'}),next=await f.createProgressBackup({...snapshot,appVersion:'0.1.142'}),future=await f.createProgressBackup({...snapshot,appVersion:'0.1.143'}),id=randomUUID();await db.query('insert into auth.users(id)values($1)',[id]);await db.query('insert into progress_private.account_state(user_id,revision,archive,archive_sha256)values($1,$2,$3,$4)',[id,randomUUID(),old,hash(old)]);
 const before=(await db.query('select * from progress_private.account_state')).rows,gate=(await db.query('select * from progress_private.release_gate')).rows;
 await assert.rejects(db.query('select progress_private.validate_archive($1)',[next]),/progress_invalid_archive/);await db.exec(migration);
 for(const raw of[old,next])assert.equal((await db.query('select progress_private.validate_archive($1)as value',[raw])).rows[0].value,hash(raw));await assert.rejects(db.query('select progress_private.validate_archive($1)',[future]),/progress_invalid_archive/);
 assert.deepEqual((await db.query('select * from progress_private.account_state')).rows,before);assert.deepEqual((await db.query('select * from progress_private.release_gate')).rows,gate);
 }finally{await db.close();}}
});
