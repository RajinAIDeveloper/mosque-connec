'use client';

import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useMemo } from 'react';
import { GoogleMapsProvider } from '@/components/maps/google-maps-provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Navigation } from 'lucide-react';

interface Mosque {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    distance?: number;
}

interface DashboardMapProps {
    userLocation: { lat: number; lng: number } | null;
    mosques: Mosque[];
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

function MapComponent({ userLocation, mosques }: DashboardMapProps) {
    const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);

    const center = useMemo(() => {
        if (userLocation) return userLocation;
        if (mosques.length > 0) {
            return { lat: mosques[0].latitude, lng: mosques[0].longitude };
        }
        return { lat: 40.7128, lng: -74.0060 }; // Default to NYC
    }, [userLocation, mosques]);

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {/* User Location Marker */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                    }}
                    title="You are here"
                />
            )}

            {/* Mosque Markers */}
            {mosques.map((mosque) => (
                <Marker
                    key={mosque.id}
                    position={{ lat: mosque.latitude, lng: mosque.longitude }}
                    onClick={() => setSelectedMosque(mosque)}
                    title={mosque.name}
                />
            ))}

            {/* Info Window */}
            {selectedMosque && (
                <InfoWindow
                    position={{ lat: selectedMosque.latitude, lng: selectedMosque.longitude }}
                    onCloseClick={() => setSelectedMosque(null)}
                >
                    <div className="p-2 max-w-[220px] space-y-2">
                        <div>
                            <h3 className="font-semibold text-sm mb-1">{selectedMosque.name}</h3>
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                                {selectedMosque.address}
                            </p>
                            {selectedMosque.distance && (
                                <p className="text-xs font-medium">
                                    {selectedMosque.distance.toFixed(1)} km away
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <Link href={`/mosques/${selectedMosque.id}`}>
                                <Button size="sm" className="w-full h-7 text-xs">
                                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                            <a
                                href={userLocation
                                    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedMosque.latitude},${selectedMosque.longitude}`
                                    : `https://www.google.com/maps/dir/?api=1&destination=${selectedMosque.latitude},${selectedMosque.longitude}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1">
                                    <Navigation className="h-3 w-3" /> Get Directions
                                </Button>
                            </a>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}

export function DashboardMap(props: DashboardMapProps) {
    return (
        <GoogleMapsProvider>
            <MapComponent {...props} />
        </GoogleMapsProvider>
    );
}
