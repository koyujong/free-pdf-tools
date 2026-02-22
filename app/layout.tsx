import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Link from 'next/link';

// [i18n 적용]
import { LanguageProvider } from '../contexts/LanguageContext';
import Header from '../components/Header';

export const metadata: Metadata = {
    title: 'Free PDF Tools | Fast & Secure',
    description: '100% Free Client-side PDF Tools. Merge, Split, Rotate, Image to PDF.',
    keywords: ['Free PDF Merge', 'Split PDF', 'Rotate PDF', 'Image to PDF', 'Client side PDF tool'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <LanguageProvider>
                    {/* 상단 GNB 네비게이션 */}
                    <Header />

                    {/* 페이지 본문 */}
                    <main className="min-h-screen pb-12">
                        {children}
                    </main>

                    {/* 알림을 띄우기 위한 Toast Container */}
                    <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
                </LanguageProvider>
            </body>
        </html>
    );
}
