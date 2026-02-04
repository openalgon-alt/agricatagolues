const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, 'src/data/questions.json');
const answersPath = path.join(__dirname, 'extracted_answers.txt');

if (!fs.existsSync(questionsPath) || !fs.existsSync(answersPath)) {
    console.error('Files not found');
    process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const answersText = fs.readFileSync(answersPath, 'utf8').split('\n');

// Map A->0, B->1, C->2, D->3
const charMap = {
    'A': 0, 'a': 0,
    'B': 1, 'b': 1,
    'C': 2, 'c': 2,
    'D': 3, 'd': 3
};

// Answers start from line 2 (index 1) in the text file
// Line 1 is header
let updatedCount = 0;

questions.forEach(q => {
    // The line number in file corresponds to q.id + 1
    // So array index is q.id
    // Wait, let's look at the file again.
    // Line 1: Header
    // Line 2: B (Answer for Q1)
    // So distinct answer for Q(id) is at answersText[id] ??
    // arrays are 0-indexed.
    // answersText[0] is Header.
    // answersText[1] is Answer for Q1.
    // So yes, answersText[q.id] seems correct if id starts at 1.

    const answerLine = answersText[q.id];
    if (answerLine) {
        const char = answerLine.trim().charAt(0);
        if (charMap.hasOwnProperty(char)) {
            q.correctOptionIndex = charMap[char];
            // Verify
            if (q.options && q.options[q.correctOptionIndex]) {
                // console.log(`Q${q.id}: ${char} -> ${q.options[q.correctOptionIndex]}`);
            } else {
                console.warn(`Warning: Q${q.id} Answer ${char} index out of bounds`);
            }
            updatedCount++;
        }
    }
});

fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));
console.log(`Updated ${updatedCount} questions with answers.`);
