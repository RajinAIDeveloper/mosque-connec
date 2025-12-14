'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function submitRating(mosqueId: string, rating: number, comment?: string) {
    if (!mosqueId || !rating) {
        throw new Error('Mosque and rating are required');
    }

    const { userId } = await auth();
    if (!userId) {
        throw new Error('You must be signed in to rate a mosque');
    }

    const { data: appUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

    if (userError || !appUser) {
        throw new Error('User profile not found');
    }

    const { error } = await supabaseAdmin
        .from('mosque_ratings')
        .upsert(
            {
                mosque_id: mosqueId,
                user_id: appUser.id,
                rating,
                comment: comment ?? null,
            },
            {
                onConflict: 'mosque_id, user_id',
            }
        );

    if (error) {
        console.error('Error submitting rating:', error);
        throw new Error('Unable to save rating right now');
    }

    revalidatePath(`/mosques/${mosqueId}`);

    return { success: true };
}

