import { formatDate } from '@/lib/utils';

interface Rating {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export function RatingsList({ ratings }: { ratings: Rating[] }) {
    if (ratings.length === 0) {
        return <p className="text-sm text-muted-foreground">No ratings yet.</p>;
    }

    return (
        <div className="space-y-3">
            {ratings.map((r) => (
                <div key={r.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold">{r.rating} / 5</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
            ))}
        </div>
    );
}
