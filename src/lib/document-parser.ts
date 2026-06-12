import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set up PDF.js worker from CDN to avoid bundle size issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export interface ParsedQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
}

/**
 * Extracts raw text from a PDF file.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

/**
 * Extracts raw text from a Word (.docx) file.
 */
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Robust regex-based parser that handles typical MCQ document structures.
 */
export function parseMCQFromText(text: string): ParsedQuestion[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const questions: ParsedQuestion[] = [];
  let currentQuestion: ParsedQuestion | null = null;
  let currentSection: "question" | "a" | "b" | "c" | "d" | "explanation" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect question start: e.g. "1. What is...", "Q2: Which...", "10) Crop physiology..."
    const isQuestionStart = /^(?:Q|q)?\d+[\.\)\s\-]+/.test(line);

    // Detect options
    const isOptionA = /^(?:\(?[Aa]\)|[Aa][\.\)\s\-]+|[Aa]\s+)/.test(line);
    const isOptionB = /^(?:\(?[Bb]\)|[Bb][\.\)\s\-]+|[Bb]\s+)/.test(line);
    const isOptionC = /^(?:\(?[Cc]\)|[Cc][\.\)\s\-]+|[Cc]\s+)/.test(line);
    const isOptionD = /^(?:\(?[Dd]\)|[Dd][\.\)\s\-]+|[Dd]\s+)/.test(line);

    // Detect correct answer (updated to support closing chars like dots, dashes, parentheses or spaces)
    const isAnswer =
      /^(?:[Aa]nswer|[Aa]ns|[Cc]orrect|[Oo]ption|[Kk]ey)[\.\s\-\:]*\(?([A-Da-d])\)?(?:[\.\s\-\)]|$)/.exec(
        line,
      );

    // Detect explanation: e.g., "Explanation: This is because..."
    const isExplanation = /^(?:[Ee]xplanation|[Ee]xp)[\.\s\-\:]+(.*)/i.exec(line);

    if (isQuestionStart) {
      if (currentQuestion && isValidQuestion(currentQuestion)) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        questionText: line.replace(/^(?:Q|q)?\d+[\.\)\s\-]+/, "").trim(),
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        explanation: "",
      };
      currentSection = "question";
    } else if (isOptionA && currentQuestion) {
      currentQuestion.optionA = line.replace(/^(?:\(?[Aa]\)|[Aa][\.\)\s\-]+|[Aa]\s+)/, "").trim();
      currentSection = "a";
    } else if (isOptionB && currentQuestion) {
      currentQuestion.optionB = line.replace(/^(?:\(?[Bb]\)|[Bb][\.\)\s\-]+|[Bb]\s+)/, "").trim();
      currentSection = "b";
    } else if (isOptionC && currentQuestion) {
      currentQuestion.optionC = line.replace(/^(?:\(?[Cc]\)|[Cc][\.\)\s\-]+|[Cc]\s+)/, "").trim();
      currentSection = "c";
    } else if (isOptionD && currentQuestion) {
      currentQuestion.optionD = line.replace(/^(?:\(?[Dd]\)|[Dd][\.\)\s\-]+|[Dd]\s+)/, "").trim();
      currentSection = "d";
    } else if (isAnswer && currentQuestion) {
      currentQuestion.correctOption = isAnswer[1].toUpperCase() as "A" | "B" | "C" | "D";

      // If there is extra text on the answer line after the correct option, extract it as the explanation
      const matchIndex = line.indexOf(isAnswer[0]);
      const remainingText = line.substring(matchIndex + isAnswer[0].length).trim();
      const cleanExplanation = remainingText.replace(/^[\.\-\s\)]+/, "").trim();
      if (cleanExplanation) {
        currentQuestion.explanation = cleanExplanation;
        currentSection = "explanation";
      } else {
        currentSection = null;
      }
    } else if (isExplanation && currentQuestion) {
      currentQuestion.explanation = isExplanation[1].trim();
      currentSection = "explanation";
    } else if (currentQuestion) {
      // Append text to the active section if we have multi-line content
      if (currentSection === "question") {
        currentQuestion.questionText += " " + line;
      } else if (currentSection === "a") {
        currentQuestion.optionA += " " + line;
      } else if (currentSection === "b") {
        currentQuestion.optionB += " " + line;
      } else if (currentSection === "c") {
        currentQuestion.optionC += " " + line;
      } else if (currentSection === "d") {
        currentQuestion.optionD += " " + line;
      } else if (currentSection === "explanation") {
        currentQuestion.explanation += " " + line;
      }
    }
  }

  // Add the last question if it's valid
  if (currentQuestion && isValidQuestion(currentQuestion)) {
    questions.push(currentQuestion);
  }

  return questions;
}

function isValidQuestion(q: ParsedQuestion): boolean {
  return Boolean(
    q.questionText.trim() &&
    q.optionA.trim() &&
    q.optionB.trim() &&
    q.optionC.trim() &&
    q.optionD.trim() &&
    ["A", "B", "C", "D"].includes(q.correctOption),
  );
}
