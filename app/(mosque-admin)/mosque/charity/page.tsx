'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Loader2, Plus, DollarSign, Trash2, ArrowLeft, Target, Edit } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { toast } from 'sonner';

type Campaign = {
    id: string;
    title: string;
    description: string | null;
    goal_amount: number | null;
    raised_amount: number;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
};

export default function CharityPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        goal_amount: '',
        raised_amount: '',
        start_date: '',
        end_date: '',
    });

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/mosque/charity');
            const result = await response.json();
            if (result.data) {
                setCampaigns(result.data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                const response = await fetch('/api/mosque/charity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) throw new Error('Failed to create campaign');

                toast.success('Campaign created successfully');
                setIsCreateDialogOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    goal_amount: '',
                    raised_amount: '',
                    start_date: '',
                    end_date: '',
                });
                fetchCampaigns();
            } catch (error) {
                console.error('Error creating campaign:', error);
                toast.error('Failed to create campaign');
            }
        });
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCampaign) return;

        startTransition(async () => {
            try {
                const response = await fetch('/api/mosque/charity', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingCampaign.id,
                        ...formData,
                    }),
                });

                if (!response.ok) throw new Error('Failed to update campaign');

                toast.success('Campaign updated successfully');
                setEditingCampaign(null);
                setFormData({
                    title: '',
                    description: '',
                    goal_amount: '',
                    raised_amount: '',
                    start_date: '',
                    end_date: '',
                });
                fetchCampaigns();
            } catch (error) {
                console.error('Error updating campaign:', error);
                toast.error('Failed to update campaign');
            }
        });
    };

    const openEditDialog = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            title: campaign.title,
            description: campaign.description || '',
            goal_amount: campaign.goal_amount?.toString() || '',
            raised_amount: campaign.raised_amount.toString(),
            start_date: campaign.start_date || '',
            end_date: campaign.end_date || '',
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const response = await fetch(`/api/mosque/charity?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            toast.success('Campaign deleted');
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Failed to delete campaign');
        }
    };

    const CampaignForm = ({ onSubmit, isEdit }: { onSubmit: (e: React.FormEvent) => void; isEdit: boolean }) => (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="campaign-title">Campaign title *</Label>
                <Input
                    id="campaign-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ramadan Iftar Program"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="campaign-description">Description</Label>
                <Textarea
                    id="campaign-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Share what this campaign is about and how funds will be used."
                    rows={4}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="campaign-goal">Goal amount ($)</Label>
                    <Input
                        id="campaign-goal"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.goal_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, goal_amount: e.target.value }))}
                        placeholder="e.g. 5000"
                    />
                    <p className="text-xs text-muted-foreground">
                        Leave empty if there is no specific target.
                    </p>
                </div>
                {isEdit && (
                    <div className="space-y-2">
                        <Label htmlFor="campaign-raised">Raised so far ($)</Label>
                        <Input
                            id="campaign-raised"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.raised_amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, raised_amount: e.target.value }))}
                            placeholder="Amount collected so far"
                        />
                        <p className="text-xs text-muted-foreground">
                            Use this to correct the current raised amount if needed.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="campaign-start">Start date</Label>
                    <Input
                        id="campaign-start"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="campaign-end">End date</Label>
                    <Input
                        id="campaign-end"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Leave empty if this campaign is ongoing.
                    </p>
                </div>
            </div>

            <DialogFooter className="pt-2">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {isEdit ? 'Save changes' : 'Create campaign'}
                </Button>
            </DialogFooter>
        </form>
    );

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
                        <h1 className="text-3xl font-bold tracking-tight">Charity & Donations</h1>
                        <p className="text-muted-foreground">Manage fundraising campaigns</p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Campaign</DialogTitle>
                        </DialogHeader>
                        <CampaignForm onSubmit={handleCreate} isEdit={false} />
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : campaigns.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <DollarSign className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">No active campaigns</h3>
                        <p className="mb-4">Start a fundraising campaign for your mosque</p>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                            Create Campaign
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Target className="h-3 w-3" />
                                    Goal: {campaign.goal_amount ? `$${campaign.goal_amount.toLocaleString()}` : 'No goal set'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {campaign.description || 'No description provided.'}
                                </p>

                                {campaign.goal_amount && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Raised: ${campaign.raised_amount.toLocaleString()}</span>
                                            <span className="text-muted-foreground">
                                                {Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}%
                                            </span>
                                        </div>
                                        <Progress value={(campaign.raised_amount / campaign.goal_amount) * 100} />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-4">
                                <div className="text-xs text-muted-foreground">
                                    {campaign.end_date ? `Ends ${format(new Date(campaign.end_date), 'MMM d, yyyy')}` : 'No end date'}
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={editingCampaign?.id === campaign.id} onOpenChange={(open) => !open && setEditingCampaign(null)}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(campaign)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" /> Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle>Edit Campaign</DialogTitle>
                                            </DialogHeader>
                                            <CampaignForm onSubmit={handleEdit} isEdit={true} />
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(campaign.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
