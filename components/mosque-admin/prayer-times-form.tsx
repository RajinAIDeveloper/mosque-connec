"use client";

import { useState, useTransition } from 'react';
import { upsertPrayerTimes } from '@/app/actions/mosque';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function PrayerTimesForm({
    mosqueId,
    date = new Date(),
    initial = {},
}: {
    mosqueId: string;
    date?: Date;
    initial?: Partial<Record<PrayerName, string>>;
}) {
    const [times, setTimes] = useState<Partial<Record<PrayerName, string>>>(initial);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            try {
                await upsertPrayerTimes(
                    mosqueId,
                    prayers
                        .filter((p) => times[p])
                        .map((p) => ({
                            mosque_id: mosqueId,
                            prayer_name: p,
                            prayer_time: times[p] as string,
                            date: format(date, 'yyyy-MM-dd'),
                        }))
                );
                setSuccess('Prayer times saved');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to save prayer times');
            }
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prayers.map((p) => (
                    <div key={p} className="space-y-2">
                        <label className="text-sm font-medium capitalize">{p}</label>
                        <Input
                            type="time"
                            value={times[p] || ''}
                            onChange={(e) => setTimes((prev) => ({ ...prev, [p]: e.target.value }))}
                        />
                    </div>
                ))}
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save prayer times'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
    );
}
