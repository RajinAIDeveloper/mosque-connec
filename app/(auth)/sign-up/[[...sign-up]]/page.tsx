import { SignUp } from '@clerk/nextjs';
import { routes } from '@/config/routes';

export default function SignUpPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-muted/30">
            <SignUp
                path={routes.signUp}
                routing="path"
                forceRedirectUrl={routes.onboarding('community_user')}
                signInUrl={routes.signIn}
                signInForceRedirectUrl={`${routes.postSignIn}?role=community_user`}
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                        card: 'shadow-xl border-border',
                        headerTitle: 'text-foreground',
                        headerSubtitle: 'text-muted-foreground',
                        socialButtonsBlockButton: 'bg-background border-input text-foreground hover:bg-muted',
                        formFieldLabel: 'text-foreground',
                        formFieldInput: 'bg-background border-input text-foreground',
                        footerActionLink: 'text-primary hover:text-primary/90'
                    },
                }}
            />
        </div>
    );
}
