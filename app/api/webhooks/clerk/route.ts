import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function deriveRole(evt: WebhookEvent): 'community_user' | 'mosque_admin' | 'super_admin' {
    // Only access user properties if it's a user event
    if (evt.type !== 'user.created' && evt.type !== 'user.updated') {
        return 'community_user';
    }

    const email = (evt.data.email_addresses?.[0]?.email_address || '').toLowerCase();
    const metaRole =
        (evt.data.public_metadata as { role?: string } | null)?.role ||
        (evt.data.unsafe_metadata as { role?: string } | null)?.role;

    if (metaRole === 'super_admin' || metaRole === 'mosque_admin') {
        return metaRole;
    }

    if (email === 'ultrotech1236@gmail.com') {
        return 'super_admin';
    }

    return 'community_user';
}

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        return new Response('Error: Missing webhook secret', { status: 500 });
    }

    const headerPayload = headers();
    const svix_id = (await headerPayload).get('svix-id');
    const svix_timestamp = (await headerPayload).get('svix-timestamp');
    const svix_signature = (await headerPayload).get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Webhook verification failed:', err);
        return new Response('Error: Verification failed', { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses?.[0]?.email_address;
        const role = deriveRole(evt);

        const { error } = await supabase
            .from('users')
            .upsert(
                {
                    clerk_id: id,
                    email,
                    first_name,
                    last_name,
                    avatar_url: image_url,
                    role,
                },
                { onConflict: 'clerk_id' }
            );

        if (error) {
            console.error('Supabase upsert error:', error);
            return new Response('Error: Database sync failed', { status: 500 });
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data;
        if (id) {
            const { error } = await supabase.from('users').delete().eq('clerk_id', id);
            if (error) {
                console.error('Supabase delete error:', error);
                return new Response('Error: Database delete failed', { status: 500 });
            }
        }
    }

    return new Response('Webhook processed', { status: 200 });
}
