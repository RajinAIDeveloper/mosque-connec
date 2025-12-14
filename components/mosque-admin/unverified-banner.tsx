'use client';

import { AlertCircle } from 'lucide-react';

export function UnverifiedBanner() {
    return (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        Mosque Pending Verification
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                        Your mosque is currently under review by our super admin team. While your account is pending verification,
                        you can view this dashboard but cannot make any changes or updates. You will be notified once your mosque is verified.
                    </p>
                </div>
            </div>
        </div>
    );
}
