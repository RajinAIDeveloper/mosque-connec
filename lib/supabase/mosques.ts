import { createClient } from '@/utils/supabase/server';
import type { CharityOpportunity, Event, Mosque, PrayerTime } from '@/types';

export async function fetchMosques() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('mosques')
        .select('id, name, address, verified, image_url')
        .order('name', { ascending: true });

    if (error) {
        console.error('Failed to load mosques', error);
        throw new Error('Unable to load mosques right now.');
    }

    return data as Pick<Mosque, 'id' | 'name' | 'address' | 'verified' | 'image_url'>[];
}

export async function fetchMosqueDetail(id: string, clerkUserId?: string) {
    const supabase = await createClient();

    const { data: mosque, error: mosqueError } = await supabase
        .from('mosques')
        .select('*')
        .eq('id', id)
        .single();

    if (mosqueError) {
        console.error('Failed to load mosque', mosqueError);
        return null;
    }

    const today = new Date().toISOString().slice(0, 10);

    const [{ data: prayerTimes }, { data: events }, { data: charity }, { data: ratings }] = await Promise.all([
        supabase
            .from('prayer_times')
            .select('*')
            .eq('mosque_id', id)
            .gte('date', today)
            .order('date', { ascending: true })
            .order('prayer_time', { ascending: true }),
        supabase
            .from('events')
            .select('*')
            .eq('mosque_id', id)
            .gte('event_date', new Date().toISOString())
            .order('event_date', { ascending: true })
            .limit(5),
        supabase
            .from('charity_opportunities')
            .select('*')
            .eq('mosque_id', id)
            .order('created_at', { ascending: false })
            .limit(3),
        supabase
            .from('mosque_ratings')
            .select('id, rating, comment, created_at')
            .eq('mosque_id', id)
            .order('created_at', { ascending: false }),
    ]);

    let favorited = false;

    if (clerkUserId) {
        const { data: appUser } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkUserId)
            .single();

        if (appUser) {
            const { data: favorite } = await supabase
                .from('user_favorites')
                .select('id')
                .eq('user_id', appUser.id)
                .eq('mosque_id', id)
                .maybeSingle();
            favorited = Boolean(favorite);
        }
    }

    return {
        mosque: mosque as Mosque,
        prayerTimes: (prayerTimes || []) as PrayerTime[],
        events: (events || []) as Event[],
        charity: (charity || []) as CharityOpportunity[],
        ratings: ratings || [],
        favorited,
    };
}
