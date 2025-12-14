import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { mosqueId } = body;

        if (!mosqueId) {
            return NextResponse.json({ error: 'Mosque ID is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user's internal ID
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if already following
        const { data: existingFollow } = await supabaseAdmin
            .from('mosque_followers')
            .select('id')
            .eq('user_id', appUser.id)
            .eq('mosque_id', mosqueId)
            .single();

        if (existingFollow) {
            // Unfollow
            const { error } = await supabaseAdmin
                .from('mosque_followers')
                .delete()
                .eq('id', existingFollow.id);

            if (error) throw error;
            return NextResponse.json({ following: false });
        } else {
            // Follow
            const { error } = await supabaseAdmin
                .from('mosque_followers')
                .insert({
                    user_id: appUser.id,
                    mosque_id: mosqueId
                });

            if (error) throw error;
            return NextResponse.json({ following: true });
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ following: false });
        }

        const { searchParams } = new URL(request.url);
        const mosqueId = searchParams.get('mosqueId');

        if (!mosqueId) {
            return NextResponse.json({ error: 'Mosque ID is required' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ following: false });
        }

        const { data: existingFollow } = await supabaseAdmin
            .from('mosque_followers')
            .select('id')
            .eq('user_id', appUser.id)
            .eq('mosque_id', mosqueId)
            .single();

        return NextResponse.json({ following: !!existingFollow });
    } catch (error) {
        console.error('Error checking follow status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
