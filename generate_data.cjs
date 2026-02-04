const fs = require('fs');
const path = require('path');

const extractedTextPath = path.join(__dirname, 'extracted_text.txt');
const docXmlPath = path.join(__dirname, 'temp_extract_docx/extracted/word/document.xml');
const relsXmlPath = path.join(__dirname, 'temp_extract_docx/extracted/word/_rels/document.xml.rels');
const mediaDir = path.join(__dirname, 'temp_extract_docx/extracted/word/media');
const outputDir = path.join(__dirname, 'public/mock_images');
const jsonPath = path.join(__dirname, 'src/data/questions.json');

// Ensure output dir
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(path.dirname(jsonPath))) fs.mkdirSync(path.dirname(jsonPath), { recursive: true });

// --- 1. Map Images ---
const relsContent = fs.readFileSync(relsXmlPath, 'utf8');
const relMap = {};
let match;
const relRegex = /<Relationship Id="(rId\d+)"[^>]*Target="([^"]+)"/g;
while ((match = relRegex.exec(relsContent)) !== null) {
    relMap[match[1]] = match[2];
}

const docContent = fs.readFileSync(docXmlPath, 'utf8');
const paragraphs = docContent.split('<w:p ');

let currentQId = 0;
const imageMapping = {}; // { qId: ['media/image1.jpeg'] }

paragraphs.forEach((p) => {
    const textMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    const text = textMatches ? textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';

    // Check for "1)"
    const qMatch = text.trim().match(/^(\d+)\)\s*$/);
    if (qMatch) {
        currentQId = parseInt(qMatch[1]);
    }

    const blipMatches = p.match(/r:embed="(rId\d+)"/g) || [];
    const vMatches = p.match(/v:imagedata[^>]*r:id="(rId\d+)"/g) || [];
    const rIds = [...blipMatches, ...vMatches].map(m => m.match(/rId\d+/)[0]);

    if (rIds.length > 0 && currentQId > 0) {
        if (!imageMapping[currentQId]) imageMapping[currentQId] = [];
        rIds.forEach(rid => {
            const target = relMap[rid];
            if (target) imageMapping[currentQId].push(target);
        });
    }
});

// --- 2. Parse Text to Questions ---
const textLines = fs.readFileSync(extractedTextPath, 'utf8').split('\n').map(l => l.trim()).filter(l => l);
const questions = [];
let currentQuestion = null;

textLines.forEach(line => {
    const qLabelMatch = line.match(/^(\d+)\)\s*(.*)/);
    if (qLabelMatch) {
        if (currentQuestion) questions.push(currentQuestion);

        const id = parseInt(qLabelMatch[1]);
        const restText = qLabelMatch[2];

        currentQuestion = {
            id: id,
            question: restText || "Identify the specimen:",
            options: [],
            image: null
        };
    } else if (currentQuestion) {
        // It's an option
        // Clean up common OCR artifacts or bullet points?
        // simple push
        // Check if line is "Identify the specimens:" - ignore
        if (line.toLowerCase().includes('identify the specimens')) return;

        currentQuestion.options.push(line);
    }
});
if (currentQuestion) questions.push(currentQuestion);

// --- 3. Merge and Copy Images ---
questions.forEach(q => {
    const imgs = imageMapping[q.id];
    if (imgs && imgs.length > 0) {
        // Take first image
        const originalPath = imgs[0]; // "media/image1.jpeg"
        const filename = path.basename(originalPath); // "image1.jpeg"
        const ext = path.extname(filename);
        const newFilename = `q${q.id}${ext}`;

        // Copy
        const src = path.join(__dirname, 'temp_extract_docx/extracted/word', originalPath);
        const dest = path.join(outputDir, newFilename);

        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            q.image = `/mock_images/${newFilename}`;
        }
    }
});

// Post-processing options
// Some lines might be "Both a and b" -> keep as option.
// Some questions might have split lines.
// But looking at extracted_text, it looks clean enough.

fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2));
console.log(`Generated ${questions.length} questions.`);
