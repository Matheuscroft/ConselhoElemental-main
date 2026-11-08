import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { loadComponent } from './load-component.mjs';
const require = createRequire(import.meta.url);
const { FITNESS_ICONS } = loadComponent('src/components/fitness-kit/FitnessGlyph.tsx');
const flatten = (node) => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(flatten) : [node, ...flatten(node.props?.children)];
const text = (node) => typeof node === 'string' || typeof node === 'number' ? String(node) : Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : '';
function fixture(templates) {
 const states = [], opened = []; let index = 0, explored = 0, focused = 0, tree;
 const catalog = [{ id:'swim', modality:'swimming', primaryMuscles:['chest'] }];
 const before = JSON.stringify({templates,catalog});
 const mock = { useId:()=> 'library', useMemo:fn=>fn(), useRef:()=> ({current:{focus(){focused++;}}}), useState(initial){const i=index++;if(!(i in states))states[i]=initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];} };
 const source = ts.transpileModule(readFileSync('src/components/workout/SavedWorkoutLibrary.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mod = {exports:{}};
 new Function('require','module','exports',source)(id=>id==='react'?mock:id.startsWith('@/')?loadComponent('src/'+id.slice(2)+(id.includes('/components/')?'.tsx':'.ts')):require(id),mod,mod.exports);
 const update = () => {index=0;tree=mod.exports.SavedWorkoutLibrary({templates,catalog,onOpen:id=>opened.push(id),onExplore:()=>explored++});};
 update();
 return {opened, update, before, templates, catalog, get explored(){return explored;}, get focused(){return focused;},
  nodes:()=>flatten(tree), rows:()=>flatten(tree).filter(node=>node.props?.ariaLabel?.startsWith('Ver treino ')),
  click(label){const button=flatten(tree).find(node=>node.type==='button'&&(node.props['aria-label']===label||text(node.props.children)===label));assert.ok(button,label);button.props.onClick();update();},
  search(value){flatten(tree).find(node=>node.type==='input').props.onChange({target:{value}});update();},
 };
}
const templates = () => Array.from({length:14},(_,i)=>({id:`existing-${i}`,name:i===13?'Nado tranquilo':`Movimento ${i}`,modality:i===13?'swimming':'cycling',updatedAt:`2026-11-${String(i+1).padStart(2,'0')}T12:00:00Z`,exercises:i===13?[{exerciseId:'swim'}]:[]}));

test('saved library paginates recent templates without mutating IDs or starting a session; rows open the exact existing ID',()=>{
 const f=fixture(templates());
 assert.equal(f.rows().length,6);assert.equal(f.rows()[0].props.title,'Nado tranquilo');assert.equal(f.rows()[0].props.icon,FITNESS_ICONS.swimming);
 f.rows()[0].props.onClick();assert.deepEqual(f.opened,['existing-13']);
 f.click('Mostrar mais 6 treinos');assert.equal(f.rows().length,12);
 f.click('Mostrar mais 2 treinos');assert.equal(f.rows().length,14);
 f.click('Mostrar menos');assert.equal(f.rows().length,6);
 f.click('Novo treino');assert.equal(f.explored,1);assert.deepEqual(f.opened,['existing-13']);
 assert.equal(JSON.stringify({templates:f.templates,catalog:f.catalog}),f.before);
});

test('search combines name and modality, ignores accents/case and resets pagination; clearing restores the library and focus',()=>{
 const f=fixture(templates());
 f.click('Mostrar mais 6 treinos');
 f.search('NATAÇÃO');assert.equal(f.rows().length,1);assert.equal(f.rows()[0].props.title,'Nado tranquilo');
 f.search('ciclismo MOVIMENTO 12');assert.equal(f.rows().length,1);assert.equal(f.rows()[0].props.title,'Movimento 12');
 f.search('sem correspondencia');assert.equal(f.rows().length,0);assert.ok(f.nodes().find(node=>text(node.props?.children)==='Nenhum treino corresponde à busca.'));
 f.click('Mostrar todos os treinos');assert.equal(f.rows().length,6);assert.equal(f.focused,1);
 f.search('nAtAcAo');assert.equal(f.rows().length,1);
 f.click('Limpar busca de treinos');assert.equal(f.rows().length,6);assert.equal(f.focused,2);
 assert.equal(JSON.stringify({templates:f.templates,catalog:f.catalog}),f.before);
});

test('empty and populated markup expose labelled navigation/search and keep long workout names accessible',()=>{
 const {SavedWorkoutLibrary}=loadComponent('src/components/workout/SavedWorkoutLibrary.tsx');
 const render=(items)=>renderToStaticMarkup(React.createElement(SavedWorkoutLibrary,{templates:items,catalog:[],onOpen(){},onExplore(){}}));
 const empty=render([]);assert.match(empty,/Escolha uma modalidade abaixo/);assert.doesNotMatch(empty,/type="search"/);
 const title='Passeio longo pelo bairro com percurso de ida e volta';
 const html=render([{id:'real-template-id',name:title,modality:'cycling',exercises:[],updatedAt:'invalid'}]);
 assert.ok(html.includes(`aria-label="Ver treino ${title}"`));assert.match(html,/Buscar treinos pelo nome ou modalidade/);assert.match(html,/role="status"/);assert.match(html,/Ciclismo/);assert.match(html,/min-h-12/);
 assert.doesNotMatch(html,/Executar Agora/); // this entry opens a preview; only the existing preview starts sessions
});
