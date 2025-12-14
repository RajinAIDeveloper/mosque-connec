import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const mosqueId = searchParams.get('mosqueId');

        if (!mosqueId) {
            return NextResponse.json({ error: 'Mosque ID is required' }, { status: 400 });
        }

        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: preferences } = await supabaseAdmin
            .from('notification_preferences')
            .select('prayer_times, events, charity')
            .eq('user_id', appUser.id)
            .eq('mosque_id', mosqueId)
            .maybeSingle();

        return NextResponse.json({ preferences });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { mosqueId, prayer_times, events, charity } = body as {
            mosqueId?: string;
            prayer_times?: boolean;
            events?: boolean;
            charity?: boolean;
        };

        if (!mosqueId) {
            return NextResponse.json({ error: 'Mosque ID is required' }, { status: 400 });
        }

        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { error } = await supabaseAdmin
            .from('notification_preferences')
            .upsert(
                {
                    user_id: appUser.id,
                    mosque_id: mosqueId,
                    prayer_times: !!prayer_times,
                    events: !!events,
                    charity: !!charity,
                },
                {
                    onConflict: 'user_id, mosque_id',
                }
            );

        if (error) {
            console.error('Error saving notification preferences:', error);
            return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

