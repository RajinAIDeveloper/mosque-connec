import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user's mosque
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) {
            return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });
        }

        // Fetch events
        const { data: events, error } = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('mosque_id', mosque.id)
            .order('start_time', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({ data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            start_time,
            end_time,
            location,
            isPaid,
            ticketPrice,
            hasSeatLimit,
            totalSeats,
            availableSeats,
        } = body as {
            title?: string;
            description?: string;
            start_time?: string;
            end_time?: string;
            location?: string;
            isPaid?: boolean;
            ticketPrice?: string | number;
            hasSeatLimit?: boolean;
            totalSeats?: string | number;
            availableSeats?: string | number;
        };

        console.log('Event creation request:', {
            title,
            start_time,
            end_time,
            location,
            isPaid,
            ticketPrice,
            hasSeatLimit,
            totalSeats,
            availableSeats,
        });

        if (!title || !start_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user's mosque
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) {
            return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });
        }

        console.log('Creating event for mosque:', mosque.id, 'with data:', {
            title,
            start_time,
            end_time,
            isPaid,
            ticketPrice,
            hasSeatLimit,
            totalSeats,
        });

        // Create event
        const { data, error } = await supabaseAdmin
            .from('events')
            .insert({
                mosque_id: mosque.id,
                title,
                description: description || null,
                start_time: start_time,
                end_time: end_time || null,
                location: location || null,
                is_paid: !!isPaid,
                ticket_price:
                    isPaid && ticketPrice !== undefined && ticketPrice !== null && String(ticketPrice) !== ''
                        ? parseFloat(String(ticketPrice))
                        : null,
                has_seat_limit: !!hasSeatLimit,
                total_seats:
                    hasSeatLimit && totalSeats !== undefined && totalSeats !== null && String(totalSeats) !== ''
                        ? Number(totalSeats)
                        : null,
                available_seats:
                    hasSeatLimit
                        ? availableSeats !== undefined &&
                          availableSeats !== null &&
                          String(availableSeats) !== ''
                            ? Number(availableSeats)
                            : totalSeats !== undefined &&
                              totalSeats !== null &&
                              String(totalSeats) !== ''
                              ? Number(totalSeats)
                              : null
                        : null,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating event:', error);
            return NextResponse.json({
                error: 'Failed to create event',
                details: error.message,
                code: error.code,
                hint: error.hint
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            id,
            title,
            description,
            start_time,
            end_time,
            location,
            isPaid,
            ticketPrice,
            hasSeatLimit,
            totalSeats,
            availableSeats,
        } = body as {
            id?: string;
            title?: string;
            description?: string;
            start_time?: string;
            end_time?: string;
            location?: string;
            isPaid?: boolean;
            ticketPrice?: string | number;
            hasSeatLimit?: boolean;
            totalSeats?: string | number;
            availableSeats?: string | number;
        };

        if (!id) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user's mosque
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) {
            return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });
        }

        const updatePayload: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (title !== undefined) updatePayload.title = title;
        if (description !== undefined) updatePayload.description = description || null;
        if (start_time !== undefined) updatePayload.start_time = start_time;
        if (end_time !== undefined) updatePayload.end_time = end_time || null;
        if (location !== undefined) updatePayload.location = location || null;

        if (isPaid !== undefined) {
            updatePayload.is_paid = !!isPaid;
        }

        if (ticketPrice !== undefined) {
            updatePayload.ticket_price =
                isPaid && ticketPrice !== null && String(ticketPrice) !== ''
                    ? parseFloat(String(ticketPrice))
                    : null;
        }

        if (hasSeatLimit !== undefined) {
            updatePayload.has_seat_limit = !!hasSeatLimit;
            if (!hasSeatLimit) {
                updatePayload.total_seats = null;
                updatePayload.available_seats = null;
            }
        }

        if (totalSeats !== undefined) {
            updatePayload.total_seats =
                hasSeatLimit && totalSeats !== null && String(totalSeats) !== ''
                    ? Number(totalSeats)
                    : null;
        }

        if (availableSeats !== undefined) {
            updatePayload.available_seats =
                availableSeats !== null && String(availableSeats) !== ''
                    ? Number(availableSeats)
                    : null;
        }

        const { data, error } = await supabaseAdmin
            .from('events')
            .update(updatePayload)
            .eq('id', id)
            .eq('mosque_id', mosque.id)
            .select('*')
            .single();

        if (error) {
            console.error('Supabase error updating event:', error);
            return NextResponse.json(
                { error: 'Failed to update event', details: error.message, code: error.code, hint: error.hint },
                { status: 500 },
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('id');

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        // Create admin client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify ownership (simplified check via mosque_id relation would be better but this works)
        // Ideally we check if the event belongs to the mosque owned by the user
        // Get user's mosque
        const { data: appUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('clerk_id', userId)
            .single();

        if (!appUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const { data: mosque } = await supabaseAdmin
            .from('mosques')
            .select('id')
            .eq('admin_id', appUser.id)
            .single();

        if (!mosque) return NextResponse.json({ error: 'Mosque not found' }, { status: 404 });

        // Delete event ensuring it belongs to this mosque
        const { error } = await supabaseAdmin
            .from('events')
            .delete()
            .eq('id', eventId)
            .eq('mosque_id', mosque.id);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
