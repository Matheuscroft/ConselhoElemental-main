type Scheduler = {
  schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  cancel: (timer: ReturnType<typeof setTimeout>) => void;
};

/** Presentation delay only. Skipping never chooses again, and disposal never publishes. */
export function createDestinyReveal<T>(publish: (value: T) => void, scheduler: Scheduler = {
  schedule: (callback, delay) => setTimeout(callback, delay), cancel: timer => clearTimeout(timer),
}) {
  let pending: { value: T } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const clear = () => { if (timer !== null) scheduler.cancel(timer); timer = null; };
  const finish = () => {
    if (!pending) return;
    const value = pending.value;
    pending = null;
    clear();
    publish(value);
  };
  return {
    get pending() { return pending !== null; },
    start(value: T, delay: number) {
      if (pending) return false;
      const job = { value };
      pending = job;
      if (delay <= 0) finish(); else timer = scheduler.schedule(() => { if (pending === job) finish(); }, delay);
      return true;
    },
    finish,
    dispose() { pending = null; clear(); },
  };
}
