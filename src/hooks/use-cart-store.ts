"use client";

import { create } from "zustand";

type CartStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
