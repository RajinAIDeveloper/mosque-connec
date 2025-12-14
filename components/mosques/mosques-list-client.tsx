'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Search, ArrowRight, CheckCircle2, Info, Navigation, Phone } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { Input } from '@/components/ui/input';
import { MosquesFilter } from '@/components/mosques/mosques-filter';
import { toast } from 'sonner';
import { useUIStore } from '@/stores/ui-store';
import { t } from '@/lib/i18n';

type Mosque = {
    id: string;
    name: string;
    address: string;
    image_url: string | null;
    city: string | null;
    country: string | null;
    madhhab: string | null;
    allows_women: boolean | null;
    phone: string | null;
    latitude: number | null;
    longitude: number | null;
};

export function MosquesListClient({
    initialMosques,
    initialQuery,
    followedMosqueIds = [],
    initialMyMosques = false,
}: {
    initialMosques: Mosque[],
    initialQuery: string,
    followedMosqueIds?: string[],
    initialMyMosques?: boolean,
}) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [womensAreaFilter, setWomensAreaFilter] = useState(false);
    const [madhhabFilter, setMadhhabFilter] = useState('all');
    const [myMosquesFilter, setMyMosquesFilter] = useState(initialMyMosques);
    const language = useUIStore((state) => state.language ?? 'en');
    const lang = language;

    const handleDirections = (mosque: Mosque) => {
        const hasCoords = typeof mosque.latitude === 'number' && typeof mosque.longitude === 'number';
        const url = hasCoords
            ? `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${mosque.name} ${mosque.address}`)}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleCall = (mosque: Mosque) => {
        if (!mosque.phone) {
            toast.error(t(lang, 'No contact number available for this mosque'));
            return;
        }

        const cleanPhone = mosque.phone.replace(/\D/g, '');
        if (!cleanPhone) {
            toast.error(t(lang, 'Invalid phone number for this mosque'));
            return;
        }

        const message = encodeURIComponent(
            lang === 'bn'
                ? `আসসালামু আলাইকুম! আমি ${mosque.name} মসজিদের সাথে যোগাযোগ করতে চাই।`
                : `Salam! I would like to get in touch with ${mosque.name}.`
        );

        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    // Filter mosques based on search and filters
    const filteredMosques = useMemo(() => {
        let filtered = initialMosques;

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(mosque =>
                mosque.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply My Mosques filter
        if (myMosquesFilter) {
            filtered = filtered.filter(mosque => followedMosqueIds.includes(mosque.id));
        }

        // Apply women's area filter
        if (womensAreaFilter) {
            filtered = filtered.filter(mosque => mosque.allows_women === true);
        }

        // Apply madhhab filter
        if (madhhabFilter !== 'all') {
            filtered = filtered.filter(mosque => mosque.madhhab === madhhabFilter);
        }

        return filtered;
    }, [initialMosques, searchQuery, womensAreaFilter, madhhabFilter, myMosquesFilter, followedMosqueIds]);

    const hasActiveFilters = womensAreaFilter || madhhabFilter !== 'all' || myMosquesFilter;

    const handleClearFilters = () => {
        setWomensAreaFilter(false);
        setMadhhabFilter('all');
        setMyMosquesFilter(false);
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setSearchQuery(formData.get('q') as string || '');
    };

    return (
        <div className="container py-10 px-4 md:px-6 mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t(lang, 'Find a Mosque')}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t(lang, 'Discover verified mosques and community centers near you.')}
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="q"
                                placeholder={t(lang, 'Search by name...')}
                                className="pl-9"
                                defaultValue={initialQuery}
                            />
                        </div>
                        <Button type="submit">
                            {t(lang, 'Search')}
                        </Button>
                    </form>
                </div>
            </div>

            <MosquesFilter
                womensArea={womensAreaFilter}
                madhhab={madhhabFilter}
                myMosques={myMosquesFilter}
                onWomensAreaChange={setWomensAreaFilter}
                onMadhhabChange={setMadhhabFilter}
                onMyMosquesChange={setMyMosquesFilter}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
                showMyMosquesFilter={followedMosqueIds.length > 0}
            />

            <div className="mb-4 text-sm text-muted-foreground">
                {lang === 'bn'
                    ? `মোট ${initialMosques.length} মসজিদের মধ্যে ${filteredMosques.length}টি দেখানো হচ্ছে`
                    : `Showing ${filteredMosques.length} of ${initialMosques.length} mosques`}
            </div>

            {filteredMosques && filteredMosques.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMosques.map((mosque) => (
                        <Card key={mosque.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                            <div className="aspect-video w-full bg-muted relative">
                                {mosque.image_url ? (
                                    <img
                                        src={mosque.image_url}
                                        alt={mosque.name}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/50">
                                        <MapPin className="h-10 w-10 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{mosque.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3">
                                <p className="text-sm text-muted-foreground flex items-start gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{mosque.address}</span>
                                </p>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {/* Location Badge */}
                                    {(mosque.city || mosque.country) && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-white dark:text-white">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {mosque.city && mosque.country
                                                ? `${mosque.city}, ${mosque.country}`
                                                : mosque.city || mosque.country}
                                        </span>
                                    )}

                                    {/* Madhhab Badge */}
                                    {mosque.madhhab && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-white dark:text-white">
                                            <Info className="h-3 w-3 mr-1" />
                                            {mosque.madhhab === 'shafi' ? "Shafi'i" : mosque.madhhab.charAt(0).toUpperCase() + mosque.madhhab.slice(1)}
                                        </span>
                                    )}

                                    {/* Women's Prayer Badge */}
                                    {mosque.allows_women && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-white dark:text-white">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            {t(lang, "Women's Area")}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <Link href={routes.mosquesDetails(mosque.id)} className="w-full">
                                    <Button variant="outline" className="w-full gap-2">
                                        {t(lang, 'View Details')} <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 gap-2"
                                        onClick={() => handleDirections(mosque)}
                                    >
                                        <Navigation className="h-4 w-4" /> {t(lang, 'Get Directions')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 gap-2"
                                        onClick={() => handleCall(mosque)}
                                    >
                                        <Phone className="h-4 w-4" /> WhatsApp
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">
                        {t(lang, 'No mosques found')}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        {t(
                            lang,
                            "We couldn't find any mosques matching your filters. Try adjusting your search criteria.",
                        )}
                    </p>
                    {hasActiveFilters && (
                        <Button variant="outline" className="mt-6" onClick={handleClearFilters}>
                            {t(lang, 'Clear Filters')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
