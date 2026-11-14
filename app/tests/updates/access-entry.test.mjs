import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
const bundled = await build({ entryPoints:['src/lib/backup/access-entry.ts'],bundle:true,platform:'node',format:'cjs',write:false });
const module={exports:{}};new Function('require','module','exports',bundled.outputFiles[0].text)(createRequire(import.meta.url),module,module.exports);
const {accessEntry,shouldShowWelcome}=module.exports;

test('first-run welcome requires absence of both original projections, never decodes or rewrites an existing journey',()=>{
 for(const core of [null,'','broken JSON','existing core'])for(const fitness of [null,'existing fitness']){
  const reads=[],storage={getItem(key){reads.push(key);return key==='conselho-elemental-storage'?core:fitness;}};
  assert.equal(shouldShowWelcome('/',storage),core===null&&fitness===null);
  assert.ok(reads.every(key=>['conselho-elemental-storage','dominio-do-mago-workout-storage-v1'].includes(key)));
 }
 assert.equal(shouldShowWelcome('/santuario',{getItem(){throw Error('must not read');}}),false);
 assert.throws(()=>shouldShowWelcome('/',{getItem(){throw Error('unavailable');}}),/unavailable/);
 assert.equal(accessEntry('/auth',''),'account');assert.equal(accessEntry('/cadastro',''),'account');assert.equal(accessEntry('/boas-vindas',''),'welcome');assert.equal(accessEntry('/rituais',''),null);
});

test('welcome offers only the two real destinations (start, existing account) with no invented rewards or compulsory carousel',()=>{
 const {EntryWelcome}=loadComponent('src/components/entry/EntryWelcome.tsx');
 const html=renderToStaticMarkup(React.createElement(EntryWelcome));
 const hrefs=[...html.matchAll(/href="([^"]*)"/g)].map(m=>m[1]).filter(h=>!h.startsWith('#'));
 assert.deepEqual(hrefs.filter(h=>h!=='/?progresso=inicio'),['/auth?modo=cadastro','/auth']);
 assert.match(html,/>Começar</);assert.match(html,/>Já tenho conta</);assert.doesNotMatch(html,/Experimentar sem conta|trazer meu progresso|Conhecer os quatro/);
 assert.match(html,/Seu cotidiano/);assert.doesNotMatch(html,/aria-roledescription="carousel"|\+[0-9]+ XP/);
 assert.equal((html.match(/<h1 /g)||[]).length,1);
});
