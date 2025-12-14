import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MosqueNotificationPreferences } from '@/components/mosques/mosque-notification-preferences';

export const metadata = {
    title: 'Notification Settings | Mosque Connect',
    description: 'Manage notifications for mosques you follow.',
};

export default async function NotificationSettingsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect(routes.signIn);
    }

    const supabase = await createClient();

    const { data: appUser } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single();

    if (!appUser) {
        redirect(routes.community.dashboard);
    }

    const { data: follows } = await supabase
        .from('mosque_followers')
        .select('mosque_id')
        .eq('user_id', appUser.id);

    const followedIds = follows?.map(f => f.mosque_id) || [];

    let mosques: { id: string; name: string; city: string | null; country: string | null }[] = [];

    if (followedIds.length > 0) {
        const { data } = await supabase
            .from('mosques')
            .select('id, name, city, country')
            .in('id', followedIds);

        mosques = data || [];
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground mt-2">
                    Choose how you want to be notified about prayer times, events, and charity campaigns from mosques you follow.
                </p>
            </div>

            {mosques.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No followed mosques yet</CardTitle>
                        <CardDescription>
                            Follow mosques from their detail pages or the mosque list to enable notifications.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="space-y-4">
                    {mosques.map((mosque) => (
                        <Card key={mosque.id}>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    {mosque.name}
                                </CardTitle>
                                <CardDescription>
                                    {mosque.city && mosque.country
                                        ? `${mosque.city}, ${mosque.country}`
                                        : mosque.city || mosque.country || 'Location not specified'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MosqueNotificationPreferences mosqueId={mosque.id} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

