'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { ReactNode } from 'react';

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES,
    });

    if (loadError) {
        return <div>Error loading Google Maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading Maps...</div>;
    }

    return <>{children}</>;
}
