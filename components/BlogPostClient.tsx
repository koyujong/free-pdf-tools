'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import AdUnit from './AdUnit';

export interface BlogPostProps {
    content: React.ReactNode;
    cta?: { title: string; desc: string; btn: string };
}

export default function BlogPostClient({ content, cta }: BlogPostProps) {
    const { t } = useLanguage();

    // 비밀번호 생성기와 동일한 본문 중간 광고 레이아웃 (수동 광고 삽입)
    let renderedContent = content;

    if (React.isValidElement(content) && content.type === 'article' && (content.props as any).children) {
        const children = React.Children.toArray((content.props as any).children);
        const newChildren: React.ReactNode[] = [];
        let sectionCount = 0;
        let adInserted = false;

        children.forEach((child, index) => {
            newChildren.push(child);
            // 자식 요소가 section 태그일 때를 카운트
            if (React.isValidElement(child) && child.type === 'section') {
                sectionCount++;
                // 1번째 section이 끝난 후 (비밀번호 생성기의 2번째 h2 시점) 중간 광고 삽입
                if (sectionCount === 1 && !adInserted) {
                    newChildren.push(
                        <div key={`ad-mid-${index}`} className="my-10">
                            <AdUnit slotId="5984397640" />
                        </div>
                    );
                    adInserted = true;
                }
            }
        });
        
        // 원본 태그에 변형된 children만 덮어쓰기
        renderedContent = React.cloneElement(content as React.ReactElement, {}, newChildren);
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-24">
            <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.blog_back_home || 'Back to Blog'}
            </Link>

            {/* 상단 수동 광고 */}
            <div className="mb-10">
                <AdUnit slotId="2692019896" />
            </div>

            {renderedContent}

            {/* 개별 글마다 내용이 다른 액션 유도 버튼(CTA) 영역 */}
            {cta && (
                <div className="mt-16 flex justify-center bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{cta.title}</h3>
                        <p className="text-gray-600 mb-8">{cta.desc}</p>
                        <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-transform hover:-translate-y-1 shadow-lg">
                            {cta.btn}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            )}

            {/* 하단 수동 광고 */}
            <div className="mt-16">
                <AdUnit slotId="4671315974" />
            </div>
        </div>
    );
}
