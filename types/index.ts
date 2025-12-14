export interface User {
    id: string;
    clerk_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: 'community_user' | 'mosque_admin' | 'super_admin';
    created_at: string;
    updated_at: string;
}

export interface Mosque {
    id: string;
    name: string;
    description: string | null;
    address: string;
    latitude: number;
    longitude: number;
    phone: string | null;
    website: string | null;
    image_url: string | null;
    admin_id: string | null;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface PrayerTime {
    id: string;
    mosque_id: string;
    prayer_name: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
    prayer_time: string;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    mosque_id: string;
    title: string;
    description: string | null;
    category: string | null;
    event_date: string;
    location: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface CharityOpportunity {
    id: string;
    mosque_id: string;
    title: string;
    description: string | null;
    goal_amount: number | null;
    current_amount: number;
    end_date: string | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface MosqueRating {
    id: string;
    mosque_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserFavorite {
    id: string;
    user_id: string;
    mosque_id: string;
    created_at: string;
}

export interface NotificationPreference {
    id: string;
    user_id: string;
    mosque_id: string;
    prayer_times: boolean;
    events: boolean;
    charity: boolean;
    created_at: string;
    updated_at: string;
}

export interface AdminRequest {
    id: string;
    user_id: string;
    mosque_id: string | null;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    created_at: string;
    updated_at: string;
}
