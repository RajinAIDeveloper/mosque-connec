"use client";

import { useState, useTransition } from 'react';
import { createCharity } from '@/app/actions/mosque';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function CharityForm({ mosqueId }: { mosqueId: string }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        goal_amount: '',
        end_date: '',
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
                await createCharity(mosqueId, {
                    mosque_id: mosqueId,
                    title: form.title,
                    description: form.description || null,
                    goal_amount: form.goal_amount ? Number(form.goal_amount) : null,
                    current_amount: 0,
                    end_date: form.end_date || null,
                    image_url: null,
                });
                setSuccess('Charity campaign created');
                setForm({ title: '', description: '', goal_amount: '', end_date: '' });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create charity');
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
                type="number"
                min="0"
                step="0.01"
                placeholder="Goal amount"
                value={form.goal_amount}
                onChange={(e) => setForm((f) => ({ ...f, goal_amount: e.target.value }))}
            />
            <Input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
            />
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create campaign'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
    );
}
