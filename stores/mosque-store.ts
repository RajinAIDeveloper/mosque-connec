import { create } from 'zustand';
import type { Mosque } from '@/types';

interface MosqueState {
    mosques: Mosque[];
    selectedMosque: Mosque | null;
    favorites: string[]; // Mosque IDs
    isLoading: boolean;
    error: string | null;

    // Actions
    setMosques: (mosques: Mosque[]) => void;
    selectMosque: (mosque: Mosque | null) => void;
    addFavorite: (mosqueId: string) => void;
    removeFavorite: (mosqueId: string) => void;
    toggleFavorite: (mosqueId: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useMosqueStore = create<MosqueState>((set, get) => ({
    mosques: [],
    selectedMosque: null,
    favorites: [],
    isLoading: false,
    error: null,

    setMosques: (mosques) => set({ mosques, error: null }),

    selectMosque: (mosque) => set({ selectedMosque: mosque }),

    addFavorite: (mosqueId) =>
        set((state) => ({
            favorites: [...new Set([...state.favorites, mosqueId])],
        })),

    removeFavorite: (mosqueId) =>
        set((state) => ({
            favorites: state.favorites.filter((id) => id !== mosqueId),
        })),

    toggleFavorite: (mosqueId) => {
        const { favorites } = get();
        if (favorites.includes(mosqueId)) {
            get().removeFavorite(mosqueId);
        } else {
            get().addFavorite(mosqueId);
        }
    },

    setLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),
}));
