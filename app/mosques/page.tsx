import { createClient } from '@/utils/supabase/server';
import { MosquesListClient } from '@/components/mosques/mosques-list-client';
import { auth } from '@clerk/nextjs/server';

export const metadata = {
    title: 'Find Mosques | Mosque Connect',
    description: 'Discover verified mosques in your area.',
};

export default async function MosquesPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const params = await searchParams;
    const query = params?.q || '';
    const supabase = await createClient();
    const { userId } = await auth();

    const { data: mosques } = await supabase
        .from('mosques')
        .select('id, name, address, image_url, city, country, madhhab, allows_women, phone, latitude, longitude')
        .eq('verified', true)
        .order('name');

    let followedMosqueIds: string[] = [];

    if (userId) {
        // Get user's Supabase ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (user) {
            const { data: following } = await supabase
                .from('mosque_followers')
                .select('mosque_id')
                .eq('user_id', user.id);

            if (following) {
                followedMosqueIds = following.map(f => f.mosque_id);
            }
        }
    }

    return (
        <MosquesListClient
            initialMosques={mosques || []}
            initialQuery={query}
            followedMosqueIds={followedMosqueIds}
        />
    );
}
