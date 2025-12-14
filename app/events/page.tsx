import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar, MapPin, Clock, Ticket, Users } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
    title: 'Upcoming Events | Mosque Connect',
    description: 'Find Islamic events, lectures, and gatherings near you.',
};

export default async function EventsPage() {
    const supabase = await createClient();

    // Fetch all upcoming events with mosque details
    const { data: events } = await supabase
        .from('events')
        .select(`
            *,
            mosques (
                id,
                name,
                city,
                country
            )
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Upcoming Events</h1>
                <p className="text-muted-foreground">Discover Islamic events, lectures, and community gatherings.</p>
            </div>

            {events && events.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event: any) => (
                        <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-xl mb-2 line-clamp-2">{event.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 shrink-0" />
                                            {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-muted-foreground line-clamp-3 text-sm">
                                    {event.description || 'No description provided.'}
                                </p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span className="line-clamp-1">
                                            {event.location || event.mosques?.name}
                                            {event.mosques?.city && `, ${event.mosques.city}`}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Ticket className="h-3 w-3" />
                                            {event.is_paid
                                                ? event.ticket_price != null
                                                    ? `Paid • $${event.ticket_price.toFixed(2)}`
                                                    : 'Paid event'
                                                : 'Free event'}
                                        </span>
                                        {event.has_seat_limit && event.total_seats != null && (
                                            <span className="inline-flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {event.total_seats} seats
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-4 bg-muted/20">
                                <Link href={`/mosques/${event.mosque_id}`} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        View Mosque Details
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                    <Calendar className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground max-w-md">
                        There are currently no upcoming events scheduled. Check back later or explore mosques near you.
                    </p>
                    <Link href="/mosques" className="mt-6">
                        <Button>Find Mosques</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
