'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type MosqueData = {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    phone: string | null;
    website: string | null;
    description: string | null;
    capacity: number | null;
    verified: boolean;
    allows_women: boolean | null;
    madhhab: string | null;
};

export function MosqueEditForm({ mosque }: { mosque: MosqueData }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: mosque.name || '',
        address: mosque.address || '',
        city: mosque.city || '',
        country: mosque.country || '',
        latitude: mosque.latitude || 0,
        longitude: mosque.longitude || 0,
        phone: mosque.phone || '',
        website: mosque.website || '',
        description: mosque.description || '',
        capacity: mosque.capacity?.toString() || '',
        verified: mosque.verified || false,
        allows_women: mosque.allows_women || false,
        madhhab: mosque.madhhab || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!formData.name.trim() || !formData.address.trim()) {
            setError('Mosque name and address are required');
            return;
        }

        startTransition(async () => {
            try {
                const response = await fetch('/api/admin/mosque', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mosqueId: mosque.id,
                        updates: {
                            name: formData.name,
                            address: formData.address,
                            city: formData.city,
                            country: formData.country,
                            latitude: formData.latitude,
                            longitude: formData.longitude,
                            phone: formData.phone || null,
                            website: formData.website || null,
                            description: formData.description || null,
                            capacity: formData.capacity ? parseInt(formData.capacity) : null,
                            verified: formData.verified,
                            allows_women: formData.allows_women,
                            madhhab: formData.madhhab || null,
                        },
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to update mosque');
                }

                setSuccess(true);
                setTimeout(() => {
                    router.push('/admin/mosques');
                    router.refresh();
                }, 1500);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update mosque');
            }
        });
    };

    return (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">City *</label>
                    <Input
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New York"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <Input
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="USA"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Address *</label>
                <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Latitude</label>
                    <Input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                        placeholder="40.7128"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Longitude</label>
                    <Input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                        placeholder="-74.0060"
                    />
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
                    <label className="text-sm font-medium">Capacity</label>
                    <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, verified: checked as boolean }))
                    }
                />
                <label
                    htmlFor="verified"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Verified (Admin approval status)
                </label>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell us about this mosque..."
                    rows={4}
                />
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                    Mosque updated successfully! Redirecting...
                </div>
            )}

            <div className="flex gap-3">
                <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? 'Updating...' : 'Update Mosque'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => router.push('/admin/mosques')}
                    disabled={isPending}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
