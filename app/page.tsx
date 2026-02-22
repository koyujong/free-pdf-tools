'use client';

import Link from 'next/link';
import { Layers, Scissors, RotateCw, Image as ImageIcon, Lock, LayoutGrid, FileImage, Stamp, Unlock, Hash } from 'lucide-react';
import AdUnit from '../components/AdUnit';
import AdPlaceholder from '../components/AdPlaceholder';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
    const { t } = useLanguage();

    // 언어팩 기반 동적 메뉴 데이터 구성
    const features = [
        {
            title: t.card_merge_title,
            description: t.card_merge_desc,
            icon: Layers,
            href: '/merge',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            title: t.card_split_title,
            description: t.card_split_desc,
            icon: Scissors,
            href: '/split',
            color: 'text-rose-500',
            bg: 'bg-rose-50',
        },
        {
            title: t.card_rotate_title,
            description: t.card_rotate_desc,
            icon: RotateCw,
            href: '/rotate',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
        },
        {
            title: t.card_img_title,
            description: t.card_img_desc,
            icon: ImageIcon,
            href: '/img2pdf',
            color: 'text-violet-500',
            bg: 'bg-violet-50',
        },
        {
            title: t.card_protect_title || 'Protect PDF',
            description: t.card_protect_desc || 'Secure your PDF with a password.',
            icon: Lock,
            href: '/protect',
            color: 'text-orange-500',
            bg: 'bg-orange-50',
        },
        {
            title: t.card_organize_title || 'Organize PDF',
            description: t.card_organize_desc || 'Sort, delete, and rearrange PDF pages exactly how you want.',
            icon: LayoutGrid,
            href: '/organize',
            color: 'text-teal-500',
            bg: 'bg-teal-50',
        },
        {
            title: t.pdf2img_title || 'PDF to Image',
            description: t.pdf2img_subtitle || 'Extract images from your PDF.',
            icon: FileImage,
            href: '/pdf2img',
            color: 'text-pink-500',
            bg: 'bg-pink-50',
        },
        {
            title: t.watermark_title || 'Watermark',
            description: t.watermark_subtitle || 'Add text or images to your PDF.',
            icon: Stamp,
            href: '/watermark',
            color: 'text-cyan-500',
            bg: 'bg-cyan-50',
        },
        {
            title: t.unlock_title || 'Unlock PDF',
            description: t.unlock_subtitle || 'Remove password from your PDF.',
            icon: Unlock,
            href: '/unlock',
            color: 'text-red-500',
            bg: 'bg-red-50',
        },
        {
            title: t.pagenumber_title || 'Page Number',
            description: t.pagenumber_subtitle || 'Add page numbers to your PDF.',
            icon: Hash,
            href: '/pagenumber',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 pt-16 mt-4">
            {/* 상단 (Top) 광고 */}
            <AdUnit slotId="7932738282" className="mb-12" />

            {/* 타이틀 영역 */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                    {t.home_title_1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t.home_title_highlight}</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {t.home_subtitle}
                </p>
            </div>

            {/* 중단 (Mid) 광고 */}
            <AdUnit slotId="2297268227" className="mb-16" />

            {/* 기능별 카드 메뉴 격자 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                        <Link
                            key={idx}
                            href={feature.href}
                            className="group flex flex-col p-8 bg-white rounded-3xl xl:rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all cursor-pointer transform hover:-translate-y-1"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{feature.title}</h2>
                            <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
                        </Link>
                    );
                })}
            </div>

            {/* 하단 (Bottom) 광고 */}
            <AdUnit slotId="8654793019" className="mt-12" />
        </div>
    );
}
