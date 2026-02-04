const fs = require('fs');
const path = require('path');

const docXmlPath = path.join(__dirname, 'temp_extract_docx/extracted/word/document.xml');
const relsXmlPath = path.join(__dirname, 'temp_extract_docx/extracted/word/_rels/document.xml.rels');

if (!fs.existsSync(docXmlPath) || !fs.existsSync(relsXmlPath)) {
    console.error('Files not found');
    process.exit(1);
}

// 1. Parse Rels
const relsContent = fs.readFileSync(relsXmlPath, 'utf8');
const relMap = {};
const relRegex = /<Relationship Id="(rId\d+)"[^>]*Target="([^"]+)"/g;
let match;
while ((match = relRegex.exec(relsContent)) !== null) {
    relMap[match[1]] = match[2];
}

// 2. Parse Document XML for order of Questions (Text: "1)") and Images (blip)
const docContent = fs.readFileSync(docXmlPath, 'utf8');

// We split by Paragraphs to keep context
const paragraphs = docContent.split('<w:p ');

let currentQuestion = 0;
const questionMap = [];

paragraphs.forEach((p, idx) => {
    // Check for Question Number like "1)", "25)", etc. in text
    // Extract text first
    const textMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    const text = textMatches ? textMatches.map(m => m.replace(/<[^>]+>/g, '')).join('') : '';

    // Regex for "1)", "2)"...
    const qMatch = text.trim().match(/^(\d+)\)\s*$/);
    if (qMatch) {
        currentQuestion = parseInt(qMatch[1]);
        if (!questionMap[currentQuestion]) {
            questionMap[currentQuestion] = { images: [] };
        }
    } else {
        // Sometimes "26) " is not exact?
        // Let's assume strict format based on extracted_text.txt
    }

    // Check for Images in this paragraph
    // <a:blip r:embed="rIdX"> or <v:imagedata r:id="rIdX">
    const blipMatches = p.match(/r:embed="(rId\d+)"/g);
    const vMatches = p.match(/v:imagedata[^>]*r:id="(rId\d+)"/g);

    const rIds = [];
    if (blipMatches) rIds.push(...blipMatches.map(m => m.match(/rId\d+/)[0]));
    if (vMatches) rIds.push(...vMatches.map(m => m.match(/rId\d+/)[0]));

    if (rIds.length > 0) {
        // If we haven't seen a question number yet, search BACKWARDS or it belongs to "header" or Q0?
        // However, looking at the extracted text, "Identify the specimens" is line 1.
        // "1)" is line 2.
        // The image might be AFTER "1)".
        // Or BEFORE?
        // Let's assign images to the currentQuestion OR if currentQuestion is 0, maybe it belongs to Q1 if Q1 is next?
        // Actually, usually headers are Q0.
        // Let's store them associated with the LAST seen question number.
        if (currentQuestion >= 0) {
            if (!questionMap[currentQuestion]) questionMap[currentQuestion] = { images: [] };
            questionMap[currentQuestion].images.push(...rIds);
        }
    }
});

// 3. Output
const results = [];
for (let i = 1; i < questionMap.length; i++) {
    const q = questionMap[i];
    const imgs = q ? q.images.map(rid => relMap[rid]) : [];
    results.push({ id: i, images: imgs });
}

console.log(JSON.stringify(results, null, 2));
