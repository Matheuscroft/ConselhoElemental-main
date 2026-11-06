import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { loadComponent } from '../elemental/load-component.mjs';
const {RewardSummary}=loadComponent('src/components/rewards/RewardSummary.tsx');
const render=props=>renderToStaticMarkup(React.createElement(RewardSummary,props));

test('shared receipt distinguishes a paid reward, a reversal, zero and unavailable XP',()=>{
  const gain=render({xp:7,elements:[{element:'agua',amount:3},{element:'agua',amount:4}],animate:true});
  assert.match(gain,/\+7 XP/);assert.match(gain,/Água/);assert.match(gain,/is-fresh/);
  const reversal=render({xp:-7,elements:[{element:'agua',amount:-7}],animate:true});
  assert.match(reversal,/−7 XP/);assert.match(reversal,/Ajuste registrado/);assert.match(reversal,/is-reversal/);assert.doesNotMatch(reversal,/Você avançou/);
  const zero=render({xp:0});assert.match(zero,/Sem XP adicional/);assert.doesNotMatch(zero,/is-fresh|\+0 XP/);
  for(const xp of [null,NaN,Infinity]) {const html=render({xp});assert.match(html,/XP indisponível/);assert.doesNotMatch(html,/Conclusão registrada|is-fresh/);}
});

test('level feedback requires a real positive award and supplied level comparison; history stays still',()=>{
  const progress={level:2,xpTotal:115,xpAtLevelStart:100,xpToNextLevel:222,progressFraction:15/222};
  const html=render({xp:20,progress,fromLevel:1,animate:true});
  assert.match(html,/Você chegou ao nível 2!/);assert.match(html,/aria-valuenow="15"/);
  for(const xp of [0,-20,null])assert.doesNotMatch(render({xp,progress,fromLevel:1}),/Você avançou/);
  assert.doesNotMatch(render({xp:20,progress}),/is-fresh|Você avançou/);
  const css=readFileSync('src/styles/elemental-rewards.css','utf8');
  assert.match(css,/prefers-reduced-motion: reduce/);assert.match(css,/animation: none/);assert.match(css,/transition: none/);
  assert.doesNotMatch(css,/infinite/);assert.match(css,/max-height: 55dvh/);assert.match(css,/min-height: 44px/);
});
