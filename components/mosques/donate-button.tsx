'use client';

import { Button } from '@/components/ui/button';
import { Heart, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface DonateButtonProps {
    phone: string | null;
    campaignTitle: string;
    mosqueName: string;
}

export function DonateButton({ phone, campaignTitle, mosqueName }: DonateButtonProps) {
    const handleDonate = () => {
        if (!phone) {
            toast.error('No contact number available for this mosque');
            return;
        }

        // Clean phone number for links (remove spaces, dashes, parentheses)
        const cleanPhone = phone.replace(/\D/g, '');

        // Construct WhatsApp message
        const message = encodeURIComponent(
            `Salam! I would like to donate to the campaign "${campaignTitle}" at ${mosqueName}.`
        );

        // Try opening WhatsApp
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

        // Open in new tab
        window.open(whatsappUrl, '_blank');

        // Fallback/Info toast
        toast.info('Opening WhatsApp to contact mosque admin for donation...');
    };

    return (
        <Button className="w-full gap-2" onClick={handleDonate}>
            <Heart className="h-4 w-4" /> Call for Details
        </Button>
    );
}
