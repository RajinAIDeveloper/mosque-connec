"use client";

import { useTransition, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFavorite } from '@/app/actions/favorites';

interface FavoriteButtonProps {
    mosqueId: string;
    initialFavorited?: boolean;
}

export function FavoriteButton({ mosqueId, initialFavorited = false }: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [isPending, startTransition] = useTransition();

    const onClick = () => {
        startTransition(async () => {
            try {
                const result = await toggleFavorite(mosqueId);
                setFavorited(result.favorited);
            } catch (error) {
                console.error(error);
            }
        });
    };

    return (
        <Button
            variant={favorited ? 'secondary' : 'outline'}
            onClick={onClick}
            disabled={isPending}
            className="gap-2"
        >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current text-primary' : ''}`} />
            {favorited ? 'Saved' : 'Save to favorites'}
        </Button>
    );
}
