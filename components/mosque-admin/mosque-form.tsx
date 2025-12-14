"use client";

import { useTransition, useState } from 'react';
import { upsertMosque } from '@/app/actions/mosque';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function MosqueForm({
    initial,
}: {
    initial?: {
        id?: string;
        name?: string;
        address?: string;
        description?: string | null;
        latitude?: number;
        longitude?: number;
        phone?: string | null;
        website?: string | null;
    };
}) {
    const [form, setForm] = useState({
        name: initial?.name || '',
        address: initial?.address || '',
        description: initial?.description || '',
        phone: initial?.phone || '',
        website: initial?.website || '',
    });
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            try {
                await upsertMosque({
                    id: initial?.id,
                    name: form.name,
                    address: form.address,
                    description: form.description || null,
                    phone: form.phone || null,
                    website: form.website || null,
                    latitude: initial?.latitude ?? 0,
                    longitude: initial?.longitude ?? 0,
                });
                setSuccess('Saved successfully');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save');
            }
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Mosque name</label>
                <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                        value={form.website}
                        onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                    />
                </div>
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save mosque'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
    );
}
