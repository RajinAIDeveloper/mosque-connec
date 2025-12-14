'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { routes } from '@/config/routes';
import { NavbarMobile } from './navbar-mobile';
import { LanguageToggle } from './language-toggle';
import { useUIStore } from '@/stores/ui-store';

interface NavbarClientProps {
    isSignedIn: boolean;
    dashboardUrl: string;
}

export function NavbarClient({ isSignedIn, dashboardUrl }: NavbarClientProps) {
    const language = useUIStore((state) => state.language ?? 'en');
    const isBn = language === 'bn';

    const navItems = [
        { name: isBn ? 'হোম' : 'Home', href: routes.home },
        { name: isBn ? 'মসজিদ' : 'Mosques', href: routes.mosques },
        { name: isBn ? 'ইভেন্টস' : 'Events', href: '/events' },
        { name: isBn ? 'চ্যারিটি' : 'Charity', href: '/charity' },
    ];

    const labels = {
        signIn: isBn ? 'সাইন ইন' : 'Sign In',
        signUp: isBn ? 'রেজিস্টার' : 'Sign Up',
        adminSignUp: isBn ? 'অ্যাডমিন রেজিস্টার' : 'Admin Sign Up',
        dashboard: isBn ? 'ড্যাশবোর্ড' : 'Dashboard',
    };

    return (
        <nav className="bg-background border-b sticky top-0 z-50 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-primary">
                                {siteConfig.name}
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-muted-foreground hover:border-border hover:text-foreground"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                        <LanguageToggle />
                        {!isSignedIn ? (
                            <>
                                <Link href={routes.signIn}>
                                    <Button variant="ghost">{labels.signIn}</Button>
                                </Link>
                                <Link href={routes.signUp}>
                                    <Button>{labels.signUp}</Button>
                                </Link>
                                <Link href={routes.signUpMosqueAdmin}>
                                    <Button variant="secondary">{labels.adminSignUp}</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href={dashboardUrl}>
                                    <Button variant="ghost" className="mr-2">
                                        {labels.dashboard}
                                    </Button>
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </>
                        )}
                    </div>
                    <div className="flex items-center sm:hidden gap-2">
                        <LanguageToggle />
                        <NavbarMobile navItems={navItems} isSignedIn={isSignedIn} dashboardUrl={dashboardUrl} />
                    </div>
                </div>
            </div>
        </nav>
    );
}

