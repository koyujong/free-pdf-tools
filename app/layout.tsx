import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Link from 'next/link';

// [i18n 적용]
import { LanguageProvider } from '../contexts/LanguageContext';
import Header from '../components/Header';

export const metadata: Metadata = {
    title: 'Offline-safe PDF Tools (No Upload) | Fast & Secure',
    description: '100% Free Client-side PDF Tools. Merge, Split, Rotate, Image to PDF.',
    keywords: ['Free PDF Merge', 'Split PDF', 'Rotate PDF', 'Image to PDF', 'Client side PDF tool'],
    verification: {
        google: '47z3uMVzsCyw66vTGaSLLtCKy3vebHH5QOU4H3yCDR8',
        other: {
            'naver-site-verification': '3823a46454a8b260a4ef3f0d3c61d1e4b6bba8e1',
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3488637908196788"
                    crossOrigin="anonymous"
                ></script>
            </head>
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
