'use client';

import { useEffect, useState, useTransition } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MosqueNotificationPreferencesProps {
    mosqueId: string;
}

type Preferences = {
    prayer_times: boolean;
    events: boolean;
    charity: boolean;
};

export function MosqueNotificationPreferences({ mosqueId }: MosqueNotificationPreferencesProps) {
    const [prefs, setPrefs] = useState<Preferences>({
        prayer_times: false,
        events: false,
        charity: false,
    });
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await fetch(`/api/notifications/preferences?mosqueId=${mosqueId}`);

                if (res.status === 401) {
                    setIsSignedIn(false);
                    setIsLoading(false);
                    return;
                }

                if (!res.ok) {
                    setIsLoading(false);
                    return;
                }

                const data = await res.json();
                if (data.preferences) {
                    setPrefs({
                        prayer_times: !!data.preferences.prayer_times,
                        events: !!data.preferences.events,
                        charity: !!data.preferences.charity,
                    });
                }
                setIsSignedIn(true);
            } catch (error) {
                console.error('Error loading notification preferences', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreferences();
    }, [mosqueId]);

    const updatePreference = (field: keyof Preferences, value: boolean) => {
        if (!isSignedIn) {
            toast.error('Sign in to manage notifications');
            return;
        }

        const nextPrefs = { ...prefs, [field]: value };
        setPrefs(nextPrefs);

        startTransition(async () => {
            try {
                const res = await fetch('/api/notifications/preferences', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mosqueId,
                        ...nextPrefs,
                    }),
                });

                if (!res.ok) {
                    throw new Error('Failed to save notification preferences');
                }

                toast.success('Notification preferences updated');
            } catch (error) {
                console.error('Error updating notification preferences', error);
                toast.error('Failed to update notification preferences');
                // revert optimistic update
                setPrefs(prev => ({ ...prev, [field]: !value }));
            }
        });
    };

    if (!isSignedIn) {
        return (
            <p className="text-xs text-muted-foreground">
                Sign in to follow this mosque and receive notifications about prayer times, events, and charity campaigns.
            </p>
        );
    }

    if (isLoading) {
        return <p className="text-xs text-muted-foreground">Loading notification settings...</p>;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label htmlFor="notif-prayer" className="text-sm font-medium">
                        Prayer time updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Get notified when prayer times change.
                    </p>
                </div>
                <Switch
                    id="notif-prayer"
                    checked={prefs.prayer_times}
                    onCheckedChange={(checked) => updatePreference('prayer_times', checked)}
                    disabled={isPending}
                />
            </div>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label htmlFor="notif-events" className="text-sm font-medium">
                        Events
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Be notified about new events at this mosque.
                    </p>
                </div>
                <Switch
                    id="notif-events"
                    checked={prefs.events}
                    onCheckedChange={(checked) => updatePreference('events', checked)}
                    disabled={isPending}
                />
            </div>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <Label htmlFor="notif-charity" className="text-sm font-medium">
                        Charity campaigns
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Get notified when new charity campaigns start.
                    </p>
                </div>
                <Switch
                    id="notif-charity"
                    checked={prefs.charity}
                    onCheckedChange={(checked) => updatePreference('charity', checked)}
                    disabled={isPending}
                />
            </div>
            <p className="text-[10px] text-muted-foreground">
                Notifications are saved per mosque so you can customize how you stay informed.
            </p>
        </div>
    );
}
