'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdUnit from './AdUnit';

const blogPosts = [
    {
        slug: 'merge-multiple-pdf-files-without-acrobat',
        titleEn: 'How to Merge Multiple PDF Files Into One Without Acrobat',
        descEn: 'Escape expensive subscriptions and learn secure, client-side methods to combine documents free.'
    },
    {
        slug: 'free-online-pdf-splitter-extract-pages',
        titleEn: 'Free Online PDF Splitter Extract Pages Without Uploading',
        descEn: 'Discover why offline-in-browser processing is the safest way to extract pages from confidential files.'
    },
    {
        slug: 'convert-multiple-iphone-photos-to-pdf',
        titleEn: 'Convert Multiple iPhone Photos to PDF Document Free',
        descEn: 'Compiling dozens of images into a pristine, high-resolution PDF document right from your phone.'
    },
    {
        slug: 'rotate-and-save-pdf-file-permanently',
        titleEn: 'How to Rotate and Save a PDF File Permanently Online',
        descEn: 'Stop relying on temporary view changes. Fix structural orientation metadata permanently.'
    },
    {
        slug: 'combine-pdf-files-locally-in-browser',
        titleEn: 'Best Way to Combine PDF Files Locally in Browser',
        descEn: 'Harness WebAssembly to parse and generate massive binary data structures locally.'
    },
    {
        slug: 'separate-one-page-from-pdf-document',
        titleEn: 'Separate One Page from PDF Document Free Online',
        descEn: 'Perform surgical extraction of crucial data points without risking privacy leaks or uploading files.'
    },
    {
        slug: 'merge-pdf-files-over-100mb-free',
        titleEn: 'Merge PDF Files Over 100MB Free No Registration',
        descEn: 'Bypass standard online limitations. Use your own RAM to merge gigantic PDF files securely.'
    },
    {
        slug: 'turn-jpg-images-into-one-pdf',
        titleEn: 'Turn JPG Images Into One PDF Without losing Quality',
        descEn: 'Avoid aggressive cloud compression. Preserve extreme pixel density by mapping vectors directly.'
    },
    {
        slug: 'secure-browser-based-pdf-merge-tool',
        titleEn: 'Secure Browser Based PDF Merge Tool for Sensitive Documents',
        descEn: 'The corporate imperative for zero-trust computing regarding financial and medical PII transfers.'
    },
    {
        slug: 'split-large-pdf-by-page-numbers',
        titleEn: 'How to Split a Large PDF by Page Numbers Easily',
        descEn: 'Dodge the clunky "print-to-pdf" hack. Utilize pure syntax-driven extraction for immense manuals.'
    }
];

export default function BlogIndexUI() {
    const { t } = useLanguage();

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
                {blogPosts.map((post, index) => (
                    <Link key={index} href={`/blog/${post.slug}`} className="group block bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <p className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                            {t.blog_article || 'Article'} {index + 1}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.titleEn}
                        </h2>
                        <p className="text-gray-600 mb-6 line-clamp-3">
                            {post.descEn}
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
