import { create } from "zustand";

interface ContextRailStore {
  initialize: (open: boolean) => void;
  initialized: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useContextRailStore = create<ContextRailStore>((set) => ({
  open: true,
  initialized: false,
  initialize: (open) => set({ open, initialized: true }),
  setOpen: (open) => set({ open, initialized: true }),
}));

export const useContextRailOpen = () => useContextRailStore((s) => s.open);
export const useContextRailInitialized = () =>
  useContextRailStore((s) => s.initialized);
export const useContextRailSetOpen = () =>
  useContextRailStore((s) => s.setOpen);
export const useContextRailInitialize = () =>
  useContextRailStore((s) => s.initialize);
