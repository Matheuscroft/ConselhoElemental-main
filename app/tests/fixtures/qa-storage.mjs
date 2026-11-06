/** Test harness only. Never pass real app storage as the progress map. */
export const QA_KEY = 'conselho-elemental-disposable-reminder-qa-v1';
export const QA_INTERRUPT_KEY = 'qa-only-interrupt-core-once';
const CORE = 'conselho-elemental-storage';
export function createQaStorage(nativeSession, entries) {
  const saved = nativeSession.getItem(QA_KEY);
  const memory = new Map(saved ? JSON.parse(saved) : entries);
  const persist = () => nativeSession.setItem(QA_KEY, JSON.stringify([...memory]));
  const storage = {
    getItem: key => memory.get(key) ?? null,
    setItem(key, value) {
      const interrupt = key === CORE && memory.get(QA_INTERRUPT_KEY) === 'armed';
      if (interrupt) memory.set(QA_INTERRUPT_KEY, 'used');
      memory.set(key, value);
      persist();
      if (interrupt) throw new Error('Interrupção simulada na QA após gravar a primeira parte. Recarregue e confira a recuperação.');
    },
    removeItem(key) { memory.delete(key); persist(); },
  };
  return { storage, fresh: saved === null, reset: () => nativeSession.removeItem(QA_KEY) };
}
