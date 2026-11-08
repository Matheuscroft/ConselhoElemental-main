import test from 'node:test';import assert from 'node:assert/strict';import {loadComponent} from '../elemental/load-component.mjs';
const {newerRelease}=loadComponent('src/lib/updates/release.ts');
test('only a newer valid release is offered; equal/older, malicious redirects and malformed metadata cannot trigger updates',()=>{
 const v=version=>({format:'conselho-release',version});
 assert.equal(newerRelease('0.1.142',v('0.1.143')),'0.1.143');assert.equal(newerRelease('0.1.142',v('0.2.0')),'0.2.0');
 for(const input of [v('0.1.142'),v('0.1.141'),v('0.0.999'),v('https://evil.invalid'),v('2.0.0?x=1'),null,{}, {format:'other',version:'9.0.0'}])assert.equal(newerRelease('0.1.142',input),null);
});
