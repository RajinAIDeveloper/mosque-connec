'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { t } from '@/lib/i18n';

type FilterProps = {
    womensArea: boolean;
    madhhab: string;
    myMosques: boolean;
    onWomensAreaChange: (checked: boolean) => void;
    onMadhhabChange: (value: string) => void;
    onMyMosquesChange: (checked: boolean) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    showMyMosquesFilter: boolean;
};

export function MosquesFilter({
    womensArea,
    madhhab,
    myMosques,
    onWomensAreaChange,
    onMadhhabChange,
    onMyMosquesChange,
    onClearFilters,
    hasActiveFilters,
    showMyMosquesFilter,
}: FilterProps) {
    const language = useUIStore((state) => state.language ?? 'en');
    const lang = language;

    return (
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <h3 className="font-semibold text-sm">
                    {t(lang, 'Filters:')}
                </h3>

                {/* My Mosques Filter */}
                {showMyMosquesFilter && (
                    <div className="flex items-center space-x-2 border-r pr-4 mr-2">
                        <Checkbox
                            id="my-mosques"
                            checked={myMosques}
                            onCheckedChange={onMyMosquesChange}
                        />
                        <label
                            htmlFor="my-mosques"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            {t(lang, 'My Mosques')}
                        </label>
                    </div>
                )}

                {/* Women's Prayer Area Filter */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="womens-area"
                        checked={womensArea}
                        onCheckedChange={onWomensAreaChange}
                    />
                    <label
                        htmlFor="womens-area"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        {t(lang, "Women's Prayer Area")}
                    </label>
                </div>

                {/* Madhhab Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="madhhab" className="text-sm font-medium whitespace-nowrap">
                        {t(lang, 'Madhhab:')}
                    </label>
                    <Select value={madhhab} onValueChange={onMadhhabChange}>
                        <SelectTrigger id="madhhab" className="w-[140px]">
                            <SelectValue placeholder={t(lang, 'All')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t(lang, 'All')}</SelectItem>
                            <SelectItem value="hanafi">{t(lang, 'Hanafi')}</SelectItem>
                            <SelectItem value="shafi">{t(lang, "Shafi'i")}</SelectItem>
                            <SelectItem value="maliki">{t(lang, 'Maliki')}</SelectItem>
                            <SelectItem value="hanbali">{t(lang, 'Hanbali')}</SelectItem>
                            <SelectItem value="other">{t(lang, 'Other')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        {t(lang, 'Clear Filters')}
                    </Button>
                )}
            </div>
        </div>
    );
}
