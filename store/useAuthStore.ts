import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id?: number | string;
  fullName?: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  token?: string;
  image?: string;
  role?: "USER" | "WORKER" | "ADMIN";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  updateUser: (partialUser: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : (partialUser as User),
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("@sromojibi_token");
        }
        set({
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "sromojibi-auth-storage",
    }
  )
);
