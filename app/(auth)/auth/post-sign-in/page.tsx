import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { RedirectWithRefresh } from '@/components/auth/redirect-with-refresh';

const SUPER_ADMIN_EMAILS = ['ultrotech1236@gmail.com'];

export default async function PostSignIn({
    searchParams,
}: {
    searchParams: Promise<{ role?: string }>;
}) {
    const user = await currentUser();

    if (!user) {
        redirect(routes.signIn);
    }

    const params = await searchParams;
    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    const intentRole = params?.role as string | undefined;

    // Get user from Supabase to check their role
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get or create user in Supabase
    const { data: appUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('clerk_id', user.id)
        .single();

    let userRole = appUser?.role;

    // If user doesn't exist in Supabase yet, create them
    if (!appUser || userError) {
        // Determine initial role
        let initialRole = intentRole || 'community_user';

        // Override with super admin if email matches
        if (email && SUPER_ADMIN_EMAILS.includes(email)) {
            initialRole = 'super_admin';
        }

        // Create user in Supabase
        const { data: newUser } = await supabaseAdmin
            .from('users')
            .upsert({
                clerk_id: user.id,
                email: email,
                first_name: user.firstName,
                last_name: user.lastName,
                avatar_url: user.imageUrl,
                role: initialRole,
            }, {
                onConflict: 'clerk_id',
                ignoreDuplicates: false,
            })
            .select('role')
            .single();

        userRole = newUser?.role || initialRole;
    }

    // Also sync role to Clerk metadata for consistency
    try {
        const client = await clerkClient();
        await client.users.updateUser(user.id, {
            publicMetadata: {
                role: userRole,
            },
        });
    } catch (error) {
        console.error('Failed to sync role to Clerk', error);
    }

    // Redirect based on Supabase role
    if (userRole === 'super_admin') {
        return <RedirectWithRefresh redirectTo={routes.superAdmin.dashboard} />;
    }

    if (userRole === 'mosque_admin') {
        return <RedirectWithRefresh redirectTo={routes.mosqueAdmin.dashboard} />;
    }

    // Default to community dashboard
    return <RedirectWithRefresh redirectTo={routes.community.dashboard} />;
}
