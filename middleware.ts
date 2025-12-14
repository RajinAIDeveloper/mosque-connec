import { clerkMiddleware, clerkClient, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routes } from './config/routes';

const SUPER_EMAIL = 'ultrotech1236@gmail.com';

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/auth(.*)',
    '/api/webhooks(.*)',
    '/mosques(.*)',
    '/favicon.ico',
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const url = req.nextUrl;

    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    const isSuperArea = url.pathname.startsWith('/admin');
    const isMosqueAdminArea = url.pathname.startsWith('/mosque');

    if (isSuperArea || isMosqueAdminArea) {
        if (!userId) {
            return NextResponse.redirect(new URL(routes.signIn, req.url));
        }

        // Fetch the latest user data from Clerk to determine role and email
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        const email = user.emailAddresses[0]?.emailAddress?.toLowerCase();
        const role = (user.publicMetadata as { role?: string } | null)?.role;

        const isSuper = role === 'super_admin' || email === SUPER_EMAIL;
        const isMosqueAdmin = role === 'mosque_admin';

        if (isSuperArea && !isSuper) {
            return NextResponse.redirect(new URL(routes.community.dashboard, req.url));
        }

        if (isMosqueAdminArea && !(isSuper || isMosqueAdmin)) {
            return NextResponse.redirect(new URL(routes.community.dashboard, req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
