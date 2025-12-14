import { SignUp } from '@clerk/nextjs';
import { routes } from '@/config/routes';

export default function MosqueAdminSignUpPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-muted/30">
            <div className="w-full max-w-4xl grid gap-8 md:grid-cols-2 items-center bg-card p-8 rounded-2xl shadow-xl border">
                <div className="space-y-4">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary/10 text-primary">
                        Mosque Admin
                    </div>
                    <h1 className="text-3xl font-bold leading-tight">Register your mosque</h1>
                    <p className="text-muted-foreground">
                        Create an admin account to manage prayer times, events, and charity campaigns for your masjid.
                        Once you finish, we&apos;ll take you to the admin dashboard.
                    </p>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Requires email verification
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Super admin will verify your mosque ownership
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            You can add more admins later
                        </li>
                    </ul>
                </div>

                <div className="flex justify-center">
                    <SignUp
                        path={routes.signUpMosqueAdmin}
                        routing="path"
                        forceRedirectUrl={routes.onboarding('mosque_admin')}
                        signInUrl={routes.signIn}
                        signInForceRedirectUrl={`${routes.postSignIn}?role=mosque_admin`}
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                                card: 'shadow-none border-none bg-transparent',
                                headerTitle: 'hidden',
                                headerSubtitle: 'hidden',
                                socialButtonsBlockButton: 'bg-background border-input text-foreground hover:bg-muted',
                                formFieldLabel: 'text-foreground',
                                formFieldInput: 'bg-background border-input text-foreground',
                                footerActionLink: 'text-primary hover:text-primary/90'
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
