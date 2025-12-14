export const routes = {
    home: '/',
    mosques: '/mosques',
    mosquesDetails: (id: string) => `/mosques/${id}`,

    // Auth
    signIn: '/sign-in',
    signUp: '/sign-up', // general/community
    signUpMosqueAdmin: '/sign-up/mosque-admin',
    postSignIn: '/auth/post-sign-in',
    onboarding: (role: 'community_user' | 'mosque_admin') => `/auth/onboarding/${role}`,

    // Community User
    community: {
        dashboard: '/community/dashboard',
    },

    favorites: '/favorites',
    profile: '/profile',
    settings: '/settings',

    // Mosque Admin
    mosqueAdmin: {
        dashboard: '/mosque/dashboard',
        prayerTimes: '/mosque/prayer-times',
        events: '/mosque/events',
        charity: '/mosque/charity',
        admins: '/mosque/admins',
        edit: '/mosque/edit',
    },

    // Super Admin
    superAdmin: {
        dashboard: '/admin/dashboard',
        users: '/admin/users',
        mosques: '/admin/mosques',
        approvals: '/admin/approvals',
    },

    // Request Admin
    requestAdmin: '/request-admin',
} as const;
