import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mosqueId, action } = await request.json();

        if (!mosqueId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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

        if (action === 'approve') {
            // Update mosque to verified
            const { error } = await supabaseAdmin
                .from('mosques')
                .update({ verified: true })
                .eq('id', mosqueId);

            if (error) {
                throw error;
            }

            return NextResponse.json({
                success: true,
                message: 'Mosque approved successfully'
            });
        } else {
            // Delete the mosque for rejection
            const { error } = await supabaseAdmin
                .from('mosques')
                .delete()
                .eq('id', mosqueId);

            if (error) {
                throw error;
            }

            return NextResponse.json({
                success: true,
                message: 'Mosque rejected and removed'
            });
        }
    } catch (error) {
        console.error('Approval action error:', error);
        return NextResponse.json(
            { error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
