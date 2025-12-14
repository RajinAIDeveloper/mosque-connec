import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
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

    // Fetch statistics
    const { count: mosquesCount } = await supabaseAdmin
        .from('mosques')
        .select('*', { count: 'exact', head: true });

    const { count: usersCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

    const { count: pendingCount } = await supabaseAdmin
        .from('mosques')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false);

    return (
        <div className="space-y-8 px-4 sm:px-0 max-w-7xl mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Platform administration and management
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Mosques</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mosquesCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered mosques
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Registered users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting verification
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+0%</div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Management Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Mosque Approvals
                        </CardTitle>
                        <CardDescription>
                            Review and approve pending mosques
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={routes.superAdmin.approvals}>
                            <Button className="w-full">
                                View Approvals ({pendingCount || 0})
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Manage Mosques
                        </CardTitle>
                        <CardDescription>
                            View and manage all mosques
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={routes.superAdmin.mosques}>
                            <Button variant="outline" className="w-full">
                                View All Mosques
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Manage Users
                        </CardTitle>
                        <CardDescription>
                            View and manage all users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href={routes.superAdmin.users}>
                            <Button variant="outline" className="w-full">
                                View All Users
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        Latest platform activities and changes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No recent activity
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
