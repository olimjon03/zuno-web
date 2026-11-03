// An event arriving during a fetch must trigger a trailing fetch, not be lost.
export function createRefreshQueue(
  refresh: () => Promise<void>,
  onError: () => void = () => {},
) {
  let running = false,
    queued = false,
    disposed = false;
  async function drain() {
    running = true;
    while (queued && !disposed) {
      queued = false;
      try {
        await refresh();
      } catch {
        if (!disposed) onError();
      }
    }
    running = false;
  }
  return {
    request() {
      if (disposed) return;
      queued = true;
      if (!running) void drain();
    },
    dispose() {
      disposed = true;
      queued = false;
    },
  };
}
