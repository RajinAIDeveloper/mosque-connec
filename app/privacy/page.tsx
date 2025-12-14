import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">Last Updated: December 2025</p>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p className="mb-4">
                    Mosque Connect ("we," "our," or "us") is committed to protecting your privacy.
                    This Privacy Policy explains how we collect, use, disclosure, and safeguard your information
                    when you use our mobile application and website.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li><strong>Personal Data:</strong> Name, email address, phone number, and profile image when you register.</li>
                    <li><strong>Mosque Data:</strong> Information about the mosques you manage or follow.</li>
                    <li><strong>Location Data:</strong> Approximate location to help you find nearby mosques.</li>
                    <li><strong>Device Data:</strong> IP address, device ID, and operating system for analytics and security.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>Create and manage your account.</li>
                    <li>Facilitate mosque discovery and community engagement.</li>
                    <li>Process donations (via third-party payment processors).</li>
                    <li>Send important notifications about prayer times and events.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
                <p className="mb-4">
                    We implement appropriate technical and organizational measures to maintain the safety of your personal information.
                    However, please be aware that no security measures are perfect or impenetrable.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4">5. Contact Us</h2>
                <p className="mb-4">
                    If you have questions about this privacy policy, please contact us at:
                </p>
                <p className="font-medium text-blue-600">ultrotech1236@gmail.com</p>
            </section>
        </div>
    );
}
