import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: Request) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, role } = await request.json();

        if (!userId || !role) {
            return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
        }

        const validRoles = ['community_user', 'mosque_admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
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
            .eq('clerk_id', clerkUserId)
            .single();

        const isSuperAdmin = appUser?.role === 'super_admin' ||
            appUser?.email === 'ultrotech1236@gmail.com';

        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update user role
        const { error } = await supabaseAdmin
            .from('users')
            .update({ role })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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
            .eq('clerk_id', clerkUserId)
            .single();

        const isSuperAdmin = appUser?.role === 'super_admin' ||
            appUser?.email === 'ultrotech1236@gmail.com';

        if (!isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete the user
        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
