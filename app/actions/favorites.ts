'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback for local development
    return 'http://localhost:3000';
}

export async function toggleFavorite(mosqueId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('You must be signed in to save favorites');
    }

    const response = await fetch(`${getBaseUrl()}/api/community/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mosqueId }),
    });

    const data: { following?: boolean; error?: string; details?: string } = await response.json();

    if (!response.ok) {
        console.error('Error toggling favorite:', data);
        throw new Error(data.error || data.details || 'Failed to update favorite');
    }

    const favorited = !!data.following;

    revalidatePath(`/mosques/${mosqueId}`);

    return { favorited };
}
