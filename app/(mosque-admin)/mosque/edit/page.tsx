import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MosqueEditForm } from '@/components/super-admin/mosque-edit-form';
import { ArrowLeft } from 'lucide-react';

export default async function MosqueEditPage() {
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
        .select('id')
        .eq('clerk_id', user.id)
        .single();

    if (!appUser) {
        redirect(routes.onboarding('mosque_admin'));
    }

    // Fetch mosque data
    const { data: mosque } = await supabaseAdmin
        .from('mosques')
        .select('*')
        .eq('admin_id', appUser.id)
        .single();

    if (!mosque) {
        redirect(routes.onboarding('mosque_admin'));
    }

    return (
        <div className="space-y-8 px-4 sm:px-0 max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={routes.mosqueAdmin.dashboard}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Mosque Details</h1>
                        <p className="text-muted-foreground mt-2">
                            Update your mosque information and settings
                        </p>
                    </div>
                </div>
            </div>

            <MosqueEditForm mosque={mosque} />
        </div>
    );
}
