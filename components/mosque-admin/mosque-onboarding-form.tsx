'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LocationPicker } from '@/components/maps/location-picker';
import { routes } from '@/config/routes';

import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function MosqueOnboardingForm({ userId }: { userId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        country: '',
        latitude: 0,
        longitude: 0,
        phone: '',
        website: '',
        description: '',
        allows_women: false,
        madhhab: '',
    });

    const handleLocationChange = (lat: number, lng: number, address: string) => {
        // Parse city and country from address
        // Common format: "Street, City, State/Province, Country"
        const addressParts = address.split(',').map(part => part.trim());

        let city = '';
        let country = '';

        if (addressParts.length >= 2) {
            // Last part is usually country
            country = addressParts[addressParts.length - 1];
            // Second to last is usually city or state
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

        if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim() || !formData.country.trim()) {
            setError('Mosque name, address, city, and country are required');
            return;
        }

        if (formData.latitude === 0 || formData.longitude === 0) {
            setError('Please set the mosque location using the "Find Location" button or enter coordinates manually');
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch('/api/mosques/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        userId,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to create mosque');
                }

                // Hard redirect to mosque admin dashboard after mosque creation
                window.location.href = routes.mosqueAdmin.dashboard;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create mosque');
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-10 px-4">
            <div>
                <h1 className="text-3xl font-bold">Set up your mosque</h1>
                <p className="text-muted-foreground mt-2">
                    Provide your mosque details. A super admin will verify your account before it becomes public.
                    Once verified, you'll be able to manage prayer times, events, and more.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mosque name *</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Al-Noor Mosque"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                            type="tel"
                        />
                    </div>
                </div>

                <LocationPicker
                    address={formData.address}
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">City *</label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="New York"
                            required
                        />
                        <p className="text-xs text-muted-foreground">Auto-filled from address, you can edit if needed</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Country *</label>
                        <Input
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="USA"
                            required
                        />
                        <p className="text-xs text-muted-foreground">Auto-filled from address, you can edit if needed</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Website</label>
                        <Input
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://www.example.com"
                            type="url"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Madhhab (Optional)</label>
                        <Select
                            value={formData.madhhab}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, madhhab: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Madhhab" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hanafi">Hanafi</SelectItem>
                                <SelectItem value="shafi">Shafi'i</SelectItem>
                                <SelectItem value="maliki">Maliki</SelectItem>
                                <SelectItem value="hanbali">Hanbali</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="allows_women"
                        checked={formData.allows_women}
                        onCheckedChange={(checked) =>
                            setFormData(prev => ({ ...prev, allows_women: checked as boolean }))
                        }
                    />
                    <label
                        htmlFor="allows_women"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Allows women to pray here
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell us about your mosque..."
                        rows={4}
                    />
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto">
                    {isPending ? 'Creating mosque...' : 'Save and continue'}
                </Button>
            </form>
        </div>
    );
}
