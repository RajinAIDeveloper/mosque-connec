'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes } from '@/config/routes';
import { UserButton } from '@clerk/nextjs';

interface NavbarMobileProps {
    navItems: { name: string; href: string }[];
    isSignedIn: boolean;
    dashboardUrl: string;
}

export function NavbarMobile({ navItems, isSignedIn, dashboardUrl }: NavbarMobileProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="-mr-2 flex items-center sm:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Main menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden absolute top-16 left-0 right-0 bg-background border-b">
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-4 border-t border-border px-4">
                        <div className="flex items-center space-x-4">
                            {!isSignedIn ? (
                                <div className="flex flex-col w-full space-y-2">
                                    <Link href={routes.signIn} onClick={() => setIsOpen(false)}>
                                        <Button variant="outline" className="w-full">Sign In</Button>
                                    </Link>
                                    <Link href={routes.signUp} onClick={() => setIsOpen(false)}>
                                        <Button className="w-full">Sign Up</Button>
                                    </Link>
                                    <Link href={routes.signUpMosqueAdmin} onClick={() => setIsOpen(false)}>
                                        <Button variant="secondary" className="w-full">Admin Sign Up</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <Link href={dashboardUrl} onClick={() => setIsOpen(false)}>
                                        <Button variant="ghost">Dashboard</Button>
                                    </Link>
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
