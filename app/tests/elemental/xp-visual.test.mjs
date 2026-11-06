import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {loadComponent} from './load-component.mjs';
const {ElementIcon}=loadComponent('src/components/elemental/ArcaneIcon.tsx');
const {ElementalXpBadge}=loadComponent('src/components/rewards/ElementalXpBadge.tsx');
const {ExperienceIcon}=loadComponent('src/components/rewards/ExperienceIcon.tsx');
const html=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));

test('coloured elemental SVGs and XP medallions keep distinct artwork, names and unique gradient references in one tree',()=>{
 const tree=React.createElement('div',{},...['terra','fogo','agua','ar'].flatMap(element=>[React.createElement(ElementIcon,{key:element,element,label:element}),React.createElement(ElementalXpBadge,{key:element+'-xp',element,value:'50'})]));
 const markup=renderToStaticMarkup(tree);
 const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);assert.ok(ids.length>8);assert.equal(new Set(ids).size,ids.length);
 for(const match of markup.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(match[1]),match[1]);
 for(const element of ['terra','fogo','agua','ar'])assert.ok(markup.includes(`aria-label="${element}"`));
 assert.match(html(ExperienceIcon,{label:'Experiência'}),/role="img"/);
 assert.match(html(ExperienceIcon,{}),/aria-hidden="true"/);
 assert.doesNotMatch(markup,/<image|<img|<script|\p{Extended_Pictographic}/u);
 assert.doesNotMatch(html(ElementIcon,{element:'terra',tone:'outline'}),/<linearGradient/);
});

test('XP badges display caller-provided amounts unchanged, including fractions, progress, reversals and unavailable values',()=>{
 for(const value of ['50','+1,25','−3,5','12/30','—']){
  for(const size of ['sm','md']){
   const markup=html(ElementalXpBadge,{value,element:'terra',size});
   assert.ok(markup.includes(`${value} XP · Terra`));assert.ok(markup.includes(`<strong>${value} `));
   assert.match(markup,/data-element="terra"/);assert.match(markup,/role="img"/);
  }
 }
 const markup=html(ElementalXpBadge,{value:'<50>',element:'agua',ariaLabel:'XP recebido · Água'});
 assert.match(markup,/&lt;50&gt;/);assert.match(markup,/XP recebido · Água/);assert.doesNotMatch(markup,/<50>/);
});
