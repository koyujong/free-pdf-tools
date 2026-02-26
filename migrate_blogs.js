const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'app/blog');
const outDir = path.join(__dirname, 'lib', 'posts');

if (!fs.existsSync(path.join(__dirname, 'lib'))) fs.mkdirSync(path.join(__dirname, 'lib'));
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

const folders = fs.readdirSync(blogDir).filter(f => fs.statSync(path.join(blogDir, f)).isDirectory());

let blogDataExports = [];

folders.forEach((folder, idx) => {
    let postNum = idx + 1;
    let pagePath = path.join(blogDir, folder, 'page.tsx');
    let contentPath = path.join(blogDir, folder, 'content.tsx');
    
    if (!fs.existsSync(pagePath) || !fs.existsSync(contentPath)) return;

    let pageStr = fs.readFileSync(pagePath, 'utf8');
    let contentStr = fs.readFileSync(contentPath, 'utf8');
    
    // Extract Metadata from page.tsx using regex
    let titleMatch = pageStr.match(/title:\s*['"](.+?)['"]/);
    let descMatch = pageStr.match(/description:\s*['"](.+?)['"]/);
    let keywordsMatch = pageStr.match(/keywords:\s*(\[.+?\])/);
    
    let titleEn = titleMatch ? titleMatch[1].replace(/"/g, '\\"') : '';
    let descEn = descMatch ? descMatch[1].replace(/"/g, '\\"') : '';
    let keywordsEn = keywordsMatch ? keywordsMatch[1].replace(/'/g, '"') : '[]';
    
    let importsMatch = contentStr.match(/(import .+?;)/g);
    let imports = importsMatch ? importsMatch.join('\n') : '';
    // Remove BlogContentParams import
    imports = imports.replace(/import \{ BlogContentParams \} .+?;/g, '');
    
    // Extract the rest of the file after the imports
    let contentBody = contentStr.replace(/(import .+?;)/g, '').trim();
    
    // Replace "export const postXContent: BlogContentParams = {" with "const contentData = {"
    let newContentStr = contentBody.replace(/export const post\d+Content\s*:\s*BlogContentParams\s*=\s*\{/, 'const contentData = {');
    
    let outContent = `
import { BlogPost } from '../blogData';
${imports}

${newContentStr}

export const post${postNum}: BlogPost = {
    slug: "${folder}",
    language: "en",
    translationGroup: "post${postNum}",
    title: "${titleEn}",
    description: "${descEn}",
    date: "2026-02-26",
    category: "PDF Tools",
    keywords: ${keywordsEn},
    content: contentData.content.en,
    cta: contentData.cta.en
};

export const post${postNum}_ko: BlogPost = {
    slug: "ko-${folder}",
    language: "ko",
    translationGroup: "post${postNum}",
    title: "${titleEn} (Korean)",
    description: "${descEn} (Korean)",
    date: "2026-02-26",
    category: "PDF Tools",
    keywords: ${keywordsEn},
    content: contentData.content.ko,
    cta: contentData.cta.ko
};

export const post${postNum}_ja: BlogPost = {
    slug: "ja-${folder}",
    language: "ja",
    translationGroup: "post${postNum}",
    title: "${titleEn} (Japanese)",
    description: "${descEn} (Japanese)",
    date: "2026-02-26",
    category: "PDF Tools",
    keywords: ${keywordsEn},
    content: contentData.content.ja,
    cta: contentData.cta.ja
};

export const post${postNum}_es: BlogPost = {
    slug: "es-${folder}",
    language: "es",
    translationGroup: "post${postNum}",
    title: "${titleEn} (Spanish)",
    description: "${descEn} (Spanish)",
    date: "2026-02-26",
    category: "PDF Tools",
    keywords: ${keywordsEn},
    content: contentData.content.es,
    cta: contentData.cta.es
};
`;
    fs.writeFileSync(path.join(outDir, `post${postNum}.tsx`), outContent);
    blogDataExports.push(postNum);
});

let blogDataStr = `
import React from 'react';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  content: React.ReactNode;
  cta?: { title: string; desc: string; btn: string };
  keywords: string[];
  language: string;
  translationGroup: string;
}

${blogDataExports.map(n => `import { post${n}, post${n}_ko, post${n}_ja, post${n}_es } from './posts/post${n}';`).join('\n')}

export const blogPosts: BlogPost[] = [
  // English
  ${blogDataExports.map(n => `post${n}`).join(', ')},
  // Korean
  ${blogDataExports.map(n => `post${n}_ko`).join(', ')},
  // Japanese
  ${blogDataExports.map(n => `post${n}_ja`).join(', ')},
  // Spanish
  ${blogDataExports.map(n => `post${n}_es`).join(', ')},
];
`;
fs.writeFileSync(path.join(__dirname, 'lib', 'blogData.tsx'), blogDataStr);

console.log('Migration completed successfully.');
