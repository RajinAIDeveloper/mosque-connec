'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LocationPicker } from '@/components/maps/location-picker';
import { routes } from '@/config/routes';
import { Input } from '@/components/ui/input';

export function UserLocationForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        address: '',
        city: '',
        country: '',
        latitude: 0,
        longitude: 0,
    });

    const handleLocationChange = (lat: number, lng: number, address: string) => {
        // Parse city and country from address
        const addressParts = address.split(',').map(part => part.trim());
        let city = '';
        let country = '';

        if (addressParts.length >= 2) {
            country = addressParts[addressParts.length - 1];
            city = addressParts[addressParts.length - 2];
        }

        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address,
            city: city || prev.city,
            country: country || prev.country,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.latitude === 0 || formData.longitude === 0) {
            setError('Please set your location using the map or search');
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch('/api/user/location', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        ...formData,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save location');
                }

                // Redirect to dashboard
                window.location.href = routes.community.dashboard;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save location');
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-10 px-4">
            <div>
                <h1 className="text-3xl font-bold">Set your location</h1>
                <p className="text-muted-foreground mt-2">
                    We use your location to show you nearby mosques, prayer times, and events.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <LocationPicker
                    address={formData.address}
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Country</label>
                        <Input
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="Country"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={isPending} size="lg" className="w-full">
                    {isPending ? 'Saving...' : 'Continue to Dashboard'}
                </Button>
            </form>
        </div>
    );
}
