import { create } from "zustand";
import { type PersistOptions, persist } from "zustand/middleware";
import type { Store } from "@/lib/queries/stores";

type CustomerData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
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
};

const persistOptions: PersistOptions<CustomerDataStore, CustomerDataState> = {
  name: "kromka-customer-data",
  partialize: ({ actions, ...state }) => state,
};

export const useCustomerDataStore = create<CustomerDataStore>()(
  persist(
    (set) => ({
      customer: null,
      customerStore: null,
      actions: {
        setCustomer: (customer) => set({ customer }),
        setCustomerStore: (customerStore) => set({ customerStore }),
      },
    }),
    persistOptions
  )
);
