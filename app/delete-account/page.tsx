import React from 'react';
import Link from 'next/link';

export default function DeleteAccount() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-red-600">Request Account Deletion</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <p className="mb-6 text-gray-700">
                    We maintain your data privacy and give you full control over your personal information.
                    If you wish to delete your account and all associated data, you may submit a request below.
                </p>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-2">Manual Deletion Request</h3>
                    <p className="text-gray-600 mb-4">
                        Please send an email to our support team with the subject line <strong>"DELETE ACCOUNT"</strong>.
                        Ensure you send the email from the address associated with your account.
                    </p>
                    <a
                        href="mailto:ultrotech1236@gmail.com?subject=DELETE ACCOUNT"
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        Send Deletion Request
                    </a>
                </div>

                <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
                    <p className="font-semibold mb-1">What happens next?</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Our team will verify your identity.</li>
                        <li>Your account and personal data will be permanently deleted within 30 days.</li>
                        <li>You will receive a confirmation email once the process is complete.</li>
                    </ul>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link href="/" className="text-blue-600 hover:underline">
                    &larr; Return to Home
                </Link>
            </div>
        </div>
    );
}
