import { create } from 'zustand';

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    isLoading: boolean;
    error: string | null;

    setLocation: (lat: number, lng: number, address?: string) => void;
    clearLocation: () => void;
    requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
    latitude: null,
    longitude: null,
    address: null,
    isLoading: false,
    error: null,

    setLocation: (lat, lng, address) =>
        set({ latitude: lat, longitude: lng, address, error: null }),

    clearLocation: () =>
        set({ latitude: null, longitude: null, address: null, error: null }),

    requestLocation: async () => {
        set({ isLoading: true, error: null });

        try {
            const position = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error('Geolocation is not supported'));
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                }
            );

            set({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to get location',
                isLoading: false,
            });
        }
    },
}));
