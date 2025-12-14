import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface UserState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    updateUser: (updates: Partial<User>) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,

            setUser: (user) => set({ user, isLoading: false }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),

            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
