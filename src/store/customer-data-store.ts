import { create } from "zustand";
import { type PersistOptions, persist } from "zustand/middleware";
import type { Store } from "@/lib/queries/stores";

type CustomerData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  isAnonymous: boolean;
} | null;

type SelectedStore = Pick<Store, "id" | "name"> | null;

type CustomerDataState = {
  customer: CustomerData;
  customerStore: SelectedStore;
};

type CustomerDataActions = {
  setCustomer: (customer: CustomerData) => void;
  setCustomerStore: (customerStore: SelectedStore) => void;
};

type CustomerDataStore = CustomerDataState & {
  actions: CustomerDataActions;
  _hasHydrated: boolean;
};

const persistOptions: PersistOptions<CustomerDataStore, CustomerDataState> = {
  name: "kromka-customer-data",
  partialize: ({ actions, ...state }) => state,
  onRehydrateStorage: () => (state) => {
    if (state) {
      state._hasHydrated = true;
    }
  },
};

export const useCustomerDataStore = create<CustomerDataStore>()(
  persist(
    (set) => ({
      customer: null,
      customerStore: null,
      _hasHydrated: false,
      actions: {
        setCustomer: (customer) => set({ customer }),
        setCustomerStore: (customerStore) => set({ customerStore }),
      },
    }),
    persistOptions
  )
);
