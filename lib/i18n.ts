export type Language = 'en' | 'bn';

// Very small key-based translation helper.
// If a key is missing, the original English text is returned.
const translations: Record<string, { bn: string }> = {
    // Global / navbar
    'Home': { bn: 'হোম' },
    'Mosques': { bn: 'মসজিদ' },
    'Events': { bn: 'ইভেন্টস' },
    'Charity': { bn: 'চ্যারিটি' },
    'Sign In': { bn: 'সাইন ইন' },
    'Sign Up': { bn: 'সাইন আপ' },
    'Admin Sign Up': { bn: 'অ্যাডমিন সাইন আপ' },
    'Dashboard': { bn: 'ড্যাশবোর্ড' },

    // Landing page – hero
    'Now Live in Beta': { bn: 'এখন বিটা সংস্করণে চালু' },
    'Connect with Your Local Mosque': { bn: 'আপনার আশেপাশের মসজিদের সাথে যুক্ত থাকুন' },
    'Find prayer times, join events, and support your community. The modern platform for the digital ummah.':
        {
            bn: 'নামাজের সময় জানুন, ইভেন্টে যোগ দিন এবং আপনার কমিউনিটিকে সহায়তা করুন। ডিজিটাল উম্মাহর জন্য আধুনিক প্ল্যাটফর্ম।',
        },
    'Get Started': { bn: 'শুরু করুন' },
    'Find Mosques': { bn: 'মসজিদ খুঁজুন' },

    // Landing page – features
    'Everything you need': { bn: 'আপনার সবকিছু এক জায়গায়' },
    "Whether you're a community member or a mosque administrator, we have tools tailored for you.": {
        bn: 'আপনি কমিউনিটির একজন সদস্য হন বা মসজিদ অ্যাডমিন – আপনার জন্য উপযোগী টুলস রয়েছে আমাদের কাছে।',
    },
    'Find Nearby Mosques': { bn: 'কাছাকাছি মসজিদ খুঁজুন' },
    'Locate mosques near you, view their facilities, and get accurate prayer times.': {
        bn: 'আপনার আশেপাশের মসজিদ খুঁজে নিন, সুবিধাসমূহ দেখুন এবং নির্ভুল নামাজের সময় জেনে নিন।',
    },
    'Community Events': { bn: 'কমিউনিটি ইভেন্টস' },
    'Stay updated with lectures, classes, and community gatherings happening around you.': {
        bn: 'আপনার আশেপাশে অনুষ্ঠিত ওয়াজ, ক্লাস এবং কমিউনিটি গ্যাদারিং সম্পর্কে আপডেট থাকুন।',
    },
    'Support & Donate': { bn: 'সহায়তা ও দান করুন' },
    'Easily support your local mosques and community campaigns.': {
        bn: 'সহজেই আপনার স্থানীয় মসজিদ ও কমিউনিটি ক্যাম্পেইনকে সহায়তা করুন।',
    },

    // Landing page – admin section
    'For Mosque Administrators': { bn: 'মসজিদ প্রশাসকদের জন্য' },
    'Manage your mosque with ease': { bn: 'সহজেই আপনার মসজিদ পরিচালনা করুন' },
    'Verified Presence': { bn: 'ভেরিফায়েড উপস্থিতি' },
    'Claim your official mosque page and build trust.': {
        bn: 'আপনার অফিসিয়াল মসজিদ পেজ দাবি করুন এবং আস্থা গড়ে তুলুন।',
    },
    'Event Management': { bn: 'ইভেন্ট ম্যানেজমেন্ট' },
    'Create and promote events to your local community.': {
        bn: 'আপনার স্থানীয় কমিউনিটির জন্য ইভেন্ট তৈরি ও প্রচার করুন।',
    },
    'Digital Noticeboard': { bn: 'ডিজিটাল নোটিশবোর্ড' },
    'Update prayer times and announcements instantly.': {
        bn: 'নামাজের সময়সূচি ও ঘোষণা মুহূর্তেই আপডেট করুন।',
    },
    'Register Your Mosque': { bn: 'আপনার মসজিদ রেজিস্টার করুন' },

    // Landing page – CTA
    'Ready to join the community?': { bn: 'কমিউনিটিতে যোগ দিতে প্রস্তুত?' },
    'Join thousands of Muslims connecting with their local mosques today.': {
        bn: 'হাজারো মুসলিম আজই তাদের স্থানীয় মসজিদের সাথে যুক্ত হচ্ছেন – আপনিও যোগ দিন।',
    },
    'Sign Up Now': { bn: 'এখনই সাইন আপ করুন' },

    // Community dashboard
    'Community Dashboard': { bn: 'কমিউনিটি ড্যাশবোর্ড' },
    'Welcome back,': { bn: 'পুনরায় স্বাগতম,' },
    'Favorite Mosques': { bn: 'পছন্দের মসজিদ' },
    'Mosques you follow': { bn: 'আপনি যে মসজিদগুলো অনুসরণ করছেন' },
    'Nearby Mosques': { bn: 'কাছাকাছি মসজিদ' },
    'Within 10km of you': { bn: 'আপনার ১০ কিলোমিটারের মধ্যে' },
    'Upcoming Events': { bn: 'আসন্ন ইভেন্টস' },
    'Events this week': { bn: 'এই সপ্তাহের ইভেন্টস' },
    'Mosque Map': { bn: 'মসজিদ ম্যাপ' },
    'Mosques near': { bn: 'কাছাকাছি মসজিদ –' },
    'Location Not Set': { bn: 'লোকেশন নির্ধারিত নয়' },
    'Set your location to see nearby mosques on the map.': {
        bn: 'নকশায় কাছাকাছি মসজিদ দেখতে আপনার লোকেশন সেট করুন।',
    },
    'Set Location': { bn: 'লোকেশন সেট করুন' },
    'Recommended for You': { bn: 'আপনার জন্য সুপারিশ' },
    'Nearest mosques based on your location': { bn: 'আপনার লোকেশন অনুযায়ী নিকটবর্তী মসজিদ' },
    'No mosques found nearby.': { bn: 'কাছাকাছি কোনো মসজিদ পাওয়া যায়নি।' },
    'Set your location': { bn: 'আপনার লোকেশন সেট করুন' },

    // Mosque admin dashboard
    'Mosque Management': { bn: 'মসজিদ ম্যানেজমেন্ট' },
    'Prayer Times': { bn: 'নামাজের সময়সূচি' },
    'Manage daily prayer schedules': { bn: 'দৈনিক নামাজের সময়সূচি ব্যবস্থাপনা করুন।' },
    'Create and manage events': { bn: 'ইভেন্ট তৈরি ও ব্যবস্থাপনা করুন।' },
    'Manage charity campaigns': { bn: 'চ্যারিটি ক্যাম্পেইন ম্যানেজ করুন।' },
    'Mosque Details': { bn: 'মসজিদের বিস্তারিত' },
    'Update mosque information': { bn: 'মসজিদের তথ্য হালনাগাদ করুন।' },
    'Admins': { bn: 'অ্যাডমিন' },
    'Manage mosque administrators': { bn: 'মসজিদের অ্যাডমিনদের ম্যানেজ করুন।' },
    'Community': { bn: 'কমিউনিটি' },
    'View community engagement': { bn: 'কমিউনিটির সম্পৃক্ততা দেখুন।' },
    'Total Events': { bn: 'মোট ইভেন্ট' },
    'Active Campaigns': { bn: 'সক্রিয় ক্যাম্পেইন' },
    'Followers': { bn: 'ফলোয়ার' },
    'Status': { bn: 'অবস্থা' },
    'Verified': { bn: 'ভেরিফায়েড' },
    'Pending': { bn: 'অপেক্ষমাণ' },
    'Community Comments': { bn: 'কমিউনিটি কমেন্টস' },
    'See the latest feedback from your community and reply directly.': {
        bn: 'আপনার কমিউনিটির সর্বশেষ মতামত দেখুন এবং সরাসরি উত্তর দিন।',
    },
    'Comment Notifications': { bn: 'কমেন্ট নোটিফিকেশন' },
    'Comments waiting for your response.': { bn: 'আপনার উত্তরের অপেক্ষায় থাকা কমেন্টসমূহ।' },

    // Generic
    'No description provided.': { bn: 'কোনো বিবরণ প্রদান করা হয়নি।' },
    'No upcoming events scheduled': { bn: 'কোনো আসন্ন ইভেন্ট নির্ধারিত নেই।' },
    'Check back later for updates': { bn: 'আপডেটের জন্য পরে আবার দেখুন।' },

    // Mosques list page
    'Find a Mosque': { bn: 'একটি মসজিদ খুঁজুন' },
    'Discover verified mosques and community centers near you.': {
        bn: 'আপনার আশেপাশের যাচাইকৃত মসজিদ ও কমিউনিটি সেন্টারগুলো খুঁজে নিন।',
    },
    'Search by name...': { bn: 'নামের মাধ্যমে খুঁজুন...' },
    'Search': { bn: 'সার্চ' },
    "Women's Area": { bn: 'নারীদের নামাজের স্থান' },
    'View Details': { bn: 'বিস্তারিত দেখুন' },
    'Get Directions': { bn: 'দিকনির্দেশনা নিন' },
    'No mosques found': { bn: 'কোনো মসজিদ পাওয়া যায়নি' },
    "We couldn't find any mosques matching your filters. Try adjusting your search criteria.": {
        bn: 'আপনার নির্বাচিত ফিল্টারের সাথে মিল আছে এমন কোনো মসজিদ পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার পরিবর্তন করে দেখুন।',
    },
    'Clear Filters': { bn: 'ফিল্টার রিসেট করুন' },
    'No contact number available for this mosque': {
        bn: 'এই মসজিদের কোনো যোগাযোগ নম্বর পাওয়া যায়নি।',
    },
    'Invalid phone number for this mosque': {
        bn: 'এই মসজিদের ফোন নম্বরটি সঠিক নয়।',
    },

    // Mosques filters
    'Filters:': { bn: 'ফিল্টার:' },
    'My Mosques': { bn: 'আমার অনুসরণ করা মসজিদ' },
    "Women's Prayer Area": { bn: 'নারীদের জন্য নামাজের স্থান' },
    'Madhhab:': { bn: 'মাযহাব:' },
    'All': { bn: 'সব' },
    'Hanafi': { bn: 'হানাফি' },
    "Shafi'i": { bn: 'শাফিঈ' },
    'Maliki': { bn: 'মালিকি' },
    'Hanbali': { bn: 'হানবলি' },
    'Other': { bn: 'অন্যান্য' },
};

export function t(lang: Language, text: string): string {
    if (lang === 'bn') {
        return translations[text]?.bn ?? text;
    }
    return text;
}

