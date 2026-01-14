import { create } from "zustand";

type StoreModalState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useStoreModalState = create<StoreModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
