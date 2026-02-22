'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface BlogContentParams {
    content: {
        en: React.ReactNode;
        ko: React.ReactNode;
        ja: React.ReactNode;
        es: React.ReactNode;
    };
    cta: {
        en: { title: string; desc: string; btn: string };
        ko: { title: string; desc: string; btn: string };
        ja: { title: string; desc: string; btn: string };
        es: { title: string; desc: string; btn: string };
    };
}

export default function BlogPostClient({ content, cta }: BlogContentParams) {
    const { language, t } = useLanguage();

    // Fallback to english if language resolves weirdly
    const activeContent = content[language] || content.en;
    const activeCta = cta[language] || cta.en;

    return (
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-24">
            <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.blog_back_home || 'Back to Blog'}
            </Link>

            {activeContent}

            {/* 개별 글마다 내용이 다른 액션 유도 버튼(CTA) 영역 */}
            <div className="mt-16 flex justify-center bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{activeCta.title}</h3>
                    <p className="text-gray-600 mb-8">{activeCta.desc}</p>
                    <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-transform hover:-translate-y-1 shadow-lg">
                        {activeCta.btn}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
