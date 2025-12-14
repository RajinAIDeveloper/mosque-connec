'use client';

import { useSession } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RedirectWithRefresh({ redirectTo }: { redirectTo: string }) {
    const { session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            session.reload().then(() => {
                router.push(redirectTo);
            });
        } else {
            router.push(redirectTo);
        }
    }, [session, redirectTo, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Redirecting...</span>
        </div>
    );
}
