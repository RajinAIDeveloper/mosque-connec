'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { toast } from 'sonner';

type PrayerTimes = {
    id?: string;
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah?: string;
};

export default function PrayerTimesPage() {
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>({
        fajr: '',
        dhuhr: '',
        asr: '',
        maghrib: '',
        isha: '',
        jummah: '',
    });

    // Fetch prayer times on mount
    useEffect(() => {
        const fetchTimes = async () => {
            try {
                const response = await fetch('/api/mosque/prayer-times');
                const result = await response.json();

                if (result.data) {
                    setPrayerTimes(result.data);
                }
            } catch (error) {
                console.error('Error fetching prayer times:', error);
                toast.error('Failed to load prayer times');
            } finally {
                setLoading(false);
            }
        };

        fetchTimes();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            try {
                const response = await fetch('/api/mosque/prayer-times', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(prayerTimes),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.details || result.error || 'Failed to save');
                }

                toast.success('Prayer times updated successfully');
            } catch (error) {
                console.error('Error saving prayer times:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to save prayer times');
            }
        });
    };

    const handleChange = (field: keyof PrayerTimes, value: string) => {
        setPrayerTimes(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="container max-w-4xl py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href={routes.mosqueAdmin.dashboard}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Prayer Times</h1>
                    <p className="text-muted-foreground">Update your mosque's current prayer schedule</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Current Prayer Schedule
                    </CardTitle>
                    <CardDescription>
                        These times will be displayed to the community. Update them as needed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fajr">Fajr *</Label>
                                    <Input
                                        id="fajr"
                                        type="time"
                                        value={prayerTimes.fajr}
                                        onChange={(e) => handleChange('fajr', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dhuhr">Dhuhr *</Label>
                                    <Input
                                        id="dhuhr"
                                        type="time"
                                        value={prayerTimes.dhuhr}
                                        onChange={(e) => handleChange('dhuhr', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="asr">Asr *</Label>
                                    <Input
                                        id="asr"
                                        type="time"
                                        value={prayerTimes.asr}
                                        onChange={(e) => handleChange('asr', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maghrib">Maghrib *</Label>
                                    <Input
                                        id="maghrib"
                                        type="time"
                                        value={prayerTimes.maghrib}
                                        onChange={(e) => handleChange('maghrib', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="isha">Isha *</Label>
                                    <Input
                                        id="isha"
                                        type="time"
                                        value={prayerTimes.isha}
                                        onChange={(e) => handleChange('isha', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jummah">Jummah (Friday Prayer)</Label>
                                    <Input
                                        id="jummah"
                                        type="time"
                                        value={prayerTimes.jummah || ''}
                                        onChange={(e) => handleChange('jummah', e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={isPending} className="gap-2">
                                    {isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save Prayer Times
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
