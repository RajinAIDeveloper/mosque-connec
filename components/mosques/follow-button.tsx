'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function FollowButton({ mosqueId }: { mosqueId: string }) {
    const router = useRouter();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/community/follow?mosqueId=${mosqueId}`);

                if (response.status === 401) {
                    setIsSignedIn(false);
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                setIsFollowing(!!data.following);
                setIsSignedIn(true);
            } catch (error) {
                console.error('Error checking follow status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [mosqueId]);

    const handleToggleFollow = async () => {
        if (!isSignedIn) {
            toast.error('Please sign in to follow mosques');
            router.push('/sign-in');
            return;
        }

        startTransition(async () => {
            try {
                // Optimistic update
                setIsFollowing((prev) => !prev);

                const response = await fetch('/api/community/follow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mosqueId }),
                });

                if (!response.ok) {
                    // Revert on error
                    setIsFollowing((prev) => !prev);
                    throw new Error('Failed to update follow status');
                }

                const data = await response.json();
                setIsFollowing(data.following);
                toast.success(data.following ? 'You are now following this mosque' : 'Unfollowed mosque');
            } catch (error) {
                console.error('Error toggling follow:', error);
                toast.error('Failed to update follow status');
            }
        });
    };

    if (isLoading) {
        return (
            <Button variant="outline" size="lg" disabled className="flex-1 md:flex-none gap-2 bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </Button>
        );
    }

    return (
        <Button
            variant={isFollowing ? "default" : "outline"}
            size="lg"
            onClick={handleToggleFollow}
            disabled={isPending}
            className={`flex-1 md:flex-none gap-2 ${!isFollowing ? 'bg-background/50 backdrop-blur-sm hover:bg-background/80' : ''}`}
        >
            {isFollowing ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
    );
}
