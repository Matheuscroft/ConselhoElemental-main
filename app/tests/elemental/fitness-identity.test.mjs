import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {loadComponent} from './load-component.mjs';
const require=createRequire(import.meta.url);
const {FITNESS_ICONS,FitnessGlyph}=loadComponent('src/components/fitness-kit/FitnessGlyph.tsx');
const {MUSCLE_REGIONS,MUSCLE_TARGETS}=loadComponent('src/constants/muscle-regions.ts');
const {CATEGORY_ICONS}=loadComponent('src/lib/workout/workout-labels.ts');
const render=(component,props)=>renderToStaticMarkup(React.createElement(component,props));

test('every modality, muscle and region has a local vector; informative glyphs expose a label',()=>{
 const paths=new Set();
 for(const Icon of Object.values(FITNESS_ICONS)){
  const html=render(Icon,{});
  assert.match(html,/<svg/);assert.match(html,/aria-hidden="true"/);
  assert.doesNotMatch(html,/<image|<img|<filter|\p{Extended_Pictographic}/u);
  paths.add([...html.matchAll(/<path[^>]+d="([^"]+)"/g)].map(match=>match[1]).join('|'));
 }
 assert.equal(paths.size,Object.keys(FITNESS_ICONS).length);
 for(const entry of [...MUSCLE_REGIONS,...MUSCLE_TARGETS])assert.ok(FITNESS_ICONS[entry.icon],entry.id);
 for(const Icon of Object.values(CATEGORY_ICONS))assert.ok(Object.values(FITNESS_ICONS).includes(Icon));
 const labelled=render(FitnessGlyph,{name:'chest',label:'Peito'});
 assert.match(labelled,/role="img"/);assert.match(labelled,/aria-label="Peito"/);assert.doesNotMatch(labelled,/aria-hidden="true"/);
 const aliases=loadComponent('src/components/fitness-kit/WorkoutReferenceIcons.tsx');
 assert.equal(aliases.RunningReferenceIcon,FITNESS_ICONS.running);
 assert.equal(aliases.SwimmingReferenceIcon,FITNESS_ICONS.swimming);
 assert.equal(aliases.CoreReferenceIcon,FITNESS_ICONS.calisthenics);
 for(const entry of [...MUSCLE_REGIONS,...MUSCLE_TARGETS]) {
  const anatomical=render(FITNESS_ICONS[entry.icon],{size:24});
  assert.match(anatomical,/fitness-glyph-context/);assert.match(anatomical,/fitness-glyph-target/);
 }
 assert.match(render(FITNESS_ICONS.running,{}),/<circle/);
});

test('focus keeps one vote per exercise, ignores unknown IDs and preserves workout-order ties',()=>{
 const {getExerciseFocus,getWorkoutFocus}=loadComponent('src/lib/workout/workout-focus.ts');
 const catalog=[{id:'press',primaryMuscles:['chest','triceps']},{id:'row',primaryMuscles:['lats']},{id:'pull',primaryMuscles:['upper_back']}];
 const workout=ids=>({exercises:ids.map(exerciseId=>({exerciseId}))});
 assert.equal(getExerciseFocus('press',catalog).label,'Peito');
 assert.equal(getExerciseFocus('absent',catalog),undefined);
 assert.deepEqual(getWorkoutFocus(workout(['press','absent','row']),catalog),{label:'Peito',icon:'chest',count:1});
 assert.deepEqual(getWorkoutFocus(workout(['press','row','pull']),catalog),{label:'Costas',icon:'back',count:2});
 assert.equal(getWorkoutFocus(undefined,catalog),undefined);
});

test('saved activity selects the workout and exercise glyph, irrespective of title or muscle tags',()=>{
 const {getWorkoutPresentation,getExercisePresentation}=loadComponent('src/lib/workout/workout-focus.ts');
 const {ALL_CATEGORIES}=loadComponent('src/lib/workout/workout-labels.ts');
 const catalog=ALL_CATEGORIES.map(modality=>({id:modality,modality,name:'Nome livre',primaryMuscles:['chest']}));
 const before=JSON.stringify(catalog);
 for(const modality of ALL_CATEGORIES){
  const template={id:'saved-workout',name:'Passeio pelo Bairro',modality,exercises:[{exerciseId:modality}]};
  const snapshot=JSON.stringify(template);
  const expected=['strength','hypertrophy','calisthenics'].includes(modality)?'chest':modality;
  assert.equal(getWorkoutPresentation(template,catalog).icon,expected,modality);
  assert.equal(getExercisePresentation(modality,catalog).icon,expected,modality);
  assert.equal(JSON.stringify(template),snapshot);
 }
 assert.equal(getWorkoutPresentation({modality:'cycling',exercises:[]},[]).icon,'cycling');
 assert.equal(getWorkoutPresentation({modality:'swimming',exercises:[{exerciseId:'deleted'}]},[]).icon,'swimming');
 assert.equal(getExercisePresentation('deleted',[],'running').icon,'running');
 assert.equal(getWorkoutPresentation(undefined,[],'cycling').icon,'cycling');
 assert.equal(getWorkoutPresentation(undefined,[]).icon,'mixed');
 assert.equal(getWorkoutPresentation({modality:'obsolete',exercises:[]},[]).icon,'mixed');
 assert.equal(JSON.stringify(catalog),before);
});

test('sports catalogue rows use the sport vector even when muscle groups are present',()=>{
 const f=fixture([{id:'bike',modality:'cycling',name:'Passeio',primaryMuscles:['quadriceps']},
  {id:'swim',modality:'swimming',name:'Nado',primaryMuscles:['chest']}]);
 f.click('Ver em lista');
 const rows=f.nodes().filter(node=>node.props?.ariaLabel?.startsWith('Ver '));
 assert.equal(rows[0].props.icon,FITNESS_ICONS.cycling);
 assert.equal(rows[1].props.icon,FITNESS_ICONS.swimming);
 rows[0].props.onClick();assert.equal(f.calls[0],f.exercises[0]);
 assert.equal(JSON.stringify(f.exercises),f.before);
});

function fixture(supplied){
 const exercises=supplied ?? [
  {id:'bar',name:'Supino reto com barra',primaryMuscles:['chest'],secondaryMuscles:['triceps'],strengthProfile:{equipmentIds:['barbell','bench'],contraction:'dynamic'}},
  {id:'dumbbell',name:'Supino com halteres',primaryMuscles:['chest'],secondaryMuscles:[],strengthProfile:{equipmentIds:['dumbbell','bench'],contraction:'dynamic'}},
  {id:'plank',name:'Prancha isométrica',primaryMuscles:['core'],secondaryMuscles:['chest'],strengthProfile:{equipmentIds:[],contraction:'isometric'}},
 ];
 const before=JSON.stringify(exercises),states=[],calls=[];let index=0,tree;
 const mock={useId:()=> 'catalog-test',useState(initial){const i=index++;if(!(i in states))states[i]=initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];}};
 const source=ts.transpileModule(readFileSync('src/components/workout/MuscleExerciseCatalog.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mod={exports:{}};
 new Function('require','module','exports',source)(id=>{
  if(id==='react')return mock;
  if(id.startsWith('@/'))return loadComponent('src/'+id.slice(2)+(id.includes('/components/')?'.tsx':'.ts'));
  return require(id);
 },mod,mod.exports);
 function flatten(node){if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(flatten);return [node,...flatten(node.props?.children)];}
 function update(){index=0;tree=mod.exports.MuscleExerciseCatalog({exercises,onSelect:exercise=>calls.push(exercise)});}
 update();
 return {calls,exercises,before,update,
  nodes:()=>flatten(tree),
  click(label){const text=node=>typeof node==='string'||typeof node==='number'?String(node):Array.isArray(node)?node.map(text).join(''):node&&typeof node==='object'?text(node.props?.children):'';const button=flatten(tree).find(node=>node.type==='button'&&text(node.props.children)===label);assert.ok(button,label);button.props.onClick();update();},
  search(value){flatten(tree).find(node=>node.type==='input'&&node.props.type==='search').props.onChange({target:{value}});update();},
  group(id){flatten(tree).find(node=>node.type==='button'&&node.props.id===`catalog-test-${id}-toggle`).props.onClick();update();},
  ids(){return flatten(tree).filter(node=>node.props?.ariaLabel?.startsWith('Ver ')).map(node=>node.props.title);},
  secondary(){flatten(tree).find(node=>node.type==='input'&&node.props.type==='checkbox').props.onChange({target:{checked:true}});update();},
 };
}

test('catalogue retains filter combinations, secondary muscles and exact exercise callbacks after replacing glyphs',()=>{
 const f=fixture();assert.equal(f.ids().length,0);f.click('Ver em lista');assert.equal(f.ids().length,3);
 f.click('Peito');assert.deepEqual(f.ids(),['Supino reto com barra','Supino com halteres']);
 f.click('Halteres');assert.deepEqual(f.ids(),['Supino com halteres']);
 f.click('Dinâmicos');assert.equal(f.ids().length,1);
 const row=f.nodes().find(node=>node.props?.ariaLabel==='Ver Supino com halteres');row.props.onClick();assert.equal(f.calls[0],f.exercises[1]);
 assert.equal(row.props.subtitle,'Peito · Halteres, Banco');assert.doesNotMatch(row.props.subtitle,/\p{Extended_Pictographic}/u);
 f.click('Limpar filtros');assert.equal(f.ids().length,3);
 f.click('Peito');f.secondary();assert.equal(f.ids().length,3);
 f.click('Isométricos');assert.deepEqual(f.ids(),['Prancha isométrica']);
 assert.equal(JSON.stringify(f.exercises),f.before);
});

test('long exercise names retain their full accessible label and descriptive text',()=>{
 const {FitnessListRow}=loadComponent('src/components/fitness-kit/FitnessListRow.tsx');
 const title='Supino inclinado com halteres e execução alternada';
 const html=render(FitnessListRow,{icon:FITNESS_ICONS.chest,title,subtitle:'Peito · Halteres, Banco',ariaLabel:`Ver ${title}`,onClick(){}});
 assert.ok(html.includes(`aria-label="Ver ${title}"`));assert.ok(html.includes(`title="${title}"`));assert.match(html,/Peito · Halteres, Banco/);assert.doesNotMatch(html,/\p{Extended_Pictographic}/u);
});


test('the actual 124 strength exercises form six disjoint groups without losing IDs or changing source objects',()=>{
 const {STRENGTH_TRAINING_EXERCISES:exercises}=loadComponent('src/constants/strength-training-exercises.ts');
 const {groupCatalogExercises}=loadComponent('src/lib/workout/catalog-navigation.ts');
 const before=JSON.stringify(exercises),groups=groupCatalogExercises(exercises);
 assert.equal(exercises.length,124);assert.equal(groups.length,6);
 const collected=groups.flatMap(group=>group.exercises);
 assert.equal(collected.length,124);assert.equal(new Set(collected.map(exercise=>exercise.id)).size,124);
 for(const exercise of exercises)assert.ok(collected.includes(exercise));
 assert.equal(JSON.stringify(exercises),before);
 const legacy={id:'legacy',name:'Sem marcação',primaryMuscles:[]};assert.equal(groupCatalogExercises([legacy])[0].exercises[0],legacy);
});

test('group disclosure starts compact, paginates and preserves exact selection; another group closes the previous one',()=>{
 const {STRENGTH_TRAINING_EXERCISES:exercises}=loadComponent('src/constants/strength-training-exercises.ts');
 const {groupCatalogExercises}=loadComponent('src/lib/workout/catalog-navigation.ts');
 const groups=groupCatalogExercises(exercises),f=fixture(exercises);
 assert.equal(f.ids().length,0);
 assert.equal(f.nodes().filter(node=>node.type==='button'&&node.props['aria-controls']?.startsWith('catalog-test-')).length,6);
 f.group('chest');assert.equal(f.ids().length,8);
 const first=f.nodes().find(node=>node.props?.ariaLabel?.startsWith('Ver '));first.props.onClick();assert.ok(exercises.includes(f.calls[0]));
 const chest=groups.find(group=>group.id==='chest');
 f.click(`Ver mais ${Math.min(8,chest.exercises.length-8)} exercícios de Peito`);assert.equal(f.ids().length,Math.min(16,chest.exercises.length));
 f.group('arms');assert.equal(f.ids().length,8);
 assert.equal(f.nodes().find(node=>node.props?.id==='catalog-test-chest').props.hidden,true);
 assert.equal(JSON.stringify(exercises),f.before);
});

test('search ignores accents/case, accepts multiple words and composes with equipment filters',()=>{
 const f=fixture();f.search('SUPINO   HALTERES');assert.deepEqual(f.ids(),['Supino com halteres']);
 f.search('isometrica');assert.deepEqual(f.ids(),['Prancha isométrica']);
 f.search('supino');f.click('Halteres');assert.deepEqual(f.ids(),['Supino com halteres']);
 f.search('nao-existe');assert.equal(f.ids().length,0);assert.ok(f.nodes().find(node=>node.props?.message?.startsWith('Nenhum exercício encontrado')));
 f.click('Limpar filtros');assert.equal(f.ids().length,0); // returns to closed groups, not a giant list
 f.group('chest');assert.equal(f.ids().length,2);
 const {matchesCatalogSearch}=loadComponent('src/lib/workout/catalog-navigation.ts');
 assert.equal(matchesCatalogSearch(f.exercises[0],'barra peito'),true);
 assert.equal(matchesCatalogSearch(f.exercises[0],'triceps'),false);
 assert.equal(matchesCatalogSearch(f.exercises[0],'triceps',true),true);
 assert.equal(matchesCatalogSearch(f.exercises[0],'['),false); // literal input, never a regular expression
});
