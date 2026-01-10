import { create } from "zustand";
import { type PersistOptions, persist } from "zustand/middleware";
import type { Store } from "@/features/stores/queries";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
} | null;

type SelectedStore = Pick<Store, "id" | "name"> | null;

type CustomerState = {
  customer: Customer;
  customerStore: SelectedStore;
};

type CustomerActions = {
  setCustomer: (customer: Customer) => void;
  setCustomerStore: (customerStore: SelectedStore) => void;
};

type CustomerStore = CustomerState & {
  actions: CustomerActions;
};

const persistOptions: PersistOptions<CustomerStore, CustomerState> = {
  name: "krmk-store",
  partialize: ({ actions, ...state }) => state,
};

export const useCustomerStore = create<CustomerStore>()(
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
