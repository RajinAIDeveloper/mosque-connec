import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, address, city, country, latitude, longitude, phone, website, description, allows_women, madhhab, userId } = body;

        if (!name || !address || !latitude || !longitude) {
            return NextResponse.json(
                { error: 'Missing required fields: name, address, latitude, longitude' },
                { status: 400 }
            );
        }

        // Use admin client to bypass RLS
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify the user owns this userId
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', user.id)
            .eq('id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found or unauthorized' }, { status: 403 });
        }

        // Check if user already has a mosque
        const { data: existingMosques } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', userId)
            .limit(1);

        if (existingMosques && existingMosques.length > 0) {
            return NextResponse.json({ error: 'User already has a mosque' }, { status: 400 });
        }

        // Create the mosque (verified: false by default)
        const { data: mosque, error } = await supabaseAdmin
            .from('mosques')
            .insert({
                name,
                address,
                city: city || null,
                country: country || null,
                latitude,
                longitude,
                phone: phone || null,
                website: website || null,
                description: description || null,
                allows_women: allows_women || false,
                madhhab: madhhab || null,
                admin_id: userId,
                verified: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating mosque:', error);
            return NextResponse.json({ error: 'Failed to create mosque' }, { status: 500 });
        }

        return NextResponse.json({ success: true, mosque }, { status: 201 });
    } catch (error) {
        console.error('Error in mosque creation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
