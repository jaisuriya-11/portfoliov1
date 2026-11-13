import { useSyncExternalStore } from "react";

/** A tiny observable value, readable outside React and as a hook inside it. */
export function createStore<T>(initial: T) {
  let value = initial;
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      subs.forEach((f) => f());
    },
    subscribe(fn: () => void) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export function useStore<T>(store: { get(): T; subscribe(fn: () => void): () => void }) {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
