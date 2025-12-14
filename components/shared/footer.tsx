import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
    return (
        <footer className="bg-background border-t">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        About
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        Privacy
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        Terms
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        Contact
                    </Link>
                </div>
                <div className="mt-8 md:mt-0 md:order-1">
                    <p className="text-center text-base text-muted-foreground">
                        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
