"use client";

import { useState, useTransition } from 'react';
import { createEvent } from '@/app/actions/mosque';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function EventForm({ mosqueId }: { mosqueId: string }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        event_date: '',
        location: '',
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
                await createEvent(mosqueId, {
                    mosque_id: mosqueId,
                    title: form.title,
                    description: form.description || null,
                    category: form.category || null,
                    event_date: form.event_date,
                    location: form.location || null,
                    image_url: null,
                });
                setSuccess('Event created');
                setForm({ title: '', description: '', category: '', event_date: '', location: '' });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create event');
            }
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
            />
            <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Input
                placeholder="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
            <Input
                type="datetime-local"
                value={form.event_date}
                onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                required
            />
            <Input
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create event'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
    );
}
