'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, MoreHorizontal, Eye, Trash2, Loader2, Edit } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

type Mosque = {
    id: string;
    name: string;
    city: string;
    country: string;
    verified: boolean;
    created_at: string;
    users: {
        email: string;
    } | null;
};

export function MosquesList({ mosques }: { mosques: Mosque[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [localMosques, setLocalMosques] = useState(mosques);

    const handleDelete = async (mosqueId: string, mosqueName: string) => {
        if (!confirm(`Are you sure you want to delete "${mosqueName}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(mosqueId);

        try {
            const response = await fetch('/api/admin/mosque', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mosqueId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete mosque');
            }

            // Remove from local list
            setLocalMosques(prev => prev.filter(m => m.id !== mosqueId));
            router.refresh();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete mosque');
        } finally {
            setLoading(null);
        }
    };

    const handleView = (mosqueId: string) => {
        router.push(routes.mosquesDetails(mosqueId));
    };

    const handleEdit = (mosqueId: string) => {
        // Navigate to mosque edit page
        router.push(`/admin/mosques/${mosqueId}/edit`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registered Mosques</CardTitle>
                <CardDescription>
                    A list of all mosques including verified and unverified
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Admin Email</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localMosques.map((mosque) => (
                            <TableRow key={mosque.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        {mosque.name}
                                    </div>
                                </TableCell>
                                <TableCell>{mosque.city}, {mosque.country}</TableCell>
                                <TableCell>
                                    {mosque.verified ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{mosque.users?.email}</TableCell>
                                <TableCell>{new Date(mosque.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={loading === mosque.id}>
                                                {loading === mosque.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <MoreHorizontal className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleView(mosque.id)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleEdit(mosque.id)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Mosque
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(mosque.id, mosque.name)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
