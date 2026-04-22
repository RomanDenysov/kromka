import { create } from "zustand";

export type LoginReason = "checkout" | "default";

export interface LoginModalStore {
  isOpen: boolean;
  origin: string | null;
  reason: LoginReason;
}

interface LoginModalActions {
  close: () => void;
  open: (reason?: LoginReason, origin?: string) => void;
}

const useLoginModalStore = create<LoginModalStore & LoginModalActions>(
  (set) => ({
    isOpen: false,
    reason: "default",
    origin: null,
    open: (reason, origin) =>
      set({ isOpen: true, reason, origin: origin ?? null }),
    close: () => set({ isOpen: false, reason: "default", origin: null }),
  })
);

export const useLoginModalOpen = () => useLoginModalStore((s) => s.open);
export const useLoginModalClose = () => useLoginModalStore((s) => s.close);
export const useLoginModalState = () => {
  const reason = useLoginModalStore((s) => s.reason);
  const origin = useLoginModalStore((s) => s.origin);
  const isOpen = useLoginModalStore((s) => s.isOpen);
  return { isOpen, reason, origin };
};

export const useLoginModal = useLoginModalStore;
