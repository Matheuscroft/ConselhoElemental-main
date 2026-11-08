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

test('welcome offers real entry, import and guest destinations with no invented rewards or compulsory carousel',()=>{
 const {EntryWelcome}=loadComponent('src/components/entry/EntryWelcome.tsx');
 const html=renderToStaticMarkup(React.createElement(EntryWelcome));
 for(const href of ['/auth?modo=cadastro','/auth','/santuario','/?progresso=restaurar','/onboarding'])assert.ok(html.includes(`href="${href}"`),href);
 assert.match(html,/Seu cotidiano/);assert.doesNotMatch(html,/aria-roledescription="carousel"|\+[0-9]+ XP/);
 assert.equal((html.match(/<h1 /g)||[]).length,1);
});
