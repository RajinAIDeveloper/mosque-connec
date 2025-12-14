import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';
import { createClient } from '@/utils/supabase/server';
import { MosquesListClient } from '@/components/mosques/mosques-list-client';

export const metadata = {
    title: 'Favorite Mosques | Mosque Connect',
    description: 'Mosques you follow on Mosque Connect.',
};

export default async function FavoritesPage() {
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

    let followedMosqueIds: string[] = [];

    if (appUser) {
        const { data: following } = await supabase
            .from('mosque_followers')
            .select('mosque_id')
            .eq('user_id', appUser.id);

        if (following) {
            followedMosqueIds = following.map(f => f.mosque_id);
        }
    }

    const { data: mosques } = await supabase
        .from('mosques')
        .select('id, name, address, image_url, city, country, madhhab, allows_women, phone, latitude, longitude')
        .eq('verified', true)
        .order('name');

    return (
        <MosquesListClient
            initialMosques={mosques || []}
            initialQuery={''}
            followedMosqueIds={followedMosqueIds}
            initialMyMosques={true}
        />
    );
}

