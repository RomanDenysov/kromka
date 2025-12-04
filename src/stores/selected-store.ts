import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Store } from "@/types/store";

type SelectedStore = Pick<Store, "id" | "name">;

type SelectedStoreState = {
  store: SelectedStore | null;
  isModalOpen: boolean;
  setStore: (store: SelectedStore | null) => void;
  setModalOpen: (open: boolean) => void;
};

export const useSelectedStore = create<SelectedStoreState>()(
  persist(
    (set) => ({
      store: null,
      isModalOpen: false,
      setStore: (store) => set({ store }),
      setModalOpen: (isModalOpen) => set({ isModalOpen }),
    }),
    {
      name: "kromka-store",
      partialize: ({ store }) => ({ store }),
    }
  )
);
