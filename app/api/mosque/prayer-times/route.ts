import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user's mosque
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) {
            return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });
        }

        // Fetch current prayer times for this mosque
        const { data, error } = await supabaseAdmin
            .from('prayer_times')
            .select('*')
            .eq('mosque_id', mosque.id)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error fetching prayer times:', error);
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
        const { fajr, dhuhr, asr, maghrib, isha, jummah } = body;

        if (!fajr || !dhuhr || !asr || !maghrib || !isha) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user's mosque
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) {
            return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });
        }

        console.log('Saving prayer times for mosque:', mosque.id, 'Data:', { fajr, dhuhr, asr, maghrib, isha, jummah });

        // Upsert prayer times (one set per mosque)
        const { data, error } = await supabaseAdmin
            .from('prayer_times')
            .upsert({
                mosque_id: mosque.id,
                fajr,
                dhuhr,
                asr,
                maghrib,
                isha,
                jummah: jummah || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'mosque_id'
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error saving prayer times:', error);
            return NextResponse.json({
                error: 'Failed to save prayer times',
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error saving prayer times:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
