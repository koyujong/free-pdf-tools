import { MetadataRoute } from 'next';

const DOMAIN = 'https://pw.4kdrivewalk.com'; // 현재 적용된 활성 도메인 (이미지 참조)

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

const blogSlugs = [
    'merge-multiple-pdf-files-without-acrobat',
    'free-online-pdf-splitter-extract-pages',
    'convert-multiple-iphone-photos-to-pdf',
    'rotate-and-save-pdf-file-permanently',
    'combine-pdf-files-locally-in-browser',
    'separate-one-page-from-pdf-document',
    'merge-pdf-files-over-100mb-free',
    'turn-jpg-images-into-one-pdf',
    'secure-browser-based-pdf-merge-tool',
    'split-large-pdf-by-page-numbers'
];

export default function sitemap(): MetadataRoute.Sitemap {
    const currentDate = new Date().toISOString().split('T')[0];

    const routesMap = staticRoutes.map((route) => ({
        url: `${DOMAIN}${route}`,
        lastModified: currentDate,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
    }));

    const blogMap = blogSlugs.map((slug) => ({
        url: `${DOMAIN}/blog/${slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    return [...routesMap, ...blogMap] as MetadataRoute.Sitemap;
}
