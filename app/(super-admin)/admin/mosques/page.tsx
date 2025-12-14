import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MosquesList } from '@/components/super-admin/mosques-list';

export default async function MosquesPage() {
    const user = await currentUser();

    if (!user) {
        redirect(routes.signIn);
    }

    // Use admin client to check authorization
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: appUser } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('clerk_id', user.id)
        .single();

    const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
    const isSuperAdmin = appUser?.role === 'super_admin' || email === 'ultrotech1236@gmail.com';

    if (!isSuperAdmin) {
        redirect(routes.community.dashboard);
    }

    // Fetch all mosques
    const { data: mosques } = await supabaseAdmin
        .from('mosques')
        .select(`
            *,
            users (
                email
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8 px-4 sm:px-0 max-w-7xl mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Mosques</h1>
                    <p className="text-muted-foreground">
                        Manage all registered mosques on the platform
                    </p>
                </div>
                <Link href={routes.superAdmin.dashboard}>
                    <Button variant="outline">Back to Dashboard</Button>
                </Link>
            </div>

            <MosquesList mosques={mosques || []} />
        </div>
    );
}
