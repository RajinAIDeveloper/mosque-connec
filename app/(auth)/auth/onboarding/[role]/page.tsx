import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { RedirectWithRefresh } from '@/components/auth/redirect-with-refresh';
import { MosqueOnboardingForm } from '@/components/mosque-admin/mosque-onboarding-form';

const SUPER_ADMIN_EMAILS = ['ultrotech1236@gmail.com'];
const allowedRoles = ['community_user', 'mosque_admin'] as const;

type AllowedRole = (typeof allowedRoles)[number];

export default async function OnboardingPage({
    params,
}: {
    params: Promise<{ role: string }>;
}) {
    const { role } = await params;
    const targetRole = role as AllowedRole;
    const user = await currentUser();

    if (!user) {
        redirect(routes.signIn);
    }

    if (!allowedRoles.includes(targetRole)) {
        redirect(routes.community.dashboard);
    }

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    const isSuperAdminEmail = email && SUPER_ADMIN_EMAILS.includes(email);

    // Persist the role on the Clerk profile (super admin stays super admin)
    const roleToSet = isSuperAdminEmail ? 'super_admin' : targetRole;

    const client = await clerkClient();
    await client.users.updateUser(user.id, {
        publicMetadata: {
            role: roleToSet,
        },
    });

    if (roleToSet === 'super_admin' || isSuperAdminEmail) {
        return <RedirectWithRefresh redirectTo={routes.superAdmin.dashboard} />;
    }

    // Mosque admin onboarding: if they already have a mosque, skip to dashboard; otherwise show form
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get or create user in Supabase using upsert
    const { data: appUser, error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert({
            clerk_id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.imageUrl,
            role: roleToSet,
        }, {
            onConflict: 'clerk_id',
            ignoreDuplicates: false,
        })
        .select('id, latitude, longitude')
        .single();

    if (upsertError || !appUser) {
        console.error('Error upserting user in Supabase:', upsertError);
        // If we can't upsert user, redirect to community dashboard as fallback
        return <RedirectWithRefresh redirectTo={routes.community.dashboard} />;
    }

    if (roleToSet === 'community_user') {
        // If user already has location set, redirect to dashboard
        if (appUser.latitude && appUser.longitude) {
            return <RedirectWithRefresh redirectTo={routes.community.dashboard} />;
        }
        // Otherwise show location form
        const { UserLocationForm } = await import('@/components/auth/user-location-form');
        return <UserLocationForm userId={appUser.id} />;
    }

    // Check if they already have a mosque
    const { data: mosques } = await supabaseAdmin
        .from('mosques')
        .select('id')
        .eq('admin_id', appUser.id)
        .limit(1);

    if (mosques && mosques.length > 0) {
        return <RedirectWithRefresh redirectTo={routes.mosqueAdmin.dashboard} />;
    }

    return <MosqueOnboardingForm userId={appUser.id} />;
}
