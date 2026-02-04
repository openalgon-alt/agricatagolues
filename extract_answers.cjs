const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'temp_answers_extract/word/document.xml');

console.log('Reading from:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('File not found!');
    process.exit(1);
}

try {
    const xml = fs.readFileSync(filePath, 'utf8');
    const paragraphs = xml.split('<w:p ');

    const text = paragraphs.map(p => {
        const matches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
        if (!matches) return '';
        return matches.map(m => m.replace(/<[^>]+>/g, '')).join('');
    }).filter(t => t.trim().length > 0).join('\n');

    fs.writeFileSync('extracted_answers.txt', text);
    console.log('Dumped text to extracted_answers.txt');
} catch (e) {
    console.error(e);
}
