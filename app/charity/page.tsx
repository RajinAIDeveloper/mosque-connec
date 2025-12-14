import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Heart, Target, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DonateButton } from '@/components/mosques/donate-button';

export const metadata = {
    title: 'Charity Campaigns | Mosque Connect',
    description: 'Support mosque projects and charitable causes.',
};

export default async function CharityPage() {
    const supabase = await createClient();

    // Fetch all active campaigns with mosque details
    const { data: campaigns } = await supabase
        .from('charity_campaigns')
        .select(`
            *,
            mosques (
                id,
                name,
                city,
                country,
                phone
            )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Charity Campaigns</h1>
                <p className="text-muted-foreground">Support local mosques and community projects.</p>
            </div>

            {campaigns && campaigns.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign: any) => (
                        <Card key={campaign.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl mb-1 line-clamp-1">{campaign.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {campaign.mosques?.name}
                                    {campaign.mosques?.city && `, ${campaign.mosques.city}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-muted-foreground line-clamp-3 text-sm">
                                    {campaign.description || 'No description provided.'}
                                </p>

                                {campaign.goal_amount && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-medium">
                                            <span>Raised: ${campaign.raised_amount.toLocaleString()}</span>
                                            <span className="text-muted-foreground">
                                                Goal: ${campaign.goal_amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <Progress value={(campaign.raised_amount / campaign.goal_amount) * 100} className="h-2" />
                                        <div className="text-xs text-right text-muted-foreground">
                                            {Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}% Funded
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex gap-2 border-t pt-4 bg-muted/20">
                                <Link href={`/mosques/${campaign.mosque_id}`} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        View Mosque
                                    </Button>
                                </Link>
                                <div className="flex-1">
                                    <DonateButton
                                        phone={campaign.mosques?.phone}
                                        campaignTitle={campaign.title}
                                        mosqueName={campaign.mosques?.name}
                                    />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                    <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Campaigns</h3>
                    <p className="text-muted-foreground max-w-md">
                        There are currently no active charity campaigns. Check back later to support community projects.
                    </p>
                    <Link href="/mosques" className="mt-6">
                        <Button>Find Mosques</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
