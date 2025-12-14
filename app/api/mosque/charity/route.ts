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

        // Fetch charity campaigns
        const { data: campaigns, error } = await supabaseAdmin
            .from('charity_campaigns')
            .select('*')
            .eq('mosque_id', mosque.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ data: campaigns });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
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
        const { title, description, goal_amount, start_date, end_date } = body;

        if (!title) {
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

        // Create campaign
        const { data, error } = await supabaseAdmin
            .from('charity_campaigns')
            .insert({
                mosque_id: mosque.id,
                title,
                description: description || null,
                goal_amount: goal_amount ? parseFloat(goal_amount) : null,
                start_date: start_date || null,
                end_date: end_date || null,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, title, description, goal_amount, raised_amount, start_date, end_date, is_active } = body;

        if (!id) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
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

        if (!appUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });

        // Update campaign
        const { data, error } = await supabaseAdmin
            .from('charity_campaigns')
            .update({
                title,
                description: description || null,
                goal_amount: goal_amount ? parseFloat(goal_amount) : null,
                raised_amount: raised_amount ? parseFloat(raised_amount) : 0,
                start_date: start_date || null,
                end_date: end_date || null,
                is_active: is_active !== undefined ? is_active : true,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('mosque_id', mosque.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating campaign:', error);
            throw error;
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error updating campaign:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('id');

        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
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

        if (!appUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });

        // Delete campaign ensuring it belongs to this mosque
        const { error } = await supabaseAdmin
            .from('charity_campaigns')
            .delete()
            .eq('id', campaignId)
            .eq('mosque_id', mosque.id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
