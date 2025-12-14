'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Shield, Trash2, Loader2, UserCog } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
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

type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
};

export function UsersList({ users }: { users: User[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [localUsers, setLocalUsers] = useState(users);

    const handleChangeRole = async (userId: string, newRole: string, userName: string) => {
        if (!confirm(`Change role for "${userName}" to ${newRole.replace('_', ' ')}?`)) {
            return;
        }

        setLoading(userId);

        try {
            const response = await fetch('/api/admin/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update user role');
            }

            // Update local list
            setLocalUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
            router.refresh();
        } catch (error) {
            console.error('Role change failed:', error);
            alert(error instanceof Error ? error.message : 'Failed to update user role');
        } finally {
            setLoading(null);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(userId);

        try {
            const response = await fetch('/api/admin/user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete user');
            }

            // Remove from local list
            setLocalUsers(prev => prev.filter(u => u.id !== userId));
            router.refresh();
        } catch (error) {
            console.error('Delete failed:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete user');
        } finally {
            setLoading(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>
                    A list of all users and their roles
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localUsers.map((userData) => (
                            <TableRow key={userData.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {userData.avatar_url && (
                                            <img src={userData.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                                        )}
                                        {userData.first_name} {userData.last_name}
                                    </div>
                                </TableCell>
                                <TableCell>{userData.email}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userData.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                                            userData.role === 'mosque_admin' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {userData.role === 'super_admin' && <Shield className="h-3 w-3 mr-1" />}
                                        {userData.role?.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>{new Date(userData.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={loading === userData.id}>
                                                {loading === userData.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <MoreHorizontal className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => handleChangeRole(userData.id, 'community_user', `${userData.first_name} ${userData.last_name}`)}
                                                disabled={userData.role === 'community_user'}
                                            >
                                                <UserCog className="h-4 w-4 mr-2" />
                                                Make Community User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleChangeRole(userData.id, 'mosque_admin', `${userData.first_name} ${userData.last_name}`)}
                                                disabled={userData.role === 'mosque_admin'}
                                            >
                                                <UserCog className="h-4 w-4 mr-2" />
                                                Make Mosque Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleChangeRole(userData.id, 'super_admin', `${userData.first_name} ${userData.last_name}`)}
                                                disabled={userData.role === 'super_admin'}
                                            >
                                                <Shield className="h-4 w-4 mr-2" />
                                                Make Super Admin
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(userData.id, `${userData.first_name} ${userData.last_name}`)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete User
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
