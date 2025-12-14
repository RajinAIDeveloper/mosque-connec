'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { GoogleMapsProvider } from './google-maps-provider';

interface LocationPickerProps {
    latitude: number;
    longitude: number;
    address?: string;
    onLocationChange: (lat: number, lng: number, address: string) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

const defaultCenter = {
    lat: 40.7128, // New York
    lng: -74.0060,
};

function MapComponent({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    const [center, setCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState(defaultCenter);

    // Update map when props change
    useEffect(() => {
        if (latitude && longitude) {
            const newPos = { lat: latitude, lng: longitude };
            setCenter(newPos);
            setMarkerPosition(newPos);
        } else {
            // Try to get user's current location if no props provided
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const newPos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        };
                        setCenter(newPos);
                        setMarkerPosition(newPos);
                        // Don't auto-update parent yet, let user confirm or click
                    },
                    () => {
                        // Error or denied, keep default
                    }
                );
            }
        }
    }, [latitude, longitude]);

    const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPosition({ lat, lng });

            // Reverse geocode to get address
            try {
                const results = await getGeocode({ location: { lat, lng } });
                const address = results[0]?.formatted_address || '';
                onLocationChange(lat, lng, address);
            } catch (error) {
                console.error('Error reverse geocoding:', error);
                onLocationChange(lat, lng, '');
            }
        }
    }, [onLocationChange]);

    const {
        ready,
        value,
        setValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        debounce: 300,
    });

    const handleSelect = async (address: string) => {
        setValue(address, false);
        clearSuggestions();

        try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);

            setCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
            onLocationChange(lat, lng, address);
        } catch (error) {
            console.error('Error selecting place:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            disabled={!ready}
                            placeholder="Search for a location..."
                            className="pl-9"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                    const { latitude, longitude } = position.coords;
                                    const lat = latitude;
                                    const lng = longitude;
                                    setCenter({ lat, lng });
                                    setMarkerPosition({ lat, lng });
                                    // Reverse geocode
                                    getGeocode({ location: { lat, lng } }).then((results) => {
                                        const address = results[0]?.formatted_address || '';
                                        onLocationChange(lat, lng, address);
                                        setValue(address, false);
                                    });
                                });
                            }
                        }}
                    >
                        <MapPin className="h-4 w-4 mr-2" /> Use My Location
                    </Button>
                </div>

                {status === 'OK' && (
                    <ul className="absolute z-10 w-full bg-popover border rounded-md shadow-md mt-1 max-h-60 overflow-auto">
                        {data.map(({ place_id, description }) => (
                            <li
                                key={place_id}
                                onClick={() => handleSelect(description)}
                                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                            >
                                {description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="border rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={14}
                    onClick={onMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                >
                    <Marker position={markerPosition} />
                </GoogleMap>
            </div>

            <p className="text-xs text-muted-foreground">
                Click on the map or drag the marker to pinpoint the exact location.
            </p>
        </div>
    );
}

export function LocationPicker(props: LocationPickerProps) {
    return (
        <GoogleMapsProvider>
            <MapComponent {...props} />
        </GoogleMapsProvider>
    );
}
