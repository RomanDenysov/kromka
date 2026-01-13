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
  guestInfoSavedAt: number | null;
};

type CustomerActions = {
  setCustomer: (customer: Customer) => void;
  setCustomerStore: (customerStore: SelectedStore) => void;
  clearGuestInfo: () => void;
  clearStaleStore: () => void;
};

type CustomerStore = CustomerState & {
  actions: CustomerActions;
};

const persistOptions: PersistOptions<CustomerStore, CustomerState> = {
  name: "krmk-store",
  partialize: ({ actions, ...state }) => state,
};

const createCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      customerStore: null,
      guestInfoSavedAt: null,
      actions: {
        setCustomer: (customer) =>
          set({ customer, guestInfoSavedAt: customer ? Date.now() : null }),
        setCustomerStore: (customerStore) => set({ customerStore }),
        clearGuestInfo: () => set({ customer: null, guestInfoSavedAt: null }),
        clearStaleStore: () => set({ customerStore: null }),
      },
    }),
    persistOptions
  )
);

export const useCustomerData = () => createCustomerStore((s) => s.customer);
export const useSelectedStore = () =>
  createCustomerStore((s) => s.customerStore);
export const useGuestInfoSavedAt = () =>
  createCustomerStore((s) => s.guestInfoSavedAt);

export const useCustomerActions = () => createCustomerStore((s) => s.actions);

// Development sanity check - validates store shape
if (process.env.NODE_ENV === "development") {
  const testStore = createCustomerStore.getState();
  console.assert(
    testStore.actions.setCustomer !== undefined,
    "setCustomer missing"
  );
  console.assert(
    testStore.actions.setCustomerStore !== undefined,
    "setCustomerStore missing"
  );
  console.assert(
    testStore.actions.clearGuestInfo !== undefined,
    "clearGuestInfo missing"
  );
  console.assert(
    testStore.actions.clearStaleStore !== undefined,
    "clearStaleStore missing"
  );
}
