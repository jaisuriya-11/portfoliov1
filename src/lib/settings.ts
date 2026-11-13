import { createStore, useStore } from "./store";

const KEY = "sakura";

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export const sakuraStore = createStore(read());
export const useSakura = () => useStore(sakuraStore);

/** Show or hide the cherry trees and petals; remembered per visitor. */
export function setSakura(on: boolean) {
  sakuraStore.set(on);
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage blocked — applies for this visit only */
  }
}
