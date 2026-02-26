'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdUnit from './AdUnit';

import { blogPosts as allBlogPosts } from '../lib/blogData';

export default function BlogIndexUI() {
    const { language, t } = useLanguage();
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);
    
    // 현재 선택된 언어와 일치하는 블로그 글만 필터링 (영어 fallback으로 기본 10개 나옴)
    const currentPosts = React.useMemo(() => {
        if (!isClient) return [];
        const filtered = allBlogPosts.filter(post => post.language === language);
        return filtered.length > 0 ? filtered : allBlogPosts.filter(post => post.language === 'en');
    }, [isClient, language]);

    return (
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-24">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.blog_back_home || 'Back to Home'}
            </Link>

            {/* PDF 블로그 상단 */}
            <AdUnit slotId="2692019896" className="mb-12" />

            <article className="prose prose-lg prose-blue max-w-none mb-16">
                <header className="mb-12">
                    <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                        {t.blog_header_title || 'Guides & Tutorials'}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 flex items-center gap-3">
                        <BookOpen className="w-10 h-10 text-blue-600 hidden md:block" />
                        {t.blog_header_desc || 'The Comprehensive Guide to Secure, In-Browser PDF Processing'}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {t.blog_header_sub || 'Discover the fastest, safest methods to manage your documents—ranging from merging large files to splitting, rotating, and image conversions—all without expensive software or privacy-compromising server uploads.'}
                    </p>
                </header>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-blue-600 w-6 h-6" />
                        {t.blog_explore_title || 'Explore Our Resources:'}
                    </h3>
                    <p className="text-gray-700 m-0">
                        {t.blog_explore_desc || 'Below is our complete library of tutorials designed to help you master client-side document manipulation. Each guide provides step-by-step instructions and technical insights into why local processing is the superior choice for your workflow.'}
                    </p>
                </div>
            </article>

            {/* PDF 블로그 중단 */}
            <AdUnit slotId="5984397640" className="mb-12" />

            <div className="grid md:grid-cols-2 gap-6">
                {currentPosts.map((post, index) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                            {t.blog_article || 'Article'} {index + 1}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                        </h2>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                            {post.description}
                        </p>
                        <div className="flex items-center text-sm font-semibold text-blue-600 mt-auto">
                            {t.blog_read_more || 'Read Full Guide'}
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* PDF 블로그 하단 */}
            <AdUnit slotId="4671315974" className="mt-12" />
        </div>
    );
}
