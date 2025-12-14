import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { UnverifiedBanner } from '@/components/mosque-admin/unverified-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Settings, Users, ExternalLink, Heart, DollarSign, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { MosqueCommentsPanel } from '@/components/mosque-admin/mosque-comments-panel';

export default async function MosqueDashboard() {
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

    // Get the user's mosque from the database
    const { data: appUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', user.id)
        .single();

    if (!appUser) {
        redirect(routes.onboarding('mosque_admin'));
    }

    const { data: mosque } = await supabaseAdmin
        .from('mosques')
        .select('*')
        .eq('admin_id', appUser.id)
        .single();

    if (!mosque) {
        // No mosque found, redirect to create one
        redirect(routes.onboarding('mosque_admin'));
    }

    const isVerified = mosque.verified === true;

    const [{ count: totalEvents }, { count: activeCampaigns }, { count: followerCount }, { count: pendingComments }] =
        await Promise.all([
            supabaseAdmin
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('mosque_id', mosque.id),
            supabaseAdmin
                .from('charity_campaigns')
                .select('*', { count: 'exact', head: true })
                .eq('mosque_id', mosque.id)
                .eq('is_active', true),
            supabaseAdmin
                .from('mosque_followers')
                .select('*', { count: 'exact', head: true })
                .eq('mosque_id', mosque.id),
            supabaseAdmin
                .from('mosque_ratings')
                .select('*', { count: 'exact', head: true })
                .eq('mosque_id', mosque.id)
                .not('comment', 'is', null)
                .is('admin_reply', null),
        ]);

    return (
        <div className="space-y-8 px-4 sm:px-0 max-w-7xl mx-auto py-8">
            {!isVerified && <UnverifiedBanner />}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mosque Management</h1>
                    <p className="text-muted-foreground">
                        Manage {mosque.name} • {mosque.address}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={routes.mosquesDetails(mosque.id)}>
                        <Button variant="outline" disabled={!isVerified} className="gap-2">
                            <ExternalLink className="h-4 w-4" /> View Public Page
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Management Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className={`shadow-sm ${!isVerified && 'opacity-70'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Prayer Times
                        </CardTitle>
                        <CardDescription>
                            Manage daily prayer schedules
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/mosque/prayer-times">
                            <Button disabled={!isVerified} className="w-full">
                                Update Prayer Times
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${!isVerified && 'opacity-70'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Events
                        </CardTitle>
                        <CardDescription>
                            Create and manage events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/mosque/events">
                            <Button disabled={!isVerified} className="w-full">
                                Add Events
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${!isVerified && 'opacity-70'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Charity
                        </CardTitle>
                        <CardDescription>
                            Manage charity campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/mosque/charity">
                            <Button disabled={!isVerified} className="w-full">
                                Manage Charity
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${!isVerified && 'opacity-70'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Mosque Details
                        </CardTitle>
                        <CardDescription>
                            Update mosque information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/mosque/edit">
                            <Button disabled={!isVerified} className="w-full">
                                Edit Mosque Details
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${!isVerified && 'opacity-70'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Admins
                        </CardTitle>
                        <CardDescription>
                            Manage mosque administrators
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/mosque/admins">
                            <Button disabled={!isVerified} className="w-full">
                                Manage Admins
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${!isVerified && 'opacity-70'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Community
                        </CardTitle>
                        <CardDescription>
                            View community engagement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{followerCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Followers
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEvents || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCampaigns || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Followers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{followerCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {isVerified ? (
                                <span className="text-green-600">Verified</span>
                            ) : (
                                <span className="text-yellow-600">Pending</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Comment Notifications */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Community Comments
                        </CardTitle>
                        <CardDescription>
                            See the latest feedback from your community and reply directly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MosqueCommentsPanel />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Comment Notifications
                        </CardTitle>
                        <CardDescription>
                            Comments waiting for your response.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-2">
                            {pendingComments || 0}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Comment{(pendingComments || 0) === 1 ? '' : 's'} without an admin reply.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            New comments appear here automatically so you can keep up with community engagement.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
