'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationPickerProps {
    address: string;
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number, address: string) => void;
}

export function LocationPicker({ address, latitude, longitude, onLocationChange }: LocationPickerProps) {
    const [searching, setSearching] = useState(false);

    const searchLocation = async () => {
        if (!address.trim()) {
            alert('Please enter an address first');
            return;
        }

        setSearching(true);
        try {
            // Use Nominatim (OpenStreetMap) for geocoding - it's free and doesn't require API keys
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                onLocationChange(lat, lng, data[0].display_name);
            } else {
                alert('Location not found. Please try a different address or enter coordinates manually.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            alert('Failed to find location. Please try again or enter coordinates manually.');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <div className="flex gap-2">
                    <Input
                        value={address}
                        onChange={(e) => onLocationChange(latitude, longitude, e.target.value)}
                        placeholder="Enter mosque address"
                        required
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={searchLocation}
                        disabled={searching}
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {searching ? 'Searching...' : 'Find Location'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Latitude</label>
                    <Input
                        type="number"
                        step="any"
                        value={latitude || ''}
                        onChange={(e) => onLocationChange(parseFloat(e.target.value) || 0, longitude, address)}
                        placeholder="e.g., 40.7128"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Longitude</label>
                    <Input
                        type="number"
                        step="any"
                        value={longitude || ''}
                        onChange={(e) => onLocationChange(latitude, parseFloat(e.target.value) || 0, address)}
                        placeholder="e.g., -74.0060"
                        required
                    />
                </div>
            </div>

            {latitude !== 0 && longitude !== 0 && (
                <div className="rounded-lg border p-4 bg-muted/50">
                    <p className="text-sm font-medium mb-2">Preview Location</p>
                    <a
                        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                    >
                        View on OpenStreetMap →
                    </a>
                </div>
            )}
        </div>
    );
}
