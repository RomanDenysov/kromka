import type { User } from "better-auth";
import { create } from "zustand";
import { type PersistOptions, persist } from "zustand/middleware";

type SessionCache = {
  wasAuthenticated: boolean;
  cachedUser: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
};

type SessionCacheActions = {
  setCache: (user: User | null, isAnonymous: boolean) => void;
  clear: () => void;
};

type SessionCacheStore = SessionCache & {
  actions: SessionCacheActions;
};

const persistOptions: PersistOptions<SessionCacheStore, SessionCache> = {
  name: "kromka-session-cache",
  partialize: ({ actions, ...state }) => state,
};

export const useSessionCache = create<SessionCacheStore>()(
  persist(
    (set) => ({
      wasAuthenticated: false,
      cachedUser: null,
      actions: {
        setCache: (user, isAnonymous) =>
          set({ wasAuthenticated: !isAnonymous, cachedUser: user }),
        clear: () => set({ wasAuthenticated: false, cachedUser: null }),
      },
    }),
    persistOptions
  )
);

export const useSessionCacheActions = () => useSessionCache((s) => s.actions);

export const useWasAuthenticated = () =>
  useSessionCache((s) => s.wasAuthenticated);

export const useCachedUser = () => useSessionCache((s) => s.cachedUser);
