import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MosqueEditForm } from '@/components/super-admin/mosque-edit-form';

export default async function MosqueEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await currentUser();

    if (!user) {
        redirect(routes.signIn);
    }

    const { id } = await params;

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

    // Fetch mosque data
    const { data: mosque } = await supabaseAdmin
        .from('mosques')
        .select('*')
        .eq('id', id)
        .single();

    if (!mosque) {
        notFound();
    }

    return (
        <div className="space-y-8 px-4 sm:px-0 max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Mosque</h1>
                    <p className="text-muted-foreground mt-2">
                        Update mosque information and settings
                    </p>
                </div>
                <Link href="/admin/mosques">
                    <Button variant="outline">Back to Mosques</Button>
                </Link>
            </div>

            <MosqueEditForm mosque={mosque} />
        </div>
    );
}
