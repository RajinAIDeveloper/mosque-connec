'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { useRouter } from 'next/navigation';

type Mosque = {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    description: string | null;
    capacity: number | null;
    sect: string | null;
    created_at: string;
    users: {
        first_name: string;
        last_name: string;
        email: string;
    } | null;
};

export function ApprovalsList({ mosques }: { mosques: Mosque[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [localMosques, setLocalMosques] = useState(mosques);

    const handleAction = async (mosqueId: string, action: 'approve' | 'reject') => {
        setLoading(mosqueId);

        try {
            const response = await fetch('/api/admin/approve-mosque', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mosqueId, action }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to process action');
            }

            // Remove the mosque from the local list
            setLocalMosques(prev => prev.filter(m => m.id !== mosqueId));

            // Refresh the page data
            router.refresh();
        } catch (error) {
            console.error('Action failed:', error);
            alert(error instanceof Error ? error.message : 'Failed to process action');
        } finally {
            setLoading(null);
        }
    };

    if (localMosques.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">All Caught Up!</h3>
                <p className="text-muted-foreground">
                    There are no pending mosque approvals at this time.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {localMosques.map((mosque) => (
                <Card key={mosque.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl">{mosque.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {mosque.address}, {mosque.city}, {mosque.country}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleAction(mosque.id, 'approve')}
                                    disabled={loading === mosque.id}
                                >
                                    {loading === mosque.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleAction(mosque.id, 'reject')}
                                    disabled={loading === mosque.id}
                                >
                                    {loading === mosque.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <XCircle className="h-4 w-4" />
                                    )}
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Mosque Details</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Description:</strong> {mosque.description || 'No description provided'}</p>
                                    <p><strong>Capacity:</strong> {mosque.capacity || 'N/A'}</p>
                                    <p><strong>Sect:</strong> {mosque.sect || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Admin Details</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Name:</strong> {mosque.users?.first_name} {mosque.users?.last_name}</p>
                                    <p><strong>Email:</strong> {mosque.users?.email}</p>
                                    <p><strong>Submitted:</strong> {new Date(mosque.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
