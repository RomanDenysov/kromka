import { create } from "zustand";
import { type PersistOptions, persist } from "zustand/middleware";
import type { Store } from "@/features/stores/queries";

type SelectedStore = Pick<Store, "id" | "name"> | null;

type CustomerState = {
  customerStore: SelectedStore;
};

type CustomerActions = {
  setCustomerStore: (customerStore: SelectedStore) => void;
  clearStaleStore: () => void;
};

type CustomerStore = CustomerState & {
  actions: CustomerActions;
};

const persistOptions: PersistOptions<CustomerStore, CustomerState> = {
  name: "krmk-store",
  partialize: ({ actions, ...state }) => state,
};

/**
 * Store selection persistence
 * DEPRECATED: Guest PII now stored in httpOnly cookies via src/features/checkout/cookies.ts
 * This store is kept only for store selection UI state
 */
const createCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customerStore: null,
      actions: {
        setCustomerStore: (customerStore) => set({ customerStore }),
        clearStaleStore: () => set({ customerStore: null }),
      },
    }),
    persistOptions
  )
);

export const useSelectedStore = () =>
  createCustomerStore((s) => s.customerStore);

export const useCustomerActions = () => createCustomerStore((s) => s.actions);
