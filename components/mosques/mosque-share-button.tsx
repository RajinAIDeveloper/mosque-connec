'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MosqueShareButtonProps {
    mosqueName: string;
    className?: string;
}

export function MosqueShareButton({ mosqueName, className }: MosqueShareButtonProps) {
    const handleShare = async () => {
        const url = window.location.href;
        const text = `Check out ${mosqueName} on Mosque Connect.`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: mosqueName,
                    text,
                    url,
                });
                return;
            } catch (error) {
                // User cancelled or share failed; fall back to clipboard.
            }
        }

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link', error);
            toast.error('Unable to copy link');
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="lg"
            className={cn('flex-1 md:flex-none gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/80', className)}
            onClick={handleShare}
        >
            <Share2 className="h-4 w-4" /> Share
        </Button>
    );
}

