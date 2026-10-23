// Local UI/store regression. Auth/provider are simulated; no .env or remote calls.
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import puppeteer from 'puppeteer';

const root = fileURLToPath(new URL('../../', import.meta.url));
const artifacts = await mkdtemp(path.join(tmpdir(), 'conselho-i03-'));
const server = await createServer({
  root,
  envDir: false,
  server: { host: '127.0.0.1', port: 0 },
  plugins: [{
    name: 'isolated-i03-auth-provider',
    enforce: 'pre',
    transform(source, id) {
      if (id === path.join(root, 'src/pages/Invocar.tsx')) {
        return source.replace("from '@/lib/supabase'", "from 'virtual:i03-test'");
      }
    },
    resolveId(id) {
      if (id === 'virtual:i03-test') return '\0virtual:i03-test';
    },
    load(id) {
      if (id !== '\0virtual:i03-test') return;
      return `
        export const isSupabaseAuthEnabled = true;
        export const supabase = {
          auth: { async getSession() {
            return { data: { session: window.i03Mode === 'session'
              ? null : { user: { is_anonymous: false }, access_token: 'fixture-jwt' } } };
          }},
          functions: { async invoke(name, options) {
            window.i03Calls.push({ name, body: options.body, headers: options.headers });
            if (window.i03Mode === 'invalid') return { data: { suggestion: { title: 'Incomplete' } } };
            if (Number(window.i03Mode)) return {
              error: { context: new Response(null, { status: Number(window.i03Mode) }) }
            };
            return { data: { suggestion: {
              title: 'Organizar materiais', description: 'Separar os materiais de estudo.'
            } } };
          }}
        };
      `;
    },
  }],
});
let browser;
try {
  await server.listen();
  const address = server.httpServer.address();
  const base = `http://127.0.0.1:${address.port}`;
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().startsWith(base) || /^(data:|blob:)/.test(request.url())) {
      void request.continue();
    } else {
      void request.abort();
    }
  });
  await page.evaluateOnNewDocument(() => {
    window.i03Calls = [];
    window.i03Mode = '';
  });
  const clickText = async (text) => {
    const handle = await page.waitForFunction(label => [...document.querySelectorAll('main button')]
      .find(button => (button.textContent.trim() === label || [...button.querySelectorAll('div')].some(el => el.textContent === label)) && button.getBoundingClientRect().width > 0), {}, text);
    const button = handle.asElement();
    await button.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await button.click();
    await new Promise(resolve => setTimeout(resolve, 350));
  };
  const snapshot = () => page.evaluate(async () => {
    const { useAppStore } = await import('/src/stores/appStore.ts');
    const state = useAppStore.getState();
    return JSON.parse(JSON.stringify({
      drafts: state.drafts, tasks: state.tasks, habits: state.habits,
      projects: state.projects, quests: state.quests,
      executionLogs: state.executionLogs, user: state.user,
    }));
  });
  const startDraft = async () => {
    await page.goto(`${base}/invocar`, { waitUntil: 'networkidle0' });
    await clickText('Rascunho');
    await clickText('Continuar');
    await page.waitForSelector('#draft-ai-message');
  };
  await startDraft();
  const before = await snapshot();
  await page.type('#draft-ai-message', 'Organizar meus materiais de estudo');
  assert.equal(await page.$eval('section button', el => el.disabled), true);
  assert.equal(await page.evaluate(() => window.i03Calls.length), 0);
  await page.click('section input[type=checkbox]');
  await clickText('Sugerir título e descrição');
  assert.deepEqual(await snapshot(), before, 'suggestion must not write domain data');
  assert.deepEqual(await page.evaluate(() => window.i03Calls), [{
    name: 'assistant-suggest',
    body: { message: 'Organizar meus materiais de estudo', consent: true },
    headers: { Authorization: 'Bearer fixture-jwt' },
  }]);
  await page.type('#invocar-title', ' revisado');
  await page.type('#invocar-description', ' Conferir caixas.');
  await clickText('Continuar');
  assert.deepEqual(await snapshot(), before, 'review must not save');
  const summary = await page.evaluate(() => [...document.querySelectorAll('h4')]
    .find(el => el.textContent === 'Resumo').parentElement.textContent);
  assert(summary.includes('Organizar materiais revisado'), 'confirmation must show draft title');
  assert(summary.includes('Conferir caixas.'), 'confirmation must show draft description');
  for (const width of [360, 390, 768]) {
    await page.setViewport({ width, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `confirmation overflow at ${width}`);
    await page.screenshot({ path: path.join(artifacts, `confirmation-${width}.png`), fullPage: true });
  }
  await clickText('Invocar');
  const saved = await snapshot();
  assert.equal(saved.drafts.length, before.drafts.length + 1);
  assert.equal(saved.drafts[0].title, 'Organizar materiais revisado');
  assert.equal(saved.drafts[0].notes, 'Separar os materiais de estudo. Conferir caixas.');
  assert.deepEqual({ ...saved, drafts: before.drafts }, before, 'other domain state unchanged');
  await page.reload({ waitUntil: 'networkidle0' });
  assert.deepEqual(await snapshot(), saved, 'confirmed draft survives reload');
  for (const mode of ['401', '429', '503', '502', 'invalid', 'session']) {
    await startDraft();
    await page.type('#invocar-title', 'Manual preservado');
    await page.type('#invocar-description', 'Notas preservadas');
    await page.type('#draft-ai-message', 'Ideia de teste');
    await page.click('section input[type=checkbox]');
    await page.evaluate(value => { window.i03Mode = value; }, mode);
    await clickText('Sugerir título e descrição');
    assert.equal(await page.$eval('#invocar-title', el => el.value), 'Manual preservado');
    assert.equal(await page.$eval('#invocar-description', el => el.value), 'Notas preservadas');
    assert(await page.$eval('section [role=status]', el => el.textContent.length > 0));
    if (mode === 'session') assert.equal(await page.evaluate(() => window.i03Calls.length), 0);
    assert.deepEqual(await snapshot(), saved, `failure ${mode} must not save`);
  }
  await clickText('Continuar');
  await clickText('Invocar');
  assert.equal((await snapshot()).drafts.length, saved.drafts.length + 1, 'manual fallback saves');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'passed', artifacts, errors, cases: [
    'consent', 'minimal payload/JWT', 'suggestion without writes', 'editable review',
    'confirmation/addDraft/reload', 'domain preserved', '401/429/503/502/invalid/session',
    'manual fallback', 'confirmation overflow 360/390/768',
  ] }, null, 2));
} finally {
  await browser?.close();
  await server.close();
}
