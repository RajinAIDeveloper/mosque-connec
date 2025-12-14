import { cookies } from 'next/headers';
import type { Language } from './i18n';

export async function getServerLanguage(): Promise<Language> {
    try {
        const cookieStore = await cookies();
        const cookieLang = cookieStore.get('lang')?.value;
        return cookieLang === 'bn' ? 'bn' : 'en';
    } catch {
        return 'en';
    }
}
