import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';
const output=await build({entryPoints:['src/lib/backup/account-build-config.ts'],bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'}),mod={exports:{}};new Function('module','exports',output.outputFiles[0].text)(mod,mod.exports);const check=mod.exports.assertAccountBuildConfig;
const valid={VITE_SUPABASE_URL:'https://synthetic.supabase.co',VITE_SUPABASE_ANON_KEY:'sb_publishable_synthetic-public-key',VITE_ENABLE_SUPABASE_AUTH:'false',VITE_FORCE_BOOTSTRAP_CLOUD_SYNC:'false'};
test('hosted build requires complete public connection and disabled legacy writers, without mutating or exposing values',()=>{
 const before={...valid};check(valid,true);assert.deepEqual(valid,before);check({},false);
 for(const patch of [{VITE_SUPABASE_URL:''},{VITE_SUPABASE_ANON_KEY:''},{VITE_ENABLE_SUPABASE_AUTH:'true'},{VITE_FORCE_BOOTSTRAP_CLOUD_SYNC:'true'},{VITE_SUPABASE_URL:'https://name:private@synthetic.invalid/'}])assert.throws(()=>check({...valid,...patch},true),e=>!e.message.includes('private@'));
});
test('secret and service-role keys are refused; legacy anon and modern publishable keys are accepted',()=>{
 for(const role of ['anon','service_role']){const key='eyJ.'+Buffer.from(JSON.stringify({role})).toString('base64url')+'.signature';if(role==='anon')check({...valid,VITE_SUPABASE_ANON_KEY:key},true);else assert.throws(()=>check({...valid,VITE_SUPABASE_ANON_KEY:key},true));}
 assert.throws(()=>check({...valid,VITE_SUPABASE_ANON_KEY:'sb_secret_private-value'},true),e=>!e.message.includes('private-value'));
});
