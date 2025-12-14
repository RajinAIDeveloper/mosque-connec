import { auth } from '@clerk/nextjs/server';
import { routes } from '@/config/routes';
import { NavbarClient } from './navbar-client';

export async function Navbar() {
    const { userId } = await auth();
    const isSignedIn = !!userId;

    let dashboardUrl: string = routes.community.dashboard;

    // If user is signed in, get their dashboard URL from Supabase
    if (userId) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { currentUser } = await import('@clerk/nextjs/server');
        const user = await currentUser();

        if (user) {
            const { data: appUser } = await supabaseAdmin
                .from('users')
                .select('role')
                .eq('clerk_id', user.id)
                .single();

            const role = appUser?.role;
            const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();

            // Determine dashboard URL based on Supabase role
            if (role === 'super_admin' || email === 'ultrotech1236@gmail.com') {
                dashboardUrl = routes.superAdmin.dashboard;
            } else if (role === 'mosque_admin') {
                dashboardUrl = routes.mosqueAdmin.dashboard;
            }
        }
    }

    return (
        <NavbarClient isSignedIn={isSignedIn} dashboardUrl={dashboardUrl} />
    );
}
