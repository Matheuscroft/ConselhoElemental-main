import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';
const { ElementalTopBar, AccountSeal } = loadComponent('src/components/layout/ElementalTopBar.tsx');
const nodes = (tree, tag) => React.isValidElement(tree) ? [...(tree.type === tag ? [tree] : []), ...React.Children.toArray(tree.props.children).flatMap(child => nodes(child, tag))] : [];
test('header exposes real home/explore/back controls and preserves supplied action', () => {
  let back = 0, explore = 0;
  const tree = ElementalTopBar({ title: 'Ciclos', onBack: () => back++, onExplore: () => explore++, exploreOpen: true, children: React.createElement('button', null, 'Conta') });
  const buttons = nodes(tree, 'button');
  buttons[0].props.onClick(); buttons[1].props.onClick();
  assert.equal(back, 1); assert.equal(explore, 1);
  assert.equal(buttons[1].props['aria-expanded'], true);
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, tree));
  assert.match(html, /href="\/santuario"/); assert.match(html, /Conta/);
  assert.doesNotMatch(html, /Notificações|🧙|animate-pulse/);
});
test('account seal is decorative and header omits back action unless supplied', () => {
  assert.equal(String(AccountSeal().props['aria-hidden']), 'true');
  const tree = ElementalTopBar({ title: 'Lua', onExplore() {}, exploreOpen: false, children: null });
  assert.equal(nodes(tree, 'button').length, 1);
});
