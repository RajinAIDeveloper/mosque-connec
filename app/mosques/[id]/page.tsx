import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { MapPin, Phone, Globe, Clock, Calendar, Heart, Navigation, Users, CheckCircle2, Info, Target, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routes } from '@/config/routes';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { FollowButton } from '@/components/mosques/follow-button';
import { DonateButton } from '@/components/mosques/donate-button';
import { RatingsList } from '@/components/mosque/ratings-list';
import { RatingForm } from '@/components/mosque/rating-form';
import { MosqueNotificationPreferences } from '@/components/mosques/mosque-notification-preferences';
import { MosqueShareButton } from '@/components/mosques/mosque-share-button';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: mosque } = await supabase.from('mosques').select('name').eq('id', id).single();

    return {
        title: mosque ? `${mosque.name} | Mosque Connect` : 'Mosque Details',
    };
}

export default async function MosqueDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: mosque } = await supabase
        .from('mosques')
        .select('*')
        .eq('id', id)
        .single();

    if (!mosque) {
        notFound();
    }

    // Fetch prayer times
    const { data: prayerTimes } = await supabase
        .from('prayer_times')
        .select('*')
        .eq('mosque_id', id)
        .single();

    // Fetch upcoming events
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('mosque_id', id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);

    // Fetch active charity campaigns
    const { data: campaigns } = await supabase
        .from('charity_campaigns')
        .select('*')
        .eq('mosque_id', id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

    const { data: ratings } = await supabase
        .from('mosque_ratings')
        .select('id, rating, comment, created_at')
        .eq('mosque_id', id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen pb-20 bg-background">
            {/* Hero Section */}
            <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden group">
                {mosque.image_url ? (
                    <img
                        src={mosque.image_url}
                        alt={mosque.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <MapPin className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                    </div>
                )}

                {/* Gradient Overlay - Stronger at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0">
                      <div className="container mx-auto px-6 md:px-12 py-8 md:py-10">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                              <div className="space-y-2 max-w-3xl">
                                  <MosqueShareButton mosqueName={mosque.name} />
                                  <FollowButton mosqueId={id} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

            <div className="container mx-auto px-6 md:px-12 mt-8 md:mt-12 grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* About */}
                    <section className="prose prose-gray dark:prose-invert max-w-none">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">About</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            {mosque.description || "No description available for this mosque."}
                        </p>
                    </section>

                    {/* Mosque Information */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                            <Info className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Mosque Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Location */}
                            <Card className="border-none bg-muted/30">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Location</p>
                                            <p className="font-semibold text-lg">
                                                {mosque.city && mosque.country
                                                    ? `${mosque.city}, ${mosque.country}`
                                                    : mosque.city || mosque.country || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Capacity */}
                            {mosque.capacity && (
                                <Card className="border-none bg-muted/30">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Capacity</p>
                                                <p className="font-semibold text-lg">{mosque.capacity.toLocaleString()} people</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Madhhab */}
                            {mosque.madhhab && (
                                <Card className="border-none bg-muted/30">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Info className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Madhhab</p>
                                                <p className="font-semibold text-lg capitalize">
                                                    {mosque.madhhab === 'shafi' ? "Shafi'i" : mosque.madhhab}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Women's Facilities */}
                            <Card className="border-none bg-muted/30">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${mosque.allows_women ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            <CheckCircle2 className={`h-5 w-5 ${mosque.allows_women ? 'text-green-600 dark:text-green-500' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Women's Prayer Area</p>
                                            <p className={`font-semibold text-lg ${mosque.allows_women ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
                                                }`}>
                                                {mosque.allows_women ? 'Available' : 'Not Available'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                      </section>

                    {/* Ratings & Reviews */}
                    <section>
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                            <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Ratings &amp; Reviews
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="border-none bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">Community feedback</CardTitle>
                                    <CardDescription>
                                        Read what others have shared about this mosque.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RatingsList ratings={ratings || []} />
                                </CardContent>
                            </Card>
                            <Card className="border-none bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="text-lg">Rate this mosque</CardTitle>
                                    <CardDescription>
                                        Share your experience to help other community members.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RatingForm mosqueId={id} />
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section>
                        <Card className="border-none bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Notifications</CardTitle>
                                <CardDescription>
                                    Choose how you want to be notified about this mosque.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MosqueNotificationPreferences mosqueId={id} />
                            </CardContent>
                        </Card>
                    </section>

                    {/* Prayer Times */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <Clock className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Prayer Times
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">Current Schedule</span>
                        </div>
                        <Card className="overflow-hidden border-none shadow-lg">
                            <CardContent className="p-0">
                                {prayerTimes ? (
                                    <div className="divide-y divide-border/50">
                                        <div className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors">
                                            <span className="font-medium text-lg">Fajr</span>
                                            <span className="font-mono text-lg text-primary bg-primary/10 px-3 py-1 rounded">{prayerTimes.fajr}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors">
                                            <span className="font-medium text-lg">Dhuhr</span>
                                            <span className="font-mono text-lg text-primary bg-primary/10 px-3 py-1 rounded">{prayerTimes.dhuhr}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors">
                                            <span className="font-medium text-lg">Asr</span>
                                            <span className="font-mono text-lg text-primary bg-primary/10 px-3 py-1 rounded">{prayerTimes.asr}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors">
                                            <span className="font-medium text-lg">Maghrib</span>
                                            <span className="font-mono text-lg text-primary bg-primary/10 px-3 py-1 rounded">{prayerTimes.maghrib}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors">
                                            <span className="font-medium text-lg">Isha</span>
                                            <span className="font-mono text-lg text-primary bg-primary/10 px-3 py-1 rounded">{prayerTimes.isha}</span>
                                        </div>
                                        {prayerTimes.jummah && (
                                            <div className="flex justify-between items-center p-5 hover:bg-muted/30 transition-colors bg-muted/20">
                                                <span className="font-medium text-lg">Jummah</span>
                                                <span className="font-mono text-lg text-primary bg-primary/10 px-3 py-1 rounded">{prayerTimes.jummah}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>Prayer times not yet updated by mosque admin.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Events */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Upcoming Events
                            </h2>
                        </div>
                        {events && events.length > 0 ? (
                            <div className="grid gap-6">
                                {events.map((event) => (
                                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')} at {format(new Date(event.start_time), 'h:mm a')}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground line-clamp-2 mb-4">
                                                {event.description || 'No description provided.'}
                                            </p>
                                            {event.location && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-muted/30 border-dashed border-2 shadow-none">
                                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <Calendar className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-lg font-medium">No upcoming events scheduled</p>
                                    <p className="text-sm">Check back later for updates</p>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {/* Charity Campaigns */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Charity Campaigns
                            </h2>
                        </div>
                        {campaigns && campaigns.length > 0 ? (
                            <div className="grid gap-6">
                                {campaigns.map((campaign) => (
                                    <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle className="text-xl">{campaign.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Target className="h-4 w-4" />
                                                Goal: {campaign.goal_amount ? `$${campaign.goal_amount.toLocaleString()}` : 'No goal set'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-muted-foreground line-clamp-2">
                                                {campaign.description || 'No description provided.'}
                                            </p>
                                            {campaign.goal_amount && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Raised: ${campaign.raised_amount.toLocaleString()}</span>
                                                        <span className="text-muted-foreground">
                                                            {Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}%
                                                        </span>
                                                    </div>
                                                    <Progress value={(campaign.raised_amount / campaign.goal_amount) * 100} />
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter>
                                            <DonateButton
                                                phone={mosque.phone}
                                                campaignTitle={campaign.title}
                                                mosqueName={mosque.name}
                                            />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-muted/30 border-dashed border-2 shadow-none">
                                <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                    <DollarSign className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="text-lg font-medium">No active charity campaigns</p>
                                    <p className="text-sm">Check back later for updates</p>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <Card className="shadow-md border-none ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-xl">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {mosque.phone && (
                                <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">{mosque.phone}</span>
                                </div>
                            )}
                            {mosque.website && (
                                <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Globe className="h-4 w-4 text-primary" />
                                    </div>
                                    <a href={mosque.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate font-medium">
                                        Visit Website
                                    </a>
                                </div>
                            )}
                            <div className="flex items-start gap-3 text-muted-foreground">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-medium leading-tight">{mosque.address}</span>
                            </div>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full gap-2 mt-2" size="lg">
                                    <Navigation className="h-4 w-4" /> Get Directions
                                </Button>
                            </a>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden shadow-md border-none ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-xl">Location</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 h-[300px] bg-muted relative">
                            {/* Placeholder for Map */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-0">
                                <MapPin className="h-8 w-8 mb-2 animate-bounce" />
                            </div>
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                className="relative z-10"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mosque.longitude - 0.01}%2C${mosque.latitude - 0.01}%2C${mosque.longitude + 0.01}%2C${mosque.latitude + 0.01}&layer=mapnik&marker=${mosque.latitude}%2C${mosque.longitude}`}
                            ></iframe>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
