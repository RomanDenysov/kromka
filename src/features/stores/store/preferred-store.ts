import { create } from "zustand";

interface PreferredStoreState {
  clear: () => void;
  setStoreId: (id: string) => void;
  storeId: string | null;
}

const usePreferredStoreStore = create<PreferredStoreState>((set) => ({
  storeId: null,
  setStoreId: (id) => set({ storeId: id }),
  clear: () => set({ storeId: null }),
}));

export const usePreferredStoreId = () =>
  usePreferredStoreStore((s) => s.storeId);
export const useSetPreferredStore = () =>
  usePreferredStoreStore((s) => s.setStoreId);
export const useClearPreferredStore = () =>
  usePreferredStoreStore((s) => s.clear);
