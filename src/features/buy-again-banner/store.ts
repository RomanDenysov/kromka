import { create } from "zustand";

const DISMISS_KEY = "buy-again-dismissed";

interface BuyAgainState {
  visible: boolean;
}

interface BuyAgainActions {
  dismiss: () => void;
  init: () => void;
}

const useBuyAgainStore = create<BuyAgainState & BuyAgainActions>((set) => ({
  visible: true,

  init: () => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) {
        set({ visible: false });
      }
    } catch {
      // sessionStorage unavailable (private browsing, cross-origin, etc.)
    }
  },

  dismiss: () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage write failed - still dismiss locally
    }
    set({ visible: false });
  },
}));

export const useBuyAgainVisible = () => useBuyAgainStore((s) => s.visible);
export const useBuyAgainInit = () => useBuyAgainStore((s) => s.init);
export const useBuyAgainDismiss = () => useBuyAgainStore((s) => s.dismiss);
