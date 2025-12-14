'use client';

import { useUIStore } from '@/stores/ui-store';

export function LanguageToggle() {
    const language = useUIStore((state) => state.language);
    const setLanguage = useUIStore((state) => state.setLanguage);

    const handleChange = (lang: 'en' | 'bn') => {
        setLanguage(lang);
        try {
            document.cookie = `lang=${lang}; path=/; max-age=31536000`;
        } catch {
            // ignore cookie errors in non-browser environments
        }
    };

    return (
        <div className="inline-flex items-center rounded-full border bg-muted/40 text-xs overflow-hidden">
            <button
                type="button"
                onClick={() => handleChange('en')}
                className={`px-2.5 py-1 transition-colors ${
                    language === 'en'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                }`}
            >
                EN
            </button>
            <button
                type="button"
                onClick={() => handleChange('bn')}
                className={`px-2.5 py-1 transition-colors ${
                    language === 'bn'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                }`}
            >
                বাংলা
            </button>
        </div>
    );
}

