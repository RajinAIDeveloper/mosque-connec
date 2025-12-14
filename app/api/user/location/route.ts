import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, latitude, longitude, city, country } = body;

        if (!userId || !latitude || !longitude) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify user owns the ID (security check)
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('clerk_id')
            .eq('id', userId)
            .single();

        if (!user || user.clerk_id !== clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized access to user profile' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update({
                latitude,
                longitude,
                city,
                country,
            })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user location:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
