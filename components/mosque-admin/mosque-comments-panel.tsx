'use client';

import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';
import { Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type Comment = {
    id: string;
    rating: number;
    comment: string | null;
    admin_reply: string | null;
    created_at: string;
};

export function MosqueCommentsPanel() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/mosque/comments');
                if (!res.ok) {
                    setIsLoading(false);
                    return;
                }
                const data = await res.json();
                setComments(data.comments || []);
                setPendingCount(data.pendingCount || 0);
            } catch (error) {
                console.error('Error loading comments for mosque dashboard', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    const handleChangeDraft = (id: string, value: string) => {
        setDrafts((prev) => ({ ...prev, [id]: value }));
    };

    const handleReply = (id: string) => {
        const reply = drafts[id]?.trim();
        if (!reply) {
            toast.error('Reply cannot be empty');
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch('/api/mosque/comments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ratingId: id, reply }),
                });

                if (!res.ok) {
                    throw new Error('Failed to save reply');
                }

                setComments((prev) =>
                    prev.map((c) =>
                        c.id === id ? { ...c, admin_reply: reply } : c,
                    ),
                );
                setDrafts((prev) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
                setPendingCount((prev) => Math.max(0, prev - 1));
                toast.success('Reply sent');
            } catch (error) {
                console.error('Error replying to comment', error);
                toast.error('Unable to send reply');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recent comments...
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No comments yet. As your community starts rating your mosque, new
                comments will appear here so you can reply.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {pendingCount > 0 && (
                <p className="text-sm font-medium text-amber-700">
                    {pendingCount} comment{pendingCount === 1 ? '' : 's'} waiting for your reply.
                </p>
            )}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="border rounded-lg p-4 space-y-3 bg-muted/40"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-primary" />
                                    {comment.rating} / 5
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(comment.created_at)}
                                </p>
                            </div>
                        </div>
                        {comment.comment && (
                            <p className="text-sm text-muted-foreground">
                                {comment.comment}
                            </p>
                        )}
                        {comment.admin_reply ? (
                            <div className="border rounded-md bg-background p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                                    Your reply
                                </p>
                                <p className="text-sm">{comment.admin_reply}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Textarea
                                    rows={2}
                                    placeholder="Write a reply to this comment..."
                                    value={drafts[comment.id] || ''}
                                    onChange={(e) =>
                                        handleChangeDraft(comment.id, e.target.value)
                                    }
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={() => handleReply(comment.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? 'Sending...' : 'Reply'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

