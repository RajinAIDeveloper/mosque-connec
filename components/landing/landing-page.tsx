'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { t } from '@/lib/i18n';

export function LandingPageClient() {
    const language = useUIStore((state) => state.language ?? 'en');
    const lang = language;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-background to-muted/50">
                <div className="container px-4 md:px-6 mx-auto text-center relative z-10">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
                        {t(lang, 'Now Live in Beta')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        {t(lang, 'Connect with Your Local Mosque')}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        {t(
                            lang,
                            'Find prayer times, join events, and support your community. The modern platform for the digital ummah.',
                        )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up">
                            <Button size="lg" className="w-full sm:w-auto gap-2">
                                {t(lang, 'Get Started')} <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/mosques">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                {t(lang, 'Find Mosques')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 -z-10 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-background">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            {t(lang, 'Everything you need')}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t(
                                lang,
                                "Whether you're a community member or a mosque administrator, we have tools tailored for you.",
                            )}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t(lang, 'Find Nearby Mosques')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t(
                                    lang,
                                    'Locate mosques near you, view their facilities, and get accurate prayer times.',
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t(lang, 'Community Events')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t(
                                    lang,
                                    'Stay updated with lectures, classes, and community gatherings happening around you.',
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <Heart className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {t(lang, 'Support & Donate')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t(
                                    lang,
                                    'Easily support your local mosques and verified charity campaigns.',
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Mosque Admins */}
            <section className="py-20 bg-muted/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground mb-6">
                                {t(lang, 'For Mosque Administrators')}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                                {t(lang, 'Manage your mosque with ease')}
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">
                                            {t(lang, 'Verified Presence')}
                                        </h4>
                                        <p className="text-muted-foreground text-sm">
                                            {t(
                                                lang,
                                                'Claim your official mosque page and build trust.',
                                            )}
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Calendar className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">
                                            {t(lang, 'Event Management')}
                                        </h4>
                                        <p className="text-muted-foreground text-sm">
                                            {t(
                                                lang,
                                                'Create and promote events to your local community.',
                                            )}
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">
                                            {t(lang, 'Digital Noticeboard')}
                                        </h4>
                                        <p className="text-muted-foreground text-sm">
                                            {t(
                                                lang,
                                                'Update prayer times and announcements instantly.',
                                            )}
                                        </p>
                                    </div>
                                </li>
                            </ul>
                            <div className="mt-8">
                                <Link href="/sign-up/mosque-admin">
                                    <Button size="lg">
                                        {t(lang, 'Register Your Mosque')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-2xl overflow-hidden border shadow-xl bg-background p-2">
                            {/* Placeholder for dashboard preview */}
                            <div className="w-full h-full bg-muted/50 rounded-xl flex items-center justify-center text-muted-foreground">
                                Dashboard Preview Image
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-foreground">
                <div className="container px-4 md:px-6 mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                        {t(lang, 'Ready to join the community?')}
                    </h2>
                    <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-10 text-lg">
                        {t(
                            lang,
                            'Join thousands of Muslims connecting with their local mosques today.',
                        )}
                    </p>
                    <Link href="/sign-up">
                        <Button size="lg" variant="secondary" className="gap-2">
                            {t(lang, 'Sign Up Now')} <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Floating WhatsApp Button */}
            <Link
                href="https://wa.me/8801755557150"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#128C7E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
                aria-label="Contact us on WhatsApp"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                >
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                </svg>
            </Link>
        </div>
    );
}

