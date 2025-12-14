import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user profile with location
        const { data: user } = await supabase
            .from('users')
            .select('id, latitude, longitude, city, country')
            .eq('clerk_id', clerkUserId)
            .single();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get followed mosques
        const { data: following } = await supabase
            .from('mosque_followers')
            .select('mosque_id')
            .eq('user_id', user.id);

        const followedIds = following?.map(f => f.mosque_id) || [];

        // Fetch mosques
        // If user has location, calculate distance
        let query = supabase.from('mosques').select('*');

        const { data: mosques, error } = await query;

        if (error) throw error;

        // Calculate distance and sort if user has location
        let recommendedMosques = mosques.map((mosque: any) => {
            let distance = null;
            if (user.latitude && user.longitude && mosque.latitude && mosque.longitude) {
                // Haversine formula
                const R = 6371; // Radius of the earth in km
                const dLat = deg2rad(mosque.latitude - user.latitude);
                const dLon = deg2rad(mosque.longitude - user.longitude);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(user.latitude)) * Math.cos(deg2rad(mosque.latitude)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distance = R * c; // Distance in km
            }
            return { ...mosque, distance };
        });

        // Sort by distance if available
        if (user.latitude && user.longitude) {
            recommendedMosques.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        // Get top 5 recommended (nearest)
        const topRecommended = recommendedMosques.slice(0, 5);

        // Get followed mosques details
        const followedMosques = recommendedMosques.filter(m => followedIds.includes(m.id));

        // Get notifications (mock for now or implement if table exists)
        // We'll return empty notifications for now as the table might be empty
        const notifications: any[] = [];

        return NextResponse.json({
            user,
            recommended: topRecommended,
            following: followedMosques,
            notifications
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
