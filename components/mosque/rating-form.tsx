"use client";

import { useState, useTransition } from 'react';
import { submitRating } from '@/app/actions/ratings';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RatingFormProps {
    mosqueId: string;
}

export function RatingForm({ mosqueId }: RatingFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            try {
                await submitRating(mosqueId, rating, comment.trim() || undefined);
                setSuccess('Thanks for your feedback!');
                setComment('');
                setRating(0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={cn(
                            'h-10 w-10 rounded-full border flex items-center justify-center text-sm font-semibold',
                            rating >= star ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
                        )}
                    >
                        {star}
                    </button>
                ))}
            </div>
            <Textarea
                placeholder="Share your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit" disabled={isPending || rating === 0}>
                {isPending ? 'Submitting...' : 'Submit rating'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
        </form>
    );
}
