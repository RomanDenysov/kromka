import { create } from "zustand";

type SelectedModalStoreState = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export const useSelectedModalStore = create<SelectedModalStoreState>()(
  (set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen }),
  })
);
