import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function MosqueAdminsPage() {
    const user = await currentUser();

    if (!user) {
        redirect(routes.signIn);
    }

    // Use admin client to bypass RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the user's mosque
    const { data: appUser } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .eq('clerk_id', user.id)
        .single();

    if (!appUser) {
        redirect(routes.onboarding('mosque_admin'));
    }

    const { data: mosque } = await supabaseAdmin
        .from('mosques')
        .select('id, admin_id')
        .eq('admin_id', appUser.id)
        .single();

    if (!mosque) {
        redirect(routes.onboarding('mosque_admin'));
    }

    // For now, we'll just show the current user as the main admin
    // In a real app, we would fetch from a mosque_admins table
    // But since we just created that table and it's empty, let's show the owner

    // Fetch the owner details
    const { data: owner } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', mosque.admin_id)
        .single();

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={routes.mosqueAdmin.dashboard}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mosque Admins</h1>
                        <p className="text-muted-foreground">Manage who has access to your mosque dashboard</p>
                    </div>
                </div>
                <Button disabled className="gap-2">
                    <Plus className="h-4 w-4" /> Invite Admin
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            People with administrative access to this mosque
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Owner */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.imageUrl} />
                                        <AvatarFallback>{owner?.first_name?.[0]}{owner?.last_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium leading-none">
                                            {owner?.first_name} {owner?.last_name}
                                            {user.id === owner?.clerk_id && " (You)"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{owner?.email}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Owner
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <p className="text-sm">
                            Multi-admin support is coming soon. You will be able to invite other team members to help manage your mosque.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
