import { MetadataRoute } from 'next';

const DOMAIN = 'https://pw.4kdrivewalk.com'; // 현재 적용된 활성 도메인

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
            },
            {
                // 네이버 봇 명시적 허용 (크롤링 에러 방지용)
                userAgent: 'Yeti',
                allow: '/',
            },
            {
                // 구글 봇 명시적 허용
                userAgent: 'Googlebot',
                allow: '/',
            }
        ],
        sitemap: `${DOMAIN}/sitemap.xml`,
    };
}
