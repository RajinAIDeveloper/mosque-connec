import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    language: 'en' | 'bn';
    toggleTheme: () => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setLanguage: (language: 'en' | 'bn') => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'light',
            sidebarOpen: true,
            language: 'en',

            toggleTheme: () =>
                set((state) => ({
                    theme: state.theme === 'light' ? 'dark' : 'light',
                })),

            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'ui-storage',
        }
    )
);
