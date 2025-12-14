'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Loader2, Plus, Calendar as CalendarIcon, MapPin, Trash2, ArrowLeft, Pencil, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { toast } from 'sonner';

type Event = {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    location: string | null;
    is_paid?: boolean;
    ticket_price?: number | null;
    has_seat_limit?: boolean;
    total_seats?: number | null;
    available_seats?: number | null;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        isPaid: false,
        ticketPrice: '',
        hasSeatLimit: false,
        totalSeats: '',
        availableSeats: '',
    });

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/mosque/events');
            const result = await response.json();
            if (result.data) {
                setEvents(result.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            start_time: '',
            end_time: '',
            location: '',
            isPaid: false,
            ticketPrice: '',
            hasSeatLimit: false,
            totalSeats: '',
            availableSeats: '',
        });
        setEditingEvent(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            start_time: event.start_time ? event.start_time.slice(0, 16) : '',
            end_time: event.end_time ? event.end_time.slice(0, 16) : '',
            location: event.location || '',
            isPaid: !!event.is_paid,
            ticketPrice: event.ticket_price != null ? String(event.ticket_price) : '',
            hasSeatLimit: !!event.has_seat_limit,
            totalSeats: event.total_seats != null ? String(event.total_seats) : '',
            availableSeats: event.available_seats != null ? String(event.available_seats) : '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                const payload = {
                    ...formData,
                    ticketPrice: formData.ticketPrice,
                    totalSeats: formData.totalSeats,
                    availableSeats: formData.availableSeats,
                };

                const isEditing = !!editingEvent;

                const response = await fetch('/api/mosque/events', {
                    method: isEditing ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        isEditing
                            ? {
                                id: editingEvent?.id,
                                ...payload,
                            }
                            : payload,
                    ),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.details || result.error || 'Failed to create event');
                }

                toast.success(isEditing ? 'Event updated successfully' : 'Event created successfully');
                setIsDialogOpen(false);
                resetForm();
                fetchEvents();
            } catch (error) {
                console.error('Error saving event:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to save event');
            }
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const response = await fetch(`/api/mosque/events?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            toast.success('Event deleted');
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={routes.mosqueAdmin.dashboard}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                        <p className="text-muted-foreground">Manage mosque events and activities</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={openCreateDialog}>
                            <Plus className="h-4 w-4" /> Create Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_time">Start Time *</Label>
                                    <Input
                                        id="start_time"
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_time">End Time</Label>
                                    <Input
                                        id="end_time"
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                                    />
                                </div>
                            </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="e.g. Main Hall"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Paid Event</Label>
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span className="text-sm text-muted-foreground">Is this a paid event?</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={formData.isPaid}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    isPaid: e.target.checked,
                                                    ticketPrice: e.target.checked ? prev.ticketPrice : '',
                                                }))
                                            }
                                        />
                                    </div>
                                    {formData.isPaid && (
                                        <div className="space-y-2 mt-2">
                                            <Label htmlFor="ticketPrice">Price per ticket</Label>
                                            <Input
                                                id="ticketPrice"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.ticketPrice}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        ticketPrice: e.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. 10.00"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Seat Limit</Label>
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span className="text-sm text-muted-foreground">Limit number of seats?</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={formData.hasSeatLimit}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    hasSeatLimit: e.target.checked,
                                                    totalSeats: e.target.checked ? prev.totalSeats : '',
                                                    availableSeats: e.target.checked ? prev.availableSeats : '',
                                                }))
                                            }
                                        />
                                    </div>
                                    {formData.hasSeatLimit && (
                                        <div className="space-y-3 mt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="totalSeats">Total seats</Label>
                                                <Input
                                                    id="totalSeats"
                                                    type="number"
                                                    min="1"
                                                    value={formData.totalSeats}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            totalSeats: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g. 50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="availableSeats">Available seats</Label>
                                                <Input
                                                    id="availableSeats"
                                                    type="number"
                                                    min="0"
                                                    value={formData.availableSeats}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            availableSeats: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="leave blank to use total seats"
                                                />
                                                <p className="text-[11px] text-muted-foreground">
                                                    Set to 0 when the event is fully booked.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {editingEvent ? 'Save Changes' : 'Create Event'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : events.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No events yet</h3>
                        <p className="mb-4">Create your first event to share with the community</p>
                        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            Create Event
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Card key={event.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <CalendarIcon className="h-3 w-3" />
                                    {format(new Date(event.start_time), 'PPP p')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {event.description || 'No description provided.'}
                                </p>
                                {event.location && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {event.location}
                                    </div>
                                )}
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Ticket className="h-3 w-3" />
                                        <span>
                                            {event.is_paid
                                                ? event.ticket_price != null
                                                    ? `Paid • $${event.ticket_price.toFixed(2)} per ticket`
                                                    : 'Paid event'
                                                : 'Free event'}
                                        </span>
                                    </div>
                                    {event.has_seat_limit && event.total_seats != null && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3" />
                                            {event.available_seats != null ? (
                                                <span>
                                                    {event.available_seats <= 0
                                                        ? `Full • 0 of ${event.total_seats} seats left`
                                                        : `${event.available_seats} of ${event.total_seats} seats available`}
                                                </span>
                                            ) : (
                                                <span>Limited seats • {event.total_seats} total</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto flex justify-between gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => openEditDialog(event)}
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(event.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
