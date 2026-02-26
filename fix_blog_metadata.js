const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'lib', 'posts');

for (let i = 1; i <= 10; i++) {
    const filePath = path.join(postsDir, `post${i}.tsx`);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    const langs = ['en', 'ko', 'ja', 'es'];
    
    // Extract titles and descriptions from inside the file content using regex
    // We basically look for the h1 and the text-xl p tags inside each language block.
    // It's a bit tricky to parse JSX with regex, but we can do it because the format is very predictable.

    for (const lang of langs) {
        // Find the language start
        const langStartRegex = new RegExp(`${lang}:\\s*\\([\\s\\S]*?<header`, 'g');
        const matchStart = langStartRegex.exec(content);
        if (!matchStart) continue;

        const startIndex = matchStart.index;
        // Search for h1 and p within the next 2000 characters
        const headerBlock = content.substring(startIndex, startIndex + 2000);
        
        const h1Match = headerBlock.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        let extractedTitle = "";
        if (h1Match) {
            extractedTitle = h1Match[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        }

        const pMatch = headerBlock.match(/<p className="text-xl text-gray-600">([\s\S]*?)<\/p>/);
        let extractedDesc = "";
        if (pMatch) {
            extractedDesc = pMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        }

        if (extractedTitle && extractedDesc) {
            // Escape quotes inside title and desc for JS string literal
            let safeTitle = extractedTitle.replace(/"/g, '\\"');
            let safeDesc = extractedDesc.replace(/"/g, '\\"');

            // Find the export const postN_lang: BlogPost = { block
            const exportPrefix = lang === 'en' ? `export const post${i}:` : `export const post${i}_${lang}:`;
            const exportRegex = new RegExp(`(${exportPrefix}[\\s\\S]*?title:\\s*)"([^"]*)"([\\s\\S]*?description:\\s*)"([^"]*)"`);
            
            content = content.replace(exportRegex, (match, p1, oldTitle, p3, oldDesc) => {
                return `${p1}"${safeTitle}"${p3}"${safeDesc}"`;
            });
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated metadata for post${i}`);
}

console.log('All metadata fixed successfully.');
