import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {loadComponent} from './load-component.mjs';
const require=createRequire(import.meta.url);
const source=ts.transpileModule(readFileSync('src/components/workout/ExerciseDetailSheet.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const module={exports:{}};
const plain=(tag,props)=>React.createElement(tag,props,props.children);
const sheet={Sheet:({children})=>children,SheetContent:({children,className,closeLabel})=>React.createElement('div',{className,'data-close-label':closeLabel},children),SheetTitle:props=>plain('h2',props),SheetDescription:props=>plain('p',props)};
function bars(props){return React.createElement('div',{'data-distribution':JSON.stringify(props.distribution)},'Perfil fornecido');}
new Function('require','module','exports',source)(id=>{
 if(id.endsWith('.css'))return {};
 if(id==='@/components/ui/sheet')return sheet;
 if(id==='@/components/fitness-kit/MuscleBars')return {MuscleBars:bars};
 if(id==='./MuscleDistributionBars')return {MuscleDistributionBars:bars};
 if(id.startsWith('@/'))return loadComponent('src/'+id.slice(2)+(id.includes('workout-labels')||id.includes('/constants/')?'.ts':'.tsx'));
 return require(id);
},module,module.exports);
const {ExerciseDetailSheet}=module.exports;
const exercise={id:'exercise-original-id',name:'Corrida contínua',nameAlternate:'Easy run',category:'running',family:'Corrida',source:'custom',level:'beginner',measureMode:'duration',durationLabel:'20 min',description:'Modelo para registrar a atividade realizada.',focus:'Tempo ativo',instructions:['Registre o tempo praticado.','Conclua os blocos realizados.'],breathing:'Respiração confortável.',benefits:['Consistência'],variations:['Ao ar livre'],contraindications:['Respeite desconfortos.'],muscleDistribution:[{muscleId:'quadriceps',percentage:60}]};
function flatten(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(flatten);return [node,...flatten(node.props?.children)];}

test('both exercise entry variants retain supplied information, distribution and labelled controls in the shared sheet',()=>{
 for(const variant of ['default','fitness']){
  const html=renderToStaticMarkup(React.createElement(ExerciseDetailSheet,{exercise,variant,open:true,onOpenChange(){},onAddToWorkout(){}}));
  for(const value of [exercise.name,exercise.nameAlternate,exercise.description,exercise.focus,exercise.durationLabel,...exercise.instructions,exercise.breathing,...exercise.benefits,...exercise.variations,...exercise.contraindications])assert.ok(html.includes(value),value);
  assert.match(html,/data-close-label="Fechar ficha do exercício"/);assert.match(html,/fitness-exercise-detail-footer/);assert.match(html,/data-distribution=/);assert.doesNotMatch(html,/Corrida · Corrida/);
 }
 assert.equal(ExerciseDetailSheet({exercise:null,open:true,onOpenChange(){}}),null);
});

test('adding preserves the exact exercise object; read-only sheets omit the action and closing delegates unchanged',()=>{
 const calls=[],closed=[],before=JSON.stringify(exercise),onOpenChange=value=>closed.push(value);
 const tree=ExerciseDetailSheet({exercise,variant:'fitness',open:true,onOpenChange,onAddToWorkout:value=>calls.push(value)});
 const action=flatten(tree).find(node=>node.props?.className==='fitness-exercise-add');assert.ok(action);action.props.onClick();
 assert.equal(calls[0],exercise);assert.equal(JSON.stringify(exercise),before);
 tree.props.onOpenChange(false);assert.deepEqual(closed,[false]);
 const readonly=ExerciseDetailSheet({exercise,open:true,onOpenChange});assert.equal(flatten(readonly).some(node=>node.props?.className==='fitness-exercise-add'),false);
});
