import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

function component(file, name) { return loadComponent(`src/components/elemental/${file}.tsx`)[name]; }
const ElementalTimer = await component('ElementalTimer', 'ElementalTimer');
const ShowcaseCard = await component('ShowcaseCard', 'ShowcaseCard');
const ExpandedElements = await component('ExpandedElements', 'ExpandedElements');
function nodes(element, type) {
  if (!React.isValidElement(element)) return [];
  return [...(element.type === type ? [element] : []), ...React.Children.toArray(element.props.children).flatMap(child => nodes(child, type))];
}

test('timer exposes the supplied time and passes controls to their existing owners once', () => {
  let toggle = 0; let complete = 0;
  const props = { title: 'Ritual de teste', element: 'agua', time: '01:02:03', running: true, onToggle: () => toggle++, onComplete: () => complete++ };
  const tree = ElementalTimer(props);
  const buttons = nodes(tree, 'button');
  assert.equal(buttons.length, 2);
  buttons[0].props.onClick(); buttons[1].props.onClick();
  assert.equal(toggle, 1); assert.equal(complete, 1);
  const html = renderToStaticMarkup(React.createElement(ElementalTimer, props));
  assert.match(html, /role="timer"/); assert.match(html, /01:02:03/); assert.match(html, /Pausar/);
  assert.doesNotMatch(html, /aria-live="assertive"/);
  const paused = renderToStaticMarkup(React.createElement(ElementalTimer, { ...props, running: false }));
  assert.match(paused, /Retomar/); assert.match(paused, /data-running="false"/);
});

test('showcase keeps metadata, supplied progress and the detail callback without completing anything', () => {
  let opened = 0;
  const props = { title: 'Jornada <teste>', description: 'Descrição existente', element: 'terra', status: 'Em andamento', progress: 37.5, chips: ['Casa', '2/8 itens'], reward: 'Recompensa existente', onOpen: () => opened++ };
  const html = renderToStaticMarkup(React.createElement(ShowcaseCard, props));
  assert.match(html, /<details/); assert.match(html, /<summary/);
  for (const text of ['Jornada &lt;teste&gt;', 'Descrição existente', '37.5', '2/8 itens', 'Recompensa existente']) assert.ok(html.includes(text));
  assert.equal(opened, 0);
  nodes(ShowcaseCard(props), 'button')[0].props.onClick();
  assert.equal(opened, 1);
});

test('expanded rail exposes four real buttons and collapsed destination previews in server markup', () => {
  const elements = ['fogo', 'ar', 'agua', 'terra'].map(id => ({ id, name: id, description: `Área ${id}`, scoreLabel: '0 pontos registrados' }));
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ExpandedElements, { elements })));
  assert.equal((html.match(/aria-controls="expanded-/g) || []).length, 4);
  assert.equal((html.match(/aria-expanded="true"/g) || []).length, 0);
  assert.equal((html.match(/ inert=""/g) || []).length, 4);
  for (const { id } of elements) assert.ok(html.includes(`href="/santuario/elementos/${id}"`));
  for (const { id } of elements) assert.ok(html.includes(`-${id}"`));
});
