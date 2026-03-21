const fs = require('fs');
const path = require('path');
const dir = 'lib/posts';
const files = fs.readdirSync(dir);
const slugs = [];
files.forEach(f => {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    const matches = content.match(/slug:\s*["']([^"']+)["']/g);
    if (matches) matches.forEach(m => {
        const s = m.match(/["']([^"']+)["']/)[1];
        slugs.push(s);
    });
});
console.log(slugs.join('\n'));
