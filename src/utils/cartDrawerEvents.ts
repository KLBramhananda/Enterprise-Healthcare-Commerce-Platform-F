/**
 * Cart Drawer Event Bus
 *
 * Lightweight pub/sub for opening the MiniCartDrawer from anywhere
 * (e.g. toast "View Cart" action) without prop drilling.
 */

type Listener = () => void;

let listeners: Listener[] = [];
let pendingOpen = false;

export const cartDrawerEvents = {
  open(): void {
    pendingOpen = true;
    listeners.forEach((l) => l());
  },

  subscribe(listener: Listener): () => void {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  consumeOpen(): boolean {
    if (pendingOpen) {
      pendingOpen = false;
      return true;
    }
    return false;
  },
};
