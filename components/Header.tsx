'use client';

import React from 'react';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

export default function Header() {
    const { t } = useLanguage();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    {t.header_logo || '📄 100% Free PDF Tools'}
                </Link>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
                        <Link href="/" className="hover:text-blue-600 transition-colors">{t.gnb_home || 'Home'}</Link>
                        <Link href="/blog" className="hover:text-blue-600 transition-colors">{t.gnb_blog || 'Blog'}</Link>
                    </nav>
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
