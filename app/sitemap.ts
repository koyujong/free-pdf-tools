import { MetadataRoute } from 'next';
import { blogPosts, BlogPost } from '../lib/blogData';

const DOMAIN = 'https://freepdf.4kdrivewalk.com'; // 현재 적용된 활성 도메인

const staticRoutes = [
    '',
    '/merge',
    '/split',
    '/rotate',
    '/img2pdf',
    '/protect',
    '/organize',
    '/pdf2img',
    '/watermark',
    '/unlock',
    '/pagenumber',
    '/blog',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const currentDate = new Date().toISOString().split('T')[0];

    // 1. 기본 정적 라우트
    const routesMap = staticRoutes.map((route) => ({
        url: `${DOMAIN}${route}`,
        lastModified: currentDate,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. 다국어 블로그 포스트 라우트 (hreflang 적용)
    // 그룹별 묶기
    const translationGroups = new Set(blogPosts.map((p: BlogPost) => p.translationGroup));
    const blogMap: MetadataRoute.Sitemap = [];

    translationGroups.forEach((groupId) => {
        const translations = blogPosts.filter((p: BlogPost) => p.translationGroup === groupId);
        
        // 해당 그룹의 다국어 매핑 생성
        const languages: Record<string, string> = {};
        translations.forEach((t: BlogPost) => {
            languages[t.language] = `${DOMAIN}/blog/${t.slug}`;
        });
        
        // x-default 설정 (영문 기본)
        const enPost = translations.find((t: BlogPost) => t.language === 'en');
        if (enPost) {
            languages['x-default'] = `${DOMAIN}/blog/${enPost.slug}`;
        } else if (translations.length > 0) {
            languages['x-default'] = `${DOMAIN}/blog/${translations[0].slug}`;
        }

        // 개별 포스트마다 사이트맵 엔트리 생성
        translations.forEach((post: BlogPost) => {
            blogMap.push({
                url: `${DOMAIN}/blog/${post.slug}`,
                lastModified: new Date(post.date).toISOString().split('T')[0],
                changeFrequency: 'weekly',
                priority: 0.7,
                alternates: {
                    languages,
                },
            });
        });
    });

    return [...routesMap, ...blogMap] as MetadataRoute.Sitemap;
}
