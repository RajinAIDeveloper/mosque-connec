export const siteConfig = {
    name: 'Mosque Connect',
    description: 'Find mosques and prayer times near you. Connect with your local Muslim community.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    keywords: [
        'mosque',
        'prayer times',
        'salah',
        'muslim community',
        'masjid',
        'islamic center',
        'prayer',
    ],
    links: {
        github: 'https://github.com/yourusername/mosque-connect',
    },
    creator: 'Mosque Connect Team',
};

export type SiteConfig = typeof siteConfig;
