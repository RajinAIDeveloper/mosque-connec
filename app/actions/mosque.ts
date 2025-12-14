'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type UpsertMosqueInput = {
    id?: string;
    name: string;
    address: string;
    description: string | null;
    phone: string | null;
    website: string | null;
    latitude: number;
    longitude: number;
};

type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

type PrayerTimeInput = {
    mosque_id: string;
    prayer_name: PrayerName;
    prayer_time: string;
    date: string;
};

type EventInput = {
    mosque_id: string;
    title: string;
    description: string | null;
    category: string | null;
    event_date: string;
    location: string | null;
    image_url: string | null;
};

type CharityInput = {
    mosque_id: string;
    title: string;
    description: string | null;
    goal_amount: number | null;
    current_amount: number;
    end_date: string | null;
    image_url: string | null;
};

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

async function requireAppUser() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('You must be signed in to perform this action');
    }

    const { data: appUser, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

    if (error || !appUser) {
        throw new Error('User profile not found');
    }

    return appUser;
}

export async function upsertMosque(input: UpsertMosqueInput) {
    const appUser = await requireAppUser();

    const payload = {
        name: input.name,
        address: input.address,
        description: input.description,
        phone: input.phone,
        website: input.website,
        latitude: input.latitude,
        longitude: input.longitude,
    };

    if (input.id) {
        const { error } = await supabaseAdmin
            .from('mosques')
            .update(payload)
            .eq('id', input.id)
            .eq('admin_id', appUser.id);

        if (error) {
            console.error('Error updating mosque:', error);
            throw new Error('Failed to update mosque');
        }
    } else {
        // Ensure user does not already have a mosque
        const { data: existingMosque, error: existingError } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .maybeSingle();

        if (existingError) {
            console.error('Error checking existing mosque:', existingError);
            throw new Error('Failed to verify existing mosque');
        }

        if (existingMosque) {
            throw new Error('You already have a mosque');
        }

        const { error } = await supabaseAdmin
            .from('mosques')
            .insert({
                ...payload,
                admin_id: appUser.id,
                verified: false,
            });

        if (error) {
            console.error('Error creating mosque:', error);
            throw new Error('Failed to create mosque');
        }
    }

    revalidatePath('/mosques');
    revalidatePath('/mosque/dashboard');

    return { success: true };
}

export async function upsertPrayerTimes(
    mosqueId: string,
    times: PrayerTimeInput[]
) {
    await requireAppUser();

    const timeMap: Partial<Record<PrayerName, string>> = {};

    for (const t of times) {
        if (t.mosque_id !== mosqueId) {
            continue;
        }
        timeMap[t.prayer_name] = t.prayer_time;
    }

    const { fajr, dhuhr, asr, maghrib, isha } = timeMap;

    if (!fajr || !dhuhr || !asr || !maghrib || !isha) {
        throw new Error('All five daily prayer times are required');
    }

    const { error } = await supabaseAdmin
        .from('prayer_times')
        .upsert(
            {
                mosque_id: mosqueId,
                fajr,
                dhuhr,
                asr,
                maghrib,
                isha,
                jummah: null,
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: 'mosque_id',
            }
        );

    if (error) {
        console.error('Error saving prayer times:', error);
        throw new Error('Failed to save prayer times');
    }

    revalidatePath('/mosque/prayer-times');

    return { success: true };
}

export async function createEvent(mosqueId: string, input: EventInput) {
    await requireAppUser();

    const response = await fetch(`${getBaseUrl()}/api/mosque/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: input.title,
            description: input.description,
            start_time: input.event_date,
            end_time: null,
            location: input.location,
            isPaid: false,
            ticketPrice: '',
            hasSeatLimit: false,
            totalSeats: '',
            availableSeats: '',
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Error creating event:', data);
        throw new Error(data.error || data.details || 'Failed to create event');
    }

    revalidatePath('/mosque/events');

    return { success: true, data };
}

export async function createCharity(mosqueId: string, input: CharityInput) {
    await requireAppUser();

    const response = await fetch(`${getBaseUrl()}/api/mosque/charity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: input.title,
            description: input.description,
            goal_amount: input.goal_amount ?? undefined,
            start_date: null,
            end_date: input.end_date,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Error creating charity campaign:', data);
        throw new Error(data.error || data.details || 'Failed to create charity campaign');
    }

    revalidatePath('/mosque/charity');

    return { success: true, data };
}
