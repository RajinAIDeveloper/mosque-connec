import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mosqueId, updates } = await request.json();

        if (!mosqueId || !updates) {
            return NextResponse.json({ error: 'Mosque ID and updates are required' }, { status: 400 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify user is super admin
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('role, email')
            .eq('clerk_id', userId)
            .single();

        const isSuperAdmin = appUser?.role === 'super_admin' ||
            appUser?.email === 'ultrotech1236@gmail.com';

        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update the mosque
        const { error } = await supabaseAdmin
            .from('mosques')
            .update(updates)
            .eq('id', mosqueId);

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Mosque updated successfully'
        });
    } catch (error) {
        console.error('Update mosque error:', error);
        console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        });
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update mosque' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mosqueId } = await request.json();

        if (!mosqueId) {
            return NextResponse.json({ error: 'Mosque ID is required' }, { status: 400 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify user is super admin
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('role, email')
            .eq('clerk_id', userId)
            .single();

        const isSuperAdmin = appUser?.role === 'super_admin' ||
            appUser?.email === 'ultrotech1236@gmail.com';

        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete the mosque
        const { error } = await supabaseAdmin
            .from('mosques')
            .delete()
            .eq('id', mosqueId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Mosque deleted successfully'
        });
    } catch (error) {
        console.error('Delete mosque error:', error);
        return NextResponse.json(
            { error: 'Failed to delete mosque' },
            { status: 500 }
        );
    }
}
