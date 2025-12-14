import { currentUser } from '@clerk/nextjs/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Heart, Calendar, Search, Navigation } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { redirect } from 'next/navigation';
import { DashboardMap } from '@/components/community/dashboard-map';
import { t } from '@/lib/i18n';
import { getServerLanguage } from '@/lib/i18n-server';

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export default async function CommunityDashboard() {
    const lang = await getServerLanguage();
    const user = await currentUser();

    if (!user) {
        redirect(routes.signIn);
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile with location
    const { data: appUser, error: userError } = await supabase
        .from('users')
        .select('id, latitude, longitude, city, country')
        .eq('clerk_id', user.id)
        .single();

    // Debug logging
    if (userError) {
        console.error('Error fetching user:', userError);
    }
    if (!appUser) {
        console.error('No user found for clerk_id:', user.id);
    } else {
        console.log('User found:', appUser);
    }

    // Get followed mosques count
    const { count: followingCount } = await supabase
        .from('mosque_followers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', appUser?.id);

    // Get all mosques to calculate distance
    // In a real app with PostGIS, we would do this in the DB
    const { data: allMosques } = await supabase
        .from('mosques')
        .select('id, name, latitude, longitude, address, city, country, image_url')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

    let recommendedMosques: any[] = [];
    let nearbyCount = 0;

    if (appUser?.latitude && appUser?.longitude && allMosques) {
        recommendedMosques = allMosques.map(mosque => ({
            ...mosque,
            distance: calculateDistance(
                appUser.latitude,
                appUser.longitude,
                mosque.latitude,
                mosque.longitude
            )
        }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Top 5 nearest

        // Count mosques within 10km
        nearbyCount = allMosques.filter(m => {
            const dist = calculateDistance(
                appUser.latitude,
                appUser.longitude,
                m.latitude,
                m.longitude
            );
            return dist <= 10;
        }).length;
    }

    return (
        <div className="space-y-8 px-4 sm:px-0 max-w-7xl mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t(lang, 'Community Dashboard')}</h1>
                    <p className="text-muted-foreground">
                        {t(lang, 'Welcome back,')} {user?.firstName || 'User'}!
                    </p>
                </div>
                <Link href={routes.mosques}>
                    <Button className="gap-2">
                        <Search className="h-4 w-4" /> {t(lang, 'Find Mosques')}
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(lang, 'Favorite Mosques')}</CardTitle>
                        <Heart className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-2xl font-bold">{followingCount || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {t(lang, 'Mosques you follow')}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href={routes.favorites}>
                                <Button variant="outline" size="sm" className="w-full justify-center">
                                    {t(lang, 'Favorite Mosques')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(lang, 'Nearby Mosques')}</CardTitle>
                        <MapPin className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{nearbyCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {t(lang, 'Within 10km of you')}
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(lang, 'Upcoming Events')}</CardTitle>
                        <Calendar className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            {t(lang, 'Events this week')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Map Section */}
                <Card className="col-span-4 shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle>{t(lang, 'Mosque Map')}</CardTitle>
                        <CardDescription>
                            {t(lang, 'Mosques near')} {appUser?.city || 'you'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 h-[400px]">
                        {appUser?.latitude && appUser?.longitude ? (
                            <DashboardMap
                                userLocation={{ lat: appUser.latitude, lng: appUser.longitude }}
                                mosques={recommendedMosques}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-muted/20 p-6 text-center">
                                <MapPin className="h-10 w-10 text-muted-foreground mb-4" />
                                <h3 className="font-semibold text-lg mb-2">{t(lang, 'Location Not Set')}</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    {t(lang, 'Set your location to see nearby mosques on the map.')}
                                </p>
                                <Link href="/auth/onboarding/community_user">
                                    <Button>{t(lang, 'Set Location')}</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recommended Mosques */}
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t(lang, 'Recommended for You')}</CardTitle>
                        <CardDescription>
                            {t(lang, 'Nearest mosques based on your location')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recommendedMosques.length > 0 ? (
                                recommendedMosques.map((mosque) => (
                                    <Link key={mosque.id} href={`/mosques/${mosque.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border cursor-pointer group">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                {mosque.image_url ? (
                                                    <img src={mosque.image_url} alt={mosque.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <MapPin className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{mosque.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {mosque.distance.toFixed(1)} km away • {mosque.city}
                                                </p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Navigation className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>{t(lang, 'No mosques found nearby.')}</p>
                                    {!appUser?.latitude && (
                                        <Link href="/auth/onboarding/community_user" className="text-primary hover:underline text-sm mt-2 block">
                                            {t(lang, 'Set your location')}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
