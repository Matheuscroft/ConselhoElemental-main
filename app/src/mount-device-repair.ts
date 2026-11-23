import { clearThisDevice, rawCopyFileName, rawLocalCopy } from './lib/backup/device-repair';

/**
 * `/?progresso=reparar`: the page for a browser that cannot open the app because its saved
 * link to the account no longer matches the account. One screen, two taps: keep a copy of what
 * this browser holds, then clear this browser and go to sign-in. The account is never touched;
 * after signing in again the app brings the account's progress to a device that has none.
 *
 * Plain DOM and inline styles on purpose: this page must work when the app's own scripts and
 * styles are the thing that is stuck, and it loads nothing else.
 */
const GOLD = '#d5b66f';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, css = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (css) node.style.cssText = css;
  return node;
}

async function deleteDatabases(): Promise<void> {
  const factory = indexedDB as IDBFactory & { databases?: () => Promise<Array<{ name?: string }>> };
  if (typeof factory.databases !== 'function') return;
  const list = await factory.databases();
  await Promise.all(list.map(({ name }) => new Promise<void>(done => {
    if (!name) { done(); return; }
    const request = factory.deleteDatabase(name);
    request.onsuccess = request.onerror = request.onblocked = () => done();
  })));
}

function downloadCopy(): void {
  const copy = rawLocalCopy(window.localStorage, window.location.origin);
  const blob = new Blob([JSON.stringify(copy)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = el('a');
  link.href = url;
  link.download = rawCopyFileName(copy);
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function mountDeviceRepair(root: HTMLElement): void {
  document.title = 'Reparar este aparelho — Conselho Elemental';
  const button = (label: string, primary: boolean) => el('button', label,
    `display:block;width:100%;min-height:52px;margin:12px 0;padding:12px 16px;border-radius:14px;font:600 16px/1.2 Inter,system-ui,sans-serif;`
    + (primary ? `background:${GOLD};color:#08090d;border:0;` : `background:transparent;color:#f2efe7;border:1px solid rgba(242,239,231,.35);`));

  const page = el('main', undefined,
    'box-sizing:border-box;min-height:100dvh;padding:28px 20px 40px;background:#08090d;color:#f2efe7;font:400 16px/1.55 Inter,system-ui,sans-serif;');
  const column = el('div', undefined, 'max-width:460px;margin:0 auto;');
  const title = el('h1', 'Reparar este aparelho', `margin:0 0 12px;font:500 26px/1.2 Cinzel,Georgia,serif;color:${GOLD};`);
  title.tabIndex = -1;
  const intro = el('p', 'Use isto se o app não abre e diz que o progresso online mudou ou não corresponde ao vínculo salvo.');
  const effect = el('p', 'Isto limpa só o que este navegador guardou do app e o desliga da conta. A sua conta e o progresso online não são alterados. Depois você entra de novo e o app traz o progresso da conta para cá.');
  const status = el('p', '', `min-height:1.5em;margin:12px 0;color:${GOLD};`);
  status.setAttribute('role', 'status');

  const copyButton = button('1. Baixar uma cópia do que está neste aparelho', false);
  const skipLabel = el('label', undefined, 'display:flex;gap:10px;align-items:flex-start;margin:8px 0;');
  const skip = el('input');
  skip.type = 'checkbox';
  skip.style.cssText = 'width:24px;height:24px;flex:none;margin-top:2px;';
  skipLabel.append(skip, el('span', 'Já tenho uma cópia salva ou não preciso dela.'));
  const repairButton = button('2. Reparar e entrar na conta', true);
  const cancel = el('a', 'Cancelar e voltar', 'display:block;margin-top:20px;text-align:center;color:#aab4c4;');
  cancel.href = '/?progresso=conta';

  let copied = false;
  const refresh = () => { repairButton.disabled = !(copied || skip.checked); repairButton.style.opacity = repairButton.disabled ? '.45' : '1'; };
  refresh();

  copyButton.onclick = () => {
    try { downloadCopy(); copied = true; status.textContent = 'Cópia baixada. Guarde o arquivo em Arquivos antes de continuar.'; }
    catch { status.textContent = 'Não foi possível baixar a cópia. Marque a caixa abaixo se mesmo assim quiser continuar.'; }
    refresh();
  };
  skip.onchange = refresh;
  repairButton.onclick = () => {
    if (repairButton.disabled) return;
    repairButton.disabled = true; copyButton.disabled = true; skip.disabled = true;
    status.textContent = 'Reparando…';
    void (async () => {
      try {
        clearThisDevice(window.localStorage, window.sessionStorage);
        await deleteDatabases();
        status.textContent = 'Pronto. Abrindo a entrada…';
        window.location.replace('/auth');
      } catch {
        status.textContent = 'Não foi possível limpar este navegador. Nada na sua conta foi alterado.';
        copyButton.disabled = false; skip.disabled = false; refresh();
      }
    })();
  };

  column.append(title, intro, effect, copyButton, skipLabel, repairButton, status, cancel);
  page.append(column);
  root.replaceChildren(page);
  title.focus({ preventScroll: true });
}
