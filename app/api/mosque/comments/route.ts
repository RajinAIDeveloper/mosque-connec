import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        const { data: comments, error } = await supabaseAdmin
            .from('mosque_ratings')
            .select('id, rating, comment, admin_reply, created_at')
            .eq('mosque_id', mosque.id)
            .not('comment', 'is', null)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            throw error;
        }

        const pendingCount =
            comments?.filter((c) => c.comment && !c.admin_reply).length ?? 0;

        return NextResponse.json({
            comments: comments ?? [],
            pendingCount,
        });
    } catch (error) {
        console.error('Error fetching comments for mosque admin dashboard:', error);
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
        const { ratingId, reply } = body as {
            ratingId?: string;
            reply?: string;
        };

        if (!ratingId || typeof reply !== 'string' || !reply.trim()) {
            return NextResponse.json(
                { error: 'Rating ID and reply are required' },
                { status: 400 },
            );
        }

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

        const { error } = await supabaseAdmin
            .from('mosque_ratings')
            .update({
                admin_reply: reply.trim(),
                admin_reply_at: new Date().toISOString(),
            })
            .eq('id', ratingId)
            .eq('mosque_id', mosque.id);

        if (error) {
            console.error('Error saving admin reply:', error);
            return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error replying to comment:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

