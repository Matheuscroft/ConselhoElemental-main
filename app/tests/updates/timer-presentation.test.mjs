import test from 'node:test';import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup}from'react-dom/server';import{loadComponent}from'../elemental/load-component.mjs';
const{ElementalTimer}=loadComponent('src/components/elemental/ElementalTimer.tsx');
test('all four elemental clocks keep exact supplied time, labelled interaction and working pause/completion affordances',()=>{
 for(const element of ['fogo','agua','ar','terra'])for(const running of [true,false]){
  const html=renderToStaticMarkup(React.createElement(ElementalTimer,{element,running,title:'Atividade temporária',time:'01:24:05',onToggle(){},onComplete(){}}));
  assert.match(html,new RegExp('data-element="'+element+'"'));assert.match(html,new RegExp('data-running="'+running+'"'));assert.match(html,/role="timer" aria-label="Tempo decorrido: 01:24:05"/);assert.match(html,/Sentir a energia de/);assert.match(html,running?/>Pausar<\//:/>Retomar<\//);assert.match(html,/>Concluir<\//);assert.match(html,/Pode bloquear a tela/);
 }
});


test('Earth is a stable material scene with contour paths, not floating polygon confetti or duplicate badges',()=>{
 const html=renderToStaticMarkup(React.createElement(ElementalTimer,{element:'terra',running:true,title:'Leitura',time:'12:34',onToggle(){},onComplete(){}}));
 assert.match(html,/timer-earth-contours/);assert.match(html,/timer-earth-shadow/);assert.match(html,/aria-hidden="true" data-material="terra"/);
 assert.doesNotMatch(html,/<polygon|timer-element-symbol|timer-element-magic|elemental-timer-orbit/);
 assert.equal((html.match(/<img /g)||[]).length,1);assert.match(html,/width="112" height="112"/);assert.doesNotMatch(html,/Planejado:/);
});
