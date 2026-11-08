import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// The motion beats, transpiled once. motion.ts imports nothing, so it runs
// standalone and the pages under test get the real transitions.
const motionTokens = (() => {
  const mod = { exports: {} };
  const out = ts.transpileModule(readFileSync('src/lib/motion/motion.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', out)(() => ({}), mod, mod.exports);
  return mod.exports;
})();
import { loadComponent } from './load-component.mjs';
const recurrence = loadComponent('src/lib/temporal/recurrence.ts');
const require = createRequire(import.meta.url);
const types = ['ACTION', 'HABIT', 'QUEST', 'PROJECT', 'DRAFT'].map(id => ({ id, name: id, icon: 'forja' }));
const collection = { ACTION: 'tasks', HABIT: 'habits', QUEST: 'quests', PROJECT: 'projects', DRAFT: 'drafts' };
const flatten = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(flatten) : [node, ...flatten(node.props?.children)];
const text = node => Array.isArray(node) ? node.map(text).join('') : typeof node === 'object' ? text(node?.props?.children) : String(node ?? '');

/** Runs page handlers against an isolated store double. No browser, persistence or account is accessed. */
function fixture(page, client = null) {
  const slots = [], refs = [], calls = [], cleanups = [];
  let si = 0, ri = 0, tree, mode = 'ok', mounted = false, key;
  const state = { currentAccountId: 'isolated', tasks: [], habits: [], quests: [], projects: [], drafts: [] };
  function command(name, perform) {
    return (...args) => {
      calls.push([name, ...args]);
      if (mode === 'throw') throw new Error('isolated failure');
      if (mode === 'silent') return undefined;
      const result = perform(...args);
      if (mode === 'after-write') throw new Error('isolated post-write failure');
      return result;
    };
  }
  for (const [type, method] of Object.entries({ ACTION: 'addTask', HABIT: 'addHabit', QUEST: 'addQuest', PROJECT: 'addProject', DRAFT: 'addDraft' })) {
    state[method] = command(method, (data, notes) => {
      const entity = { id: `created-${calls.length}`, ...(type === 'DRAFT' ? { title: data, notes } : data) };
      if (mode !== 'unconfirmed') state[collection[type]] = [entity, ...state[collection[type]]]; return entity;
    });
  }
  state.updateDraft = command('updateDraft', (id, values) => { state.drafts = state.drafts.map(d => d.id === id ? { ...d, ...values } : d); });
  state.deleteDraft = command('deleteDraft', id => { state.drafts = state.drafts.filter(d => d.id !== id); });
  state.convertDraft = command('convertDraft', (id, type) => {
    state[collection[type]].push({ id: 'converted', title: 'Idea' });
    state.drafts = state.drafts.filter(d => d.id !== id); return 'converted';
  });
  const useAppStore = Object.assign(selector => selector ? selector(state) : state, { getState: () => state });
  const react = {
    useState(initial) { const i = si++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { return refs[ri++] ??= { current: initial }; }, useEffect(effect) { if (!mounted) cleanups.push(effect()); },
  };
  const stub = new Proxy({}, { get: (_, name) => name });
  const mod = { exports: {} };
  const output = ts.transpileModule(readFileSync(`src/pages/${page}.tsx`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', output)(id => {
    if (id === 'react') return react;
    if (id === 'react/jsx-runtime') return require(id);
    if (id === '@/stores/appStore') return { useAppStore };
    if (id === '@/lib/temporal/recurrence') return recurrence;
    // The real beats: the catch-all proxy turns any unknown export into its
    // own name, so `beatUnless` would arrive here as a string and the page
    // would fail only at render. The module has no imports of its own.
    if (id === '@/lib/motion/motion') return motionTokens;
    if (id === 'react-router-dom') return { useNavigate: () => () => {} };
    if (id.includes('InvocationChoices')) return { ...Object.fromEntries(['InvocationChoices', 'InvocationProgress', 'InvocationStepTitle'].map(n => [n, n])), INVOCATION_TYPES: types };
    if (id === '@/constants') return { AREAS: [{ id: 'area', elementId: 'terra' }], ELEMENTS: { terra: { name: 'Terra' } }, EFFORT_LABELS: Object.fromEntries([1, 2, 3, 4, 5].map(n => [n, { label: 'Esforco', description: 'Descricao' }])) };
    if (id.includes('useMotionPreference')) return { useMotionPreference: () => true };
    if (id === '@/lib/supabase') return { isSupabaseAuthEnabled: !!client, supabase: client };
    if (id === 'framer-motion') return { motion: stub, AnimatePresence: 'AnimatePresence' };
    return stub;
  }, mod, mod.exports);
  const getWorkspace = () => page === 'Forja' ? mod.exports.Forja().props.children : mod.exports.Invocar();
  function unmount() { cleanups.splice(0).forEach(cleanup => cleanup?.()); slots.length = refs.length = 0; mounted = false; }
  function render() {
    const workspace = getWorkspace();
    if (key !== workspace.key) { unmount(); key = workspace.key; }
    si = ri = 0; tree = workspace.type(workspace.props); mounted = true;
  }
  function find(predicate) { return flatten(tree).find(predicate)?.props; }
  render();
  return { state, calls, render, unmount, mode(value) { mode = value; }, find,
    input(id, value) { const input = find(n => n.props?.id === id); assert.ok(input, id); input.onChange({ target: { value } }); render(); },
    click(label) { const button = find(n => typeof n.props?.onClick === 'function' && text(n.props.children) === label); assert.ok(button, label); const result = button.onClick(); render(); return result; },
    submit() { const form = find(n => n.type === 'form' && n.props.className === 'forge-edit') ?? find(n => n.type === 'form'); assert.ok(form); form.onSubmit({ preventDefault() {} }); render(); },
    alerts() { return flatten(tree).filter(n => n.props?.role === 'alert').map(n => text(n.props.children)); },
    open(action) { const card = find(n => n.type === 'ForgeDraftCard'); assert.ok(card); const previous = globalThis.document; globalThis.document = { activeElement: null, getElementById: () => null }; try { card[action]('existing'); } finally { globalThis.document = previous; } render(); },
  };
}

test('Forja keeps title and notes on failure, clears stale success, retries and guards a repeated submit', () => {
  const f = fixture('Forja'); f.input('forge-title', '  Minha ideia  '); f.input('forge-notes', 'Notas');
  for (const mode of ['throw', 'silent', 'unconfirmed']) {
    f.mode(mode); f.submit(); assert.equal(f.alerts().length, 1);
    assert.equal(f.find(n => n.props?.id === 'forge-title').value, '  Minha ideia  ');
    assert.equal(f.find(n => n.props?.id === 'forge-notes').value, 'Notas');
    assert.equal(f.state.drafts.length, 0);
  }
  f.mode('ok'); const submit = f.find(n => n.type === 'form').onSubmit;
  submit({ preventDefault() {} }); submit({ preventDefault() {} }); f.render();
  assert.equal(f.state.drafts.length, 1); assert.equal(f.alerts().length, 0);
  assert.equal(f.find(n => n.props?.id === 'forge-title').value, '');
  f.input('forge-title', 'Outra'); f.mode('throw'); f.submit();
  assert.equal(f.find(n => n.type === 'ForgeFeedback'), undefined);
  f.mode('ok'); f.submit(); assert.equal(f.state.drafts.length, 2);
});

test('Forja edit, delete and conversion preserve the dialog on rejection and confirm only a recorded result', () => {
  for (const action of ['onEdit', 'onDelete', 'onClassify']) {
    const f = fixture('Forja'); f.state.drafts = [{ id: 'existing', title: 'Idea', notes: 'Notas' }]; f.render(); f.open(action);
    if (action === 'onEdit') { f.input('forge-edit-title', 'Nova ideia'); f.input('forge-edit-notes', 'Novas notas'); }
    if (action === 'onClassify') { f.find(n => n.props?.value === 'QUEST').onChange(); f.render(); }
    const invoke = () => action === 'onEdit' ? f.submit() : f.click(action === 'onDelete' ? 'Excluir rascunho' : 'Criar QUEST');
    for (const mode of ['throw', 'silent']) {
      f.mode(mode); invoke(); assert.equal(f.alerts().length, 1);
      assert.equal(f.find(n => n.type === 'Dialog').open, true);
      assert.equal(f.find(n => n.type === 'ForgeFeedback'), undefined);
      if (action === 'onEdit') assert.equal(f.find(n => n.props?.id === 'forge-edit-notes').value, 'Novas notas');
    }
    f.mode('ok'); invoke(); assert.equal(f.find(n => n.type === 'Dialog').open, false);
    assert.equal(f.alerts().length, 0); assert.ok(f.find(n => n.type === 'ForgeFeedback'));
  }
});

test('Forja reports an uncertain conversion even when the source draft disappears before an exception', () => {
  const f = fixture('Forja'); f.state.drafts = [{ id: 'existing', title: 'Idea' }]; f.render(); f.open('onClassify');
  f.find(n => n.props?.value === 'QUEST').onChange(); f.render(); f.mode('after-write'); f.click('Criar QUEST');
  assert.equal(f.state.quests.length, 1); assert.equal(f.find(n => n.type === 'Dialog').open, false);
  assert.ok(f.alerts().some(message => /Confira a lista de atividades/.test(message)));
  assert.equal(f.find(n => n.type === 'ForgeFeedback'), undefined);
});

test('Invocar preserves all five creation forms on failure and calls the original command once on success', () => {
  for (const type of Object.keys(collection)) {
    const f = fixture('Invocar'); f.find(n => n.type === 'InvocationChoices').onChange(type); f.render();
    f.click(`Continuar com ${type}`); f.input('invocar-title', ' Minha atividade '); f.input('invocar-description', 'Meu contexto');
    f.click('Continuar');
    for (const mode of ['throw', 'silent', 'unconfirmed']) {
      f.mode(mode); f.click('Invocar'); assert.equal(f.alerts().length, 1);
      assert.equal(f.find(n => n.type === 'Dialog').open, false);
    }
    f.click('Voltar'); assert.equal(f.find(n => n.props?.id === 'invocar-title').value, ' Minha atividade ');
    assert.equal(f.find(n => n.props?.id === 'invocar-description').value, 'Meu contexto'); f.click('Continuar');
    f.mode('ok'); const click = f.find(n => typeof n.props?.onClick === 'function' && text(n.props.children) === 'Invocar').onClick;
    click(); click(); f.render(); assert.equal(f.state[collection[type]].length, 1);
    assert.equal(f.alerts().length, 0); assert.equal(f.find(n => n.type === 'Dialog').open, true);
    const entity = f.state[collection[type]][0]; assert.equal(entity.title ?? entity.name, 'Minha atividade');
    assert.equal(entity.description ?? entity.notes, 'Meu contexto');
    if (type === 'ACTION') assert.deepEqual([entity.baseValue, entity.effortLevel, entity.plannedTimeMinutes], [1, 2, 30]);
    if (type === 'HABIT') assert.deepEqual([entity.plannedPoints, entity.recurrenceType, entity.recurrenceConfig], [10, 'DAILY', { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }]);
    if (type === 'QUEST' || type === 'PROJECT') assert.equal(entity.xpBonus, type === 'QUEST' ? 50 : 100);
  }
});

test('Invocar refuses an incomplete monthly agenda before any command and retains it for correction', () => {
  const f = fixture('Invocar');
  f.find(n => n.type === 'InvocationChoices').onChange('HABIT'); f.render(); f.click('Continuar com HABIT');
  f.input('invocar-title', 'Atividade mensal'); f.click('Continuar');
  f.find(n => n.type === 'RecurrenceEditor').onChange({ type: 'MONTHLY', config: {} }); f.render();
  f.click('Invocar');
  assert.equal(f.calls.length, 0); assert.match(f.alerts()[0], /dia do mês/);
  f.click('Voltar');
  assert.equal(f.find(n => n.props?.id === 'invocar-title').value, 'Atividade mensal');
  f.click('Continuar');
  assert.equal(f.find(n => n.type === 'RecurrenceEditor').value.type, 'MONTHLY');
  f.find(n => n.type === 'RecurrenceEditor').onChange({ type: 'MONTHLY', config: { daysOfMonth: [15] } }); f.render();
  f.click('Invocar');
  assert.equal(f.calls.length, 1); assert.equal(f.state.habits.length, 1);
  assert.deepEqual(f.state.habits[0].recurrenceConfig, { daysOfMonth: [15] });
});

test('Invocar validates a ritual calendar date before writing and preserves the exact corrected date key', () => {
  const f = fixture('Invocar'); f.click('Continuar com ACTION'); f.input('invocar-title', 'Ritual planejado'); f.click('Continuar');
  f.input('invocar-due', '2026-02-30'); f.click('Invocar');
  assert.equal(f.calls.length, 0); assert.match(f.alerts()[0], /data válida/);
  f.click('Voltar'); f.click('Continuar'); f.input('invocar-due', '2026-11-15'); f.click('Invocar');
  assert.equal(f.state.tasks.length, 1); assert.equal(f.state.tasks[0].dueDate, '2026-11-15');
});


test('Invocar does not show success or retry automatically when an exception follows a local write', () => {
  const f = fixture('Invocar'); f.click('Continuar com ACTION');
  f.input('invocar-title', 'Atividade'); f.click('Continuar'); f.mode('after-write'); f.click('Invocar');
  assert.equal(f.state.tasks.length, 1); assert.equal(f.calls.length, 1);
  assert.equal(f.find(n => n.type === 'Dialog').open, false);
  assert.match(f.alerts()[0], /Confira a lista de destino/);
  f.click('Voltar'); assert.equal(f.find(n => n.props?.id === 'invocar-title').value, 'Atividade');
});

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const suggestion = title => ({ data: { suggestion: { title, description: 'Texto sugerido' } }, error: null });
function assistantClient(sessionPromise) {
  const requests = [];
  return { requests, client: {
    auth: { getSession: () => sessionPromise ?? Promise.resolve({ data: { session: { access_token: 'test-only-token', user: { is_anonymous: false } } }, error: null }) },
    functions: { invoke(name, options) { const result = deferred(); requests.push({ name, options, ...result }); return result.promise; } },
  } };
}
function draftForm(f) {
  f.find(n => n.type === 'InvocationChoices').onChange('DRAFT'); f.render(); f.click('Continuar com DRAFT');
  f.input('invocar-title', 'Meu título'); f.input('invocar-description', 'Meu texto'); f.input('draft-ai-message', ' Só esta ideia ');
  f.find(n => n.type === 'input' && n.props.type === 'checkbox').onChange({ target: { checked: true } }); f.render();
}
const inputValue = (f,id) => f.find(n => n.props?.id === id)?.value;

test('Invocar cancels pending suggestions, preserves manual fields and ignores an old result during a retry', async () => {
  const {client,requests}=assistantClient(); const f=fixture('Invocar',client); draftForm(f);
  const first=f.click('Sugerir título e descrição'); await Promise.resolve();
  assert.equal(requests.length,1);
  assert.deepEqual(requests[0].options.body,{message:'Só esta ideia',consent:true});
  assert.equal(requests[0].options.headers.Authorization,'Bearer test-only-token');
  f.click('Cancelar sugestão'); assert.equal(requests[0].options.signal.aborted,true);
  assert.equal(inputValue(f,'invocar-title'),'Meu título'); assert.equal(inputValue(f,'invocar-description'),'Meu texto');
  const second=f.click('Sugerir título e descrição'); await Promise.resolve(); assert.equal(requests.length,2);
  requests[0].resolve(suggestion('Resposta antiga')); await first; f.render();
  assert.equal(inputValue(f,'invocar-title'),'Meu título');
  assert.equal(f.find(n=>n.props?.id==='invocar-title').disabled,true,'old finally must not release the new request');
  requests[1].resolve(suggestion('Resposta atual')); await second; f.render();
  assert.equal(inputValue(f,'invocar-title'),'Resposta atual'); assert.equal(f.calls.length,0,'suggestion never persists');
  f.click('Continuar'); f.click('Invocar'); assert.equal(f.state.drafts.length,1);
  assert.deepEqual(f.calls,[['addDraft','Resposta atual','Texto sugerido']]); f.unmount();
});

test('Invocar stops before invoke when cancelled while session lookup is pending', async () => {
  const session=deferred(); const {client,requests}=assistantClient(session.promise); const f=fixture('Invocar',client); draftForm(f);
  const pending=f.click('Sugerir título e descrição'); f.click('Cancelar sugestão');
  session.resolve({data:{session:{access_token:'test-only-token',user:{is_anonymous:false}}},error:null});
  await pending; f.render(); assert.equal(requests.length,0); assert.equal(f.calls.length,0);
  assert.equal(inputValue(f,'invocar-title'),'Meu título'); f.unmount();
});

test('Invocar back cancels suggestion and retains manual fields; account change remounts empty without consent', async () => {
  const {client,requests}=assistantClient(); const f=fixture('Invocar',client); draftForm(f);
  const pending=f.click('Sugerir título e descrição'); await Promise.resolve(); f.click('Voltar');
  assert.equal(requests[0].options.signal.aborted,true); requests[0].resolve(suggestion('Tardia')); await pending;
  f.click('Continuar com DRAFT'); assert.equal(inputValue(f,'invocar-title'),'Meu título');
  assert.equal(inputValue(f,'invocar-description'),'Meu texto'); assert.equal(f.calls.length,0);
  f.state.currentAccountId='another'; f.render(); f.click('Continuar com ACTION');
  assert.equal(inputValue(f,'invocar-title'),''); f.click('Voltar');
  f.find(n=>n.type==='InvocationChoices').onChange('DRAFT'); f.render(); f.click('Continuar com DRAFT');
  assert.equal(inputValue(f,'draft-ai-message'),'');
  assert.equal(f.find(n=>n.type==='input'&&n.props.type==='checkbox').checked,false); f.unmount();
});

test('Invocar ignores a response after account switch before render and aborts on unmount', async () => {
  for(const action of ['account','unmount']) {
    const {client,requests}=assistantClient(); const f=fixture('Invocar',client); draftForm(f);
    const pending=f.click('Sugerir título e descrição'); await Promise.resolve();
    if(action==='account') f.state.currentAccountId='another'; else f.unmount();
    requests[0].resolve(suggestion('Não deve preencher')); await pending; f.render();
    if(action==='unmount') assert.equal(requests[0].options.signal.aborted,true);
    f.click('Continuar com ACTION'); assert.equal(inputValue(f,'invocar-title'),''); assert.equal(f.calls.length,0); f.unmount();
  }
});

test('stale manual submit handlers cannot create or edit in another account', () => {
  const f=fixture('Invocar'); f.click('Continuar com ACTION'); f.input('invocar-title','Conta original'); f.click('Continuar');
  const submit=f.find(n=>typeof n.props?.onClick==='function'&&text(n.props.children)==='Invocar').onClick;
  f.state.currentAccountId='another'; submit(); assert.equal(f.calls.length,0); f.render(); f.click('Continuar com ACTION'); assert.equal(inputValue(f,'invocar-title'),'');
  for(const action of ['capture','onEdit','onDelete','onClassify']) {
    const forge=fixture('Forja'); forge.state.drafts=[{id:'existing',title:'Ideia original'}]; forge.render(); let invoke;
    if(action==='capture'){forge.input('forge-title','Captura');invoke=()=>forge.submit();}
    else {forge.open(action);
      if(action==='onEdit') {forge.input('forge-edit-title','Alteração');invoke=()=>forge.submit();}
      else {if(action==='onClassify'){forge.find(n=>n.props?.value==='QUEST').onChange();forge.render();} invoke=forge.find(n=>typeof n.props?.onClick==='function'&&text(n.props.children)===(action==='onDelete'?'Excluir rascunho':'Criar QUEST')).onClick;}
    }
    forge.state.currentAccountId='another';invoke();assert.equal(forge.calls.length,0);assert.equal(forge.state.drafts[0].title,'Ideia original');forge.render();assert.equal(inputValue(forge,'forge-title'),'');
  }
});

test('Forja cancelling edit, deletion or classification performs no command and reopening uses saved fields', () => {
  for(const action of ['onEdit','onDelete','onClassify']) {
    const f=fixture('Forja'); f.state.drafts=[{id:'existing',title:'Título salvo',notes:'Notas salvas'}];f.render();f.open(action);
    if(action==='onEdit') f.input('forge-edit-title','Não salvar');
    if(action==='onClassify'){f.find(n=>n.props?.value==='QUEST').onChange();f.render();}
    f.click('Cancelar');assert.equal(f.calls.length,0);assert.equal(f.find(n=>n.type==='Dialog').open,false);f.open(action);
    if(action==='onEdit') assert.equal(inputValue(f,'forge-edit-title'),'Título salvo');
    if(action==='onClassify') assert.equal(f.find(n=>n.props?.value==='QUEST').checked,false);
    f.find(n=>n.type==='Dialog').onOpenChange(false);f.render();assert.equal(f.calls.length,0);f.unmount();
  }
});
