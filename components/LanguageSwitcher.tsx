'use client';

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { blogPosts } from '../lib/blogData';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguageChange = (newLang: 'en' | 'ko' | 'ja' | 'es') => {
        setLanguage(newLang);

        // 블로그 상세 페이지인 경우 매칭되는 번역글의 URL로 강제 이동
        if (pathname && pathname.startsWith('/blog/')) {
            const currentSlug = pathname.replace('/blog/', '');
            if (currentSlug) {
                const currentPost = blogPosts.find(p => p.slug === currentSlug);
                if (currentPost) {
                    const targetPost = blogPosts.find(
                        p => p.translationGroup === currentPost.translationGroup && p.language === newLang
                    );
                    if (targetPost) {
                        router.push(`/blog/${targetPost.slug}`);
                    }
                }
            }
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'ko' | 'ja' | 'es')}
                className="bg-transparent border-none outline-none font-medium cursor-pointer text-gray-700 hover:text-blue-600 transition-colors"
            >
                <option value="en">English (EN)</option>
                <option value="ko">한국어 (KO)</option>
                <option value="ja">日本語 (JA)</option>
                <option value="es">Español (ES)</option>
            </select>
        </div>
    );
}
