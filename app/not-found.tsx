import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Page not found</h1>
            <p className="text-muted-foreground max-w-[500px] mb-8">
                Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                    <Button className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Button>
                </Link>
                <Link href="/mosques">
                    <Button variant="outline">Browse Mosques</Button>
                </Link>
            </div>
        </div>
    );
}
