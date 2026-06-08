import { useState } from "react";
import { examDataService } from "@/services/examDataService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, FileText, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const formatAndSortOptionsText = (rawText: string): string => {
    // Check if this matches the "Model Question Paper" format: has "Answer Key" and numbered questions
    const hasAnswerKey = /Answer Key/i.test(rawText);
    const hasNumberedQuestions = /(?:\r?\n|^)\s*\d+\.\s+/i.test(rawText);

    if (hasAnswerKey && hasNumberedQuestions) {
        try {
            const parts = rawText.split(/Answer Key/i);
            const questionsPart = parts[0];
            const answerKeyPart = parts[1] || "";

            // 1. Parse Answer Key to build a map of { qNum: ansLetter }
            const answersMap: { [key: number]: string } = {};
            const lines = answerKeyPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            
            let lastNumber: number | null = null;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (/^\d+$/.test(line)) {
                    lastNumber = parseInt(line);
                } else if (/^[A-D]$/i.test(line) && lastNumber !== null) {
                    answersMap[lastNumber] = line.toUpperCase();
                    lastNumber = null; // Reset
                }
            }

            // 2. Parse Questions & Options
            const qRegex = /(?:\r?\n|^)\s*(\d+)\.\s+/g;
            const qMatches: { qNum: number; index: number; matchLength: number }[] = [];
            let match;
            while ((match = qRegex.exec(questionsPart)) !== null) {
                qMatches.push({
                    qNum: parseInt(match[1]),
                    index: match.index,
                    matchLength: match[0].length
                });
            }

            const formattedBlocks: string[] = [];

            for (let i = 0; i < qMatches.length; i++) {
                const currentQ = qMatches[i];
                const nextIndex = i + 1 < qMatches.length ? qMatches[i + 1].index : questionsPart.length;
                
                const blockText = questionsPart.substring(currentQ.index + currentQ.matchLength, nextIndex).trim();
                
                // Extract options A), B), C), D) within blockText (handles both single-line and multi-line option text)
                const optRegex = /A\)\s*([\s\S]*?)\s*B\)\s*([\s\S]*?)\s*C\)\s*([\s\S]*?)\s*D\)\s*([\s\S]*)$/i;
                const optMatch = blockText.match(optRegex);
                
                if (optMatch) {
                    const optA = optMatch[1].trim();
                    const optB = optMatch[2].trim();
                    const optC = optMatch[3].trim();
                    const optD = optMatch[4].trim();
                    const ansLetter = answersMap[currentQ.qNum] || "A"; // Fallback to A

                    formattedBlocks.push([
                        `A) ${optA}`,
                        `B) ${optB}`,
                        `C) ${optC}`,
                        `D) ${optD}`,
                        `Ans: ${ansLetter}`
                    ].join('\n'));
                }
            }

            if (formattedBlocks.length > 0) {
                return formattedBlocks.join('\n\n');
            }
        } catch (e) {
            console.error("Failed to parse using advanced model question paper parser:", e);
        }
    }

    // Normalize spaces and line breaks
    const text = rawText.replace(/\s+/g, ' ');

    // Find all indexes of A), B), C), D), Ans: (case-insensitive)
    const tokenRegex = /(?:([A-D])\)|(Ans|Answer|Correct\s+Answer)(?:\.|\s|-|:)*)/gi;
    const tokens: { type: string; index: number; length: number }[] = [];
    let tokenMatch;
    
    while ((tokenMatch = tokenRegex.exec(text)) !== null) {
        tokens.push({
            type: tokenMatch[1] ? tokenMatch[1].toUpperCase() : 'ANS',
            index: tokenMatch.index,
            length: tokenMatch[0].length
        });
    }

    if (tokens.length === 0) return rawText;

    const blocks: string[] = [];
    let currentBlockData: { [key: string]: string } = {};
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextTokenIndex = i + 1 < tokens.length ? tokens[i + 1].index : text.length;
        
        // Extract the content between this token and the next token
        const start = token.index + token.length;
        const content = text.substring(start, nextTokenIndex).trim();

        // If the token type already exists in the current block, or if it's 'A' and we already have 'Ans',
        // we should commit the current block and start a new one.
        if (currentBlockData[token.type] !== undefined || (token.type === 'A' && currentBlockData['ANS'])) {
            // Commit block if it has at least some options
            if (Object.keys(currentBlockData).length > 0) {
                blocks.push([
                    `A) ${currentBlockData['A'] || ''}`,
                    `B) ${currentBlockData['B'] || ''}`,
                    `C) ${currentBlockData['C'] || ''}`,
                    `D) ${currentBlockData['D'] || ''}`,
                    `Ans: ${currentBlockData['ANS'] || ''}`
                ].join('\n'));
            }
            currentBlockData = {};
        }

        currentBlockData[token.type] = content;
    }

    // Commit final block
    if (Object.keys(currentBlockData).length > 0) {
        blocks.push([
            `A) ${currentBlockData['A'] || ''}`,
            `B) ${currentBlockData['B'] || ''}`,
            `C) ${currentBlockData['C'] || ''}`,
            `D) ${currentBlockData['D'] || ''}`,
            `Ans: ${currentBlockData['ANS'] || ''}`
        ].join('\n'));
    }

    if (blocks.length > 0) {
        return blocks.join('\n\n');
    }
    
    return rawText;
};

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mockTestId: number | string;
    onSave: () => void;
}

export default function BulkUploadDialog({ open, onOpenChange, mockTestId, onSave }: BulkUploadDialogProps) {
    const [textInput, setTextInput] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [parsedData, setParsedData] = useState<any[] | null>(null);
    const [extracting, setExtracting] = useState(false);

    const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setExtracting(true);
            setErrors([]);
            try {
                let extractedText = "";
                if (file.name.endsWith(".docx")) {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    extractedText = result.value;
                } else if (file.name.endsWith(".pdf")) {
                    const arrayBuffer = await file.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    let fullText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item: any) => item.str)
                            .join(" ");
                        fullText += pageText + "\n";
                    }
                    extractedText = fullText;
                } else {
                    toast.error("Unsupported file format. Please upload a .docx or .pdf file.");
                    setExtracting(false);
                    return;
                }

                if (extractedText.trim()) {
                    const formatted = formatAndSortOptionsText(extractedText);
                    setTextInput(formatted);
                    setParsedData(null); // Reset validation
                    toast.success(`Successfully extracted and formatted text from ${file.name}.`);
                } else {
                    toast.error("Could not extract any text from the document.");
                }
            } catch (error: any) {
                console.error("Error extracting document text:", error);
                setErrors([`Error extracting document text: ${error.message || error}`]);
                toast.error("Failed to extract text from the document.");
            } finally {
                setExtracting(false);
                // Clear the input value so user can upload the same file again if needed
                e.target.value = "";
            }
        }
    };

    const formatTemplate = `A) Oryza sativa
B) Triticum aestivum
C) Zea mays
D) Hordeum vulgare
Ans: A

A) Option 1
B) Option 2
C) Option 3
D) Option 4
Ans: C`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
            setParsedData(null); // Reset validation
        }
    };

    const handleValidate = () => {
        setErrors([]);
        setParsedData(null);
        if (!textInput.trim()) {
            setErrors(["Text input is empty."]);
            return;
        }

        try {
            const formatErrors: string[] = [];
            const parsedBlocks: any[] = [];
            
            // Split by double newline to get blocks
            const blocks = textInput.trim().split(/\n\s*\n/);
            
            blocks.forEach((block, index) => {
                const questionNumber = index + 1;
                const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                if (lines.length < 5) {
                    formatErrors.push(`Block #${questionNumber}: Needs at least 5 lines (4 options + 1 Ans line). Found ${lines.length}.`);
                    return;
                }

                // Parse options
                const options: string[] = [];
                let ansLine = "";
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.match(/^[A-D]\)/i)) {
                        options.push(line.substring(2).trim());
                    } else if (line.toLowerCase().startsWith('ans:')) {
                        ansLine = line.substring(4).trim().toUpperCase();
                    }
                }

                if (options.length < 4) {
                    formatErrors.push(`Block #${questionNumber}: Could not find exactly 4 options starting with A), B), C), D).`);
                    return;
                }
                if (!ansLine) {
                    formatErrors.push(`Block #${questionNumber}: Missing 'Ans: X' line.`);
                    return;
                }

                const correctLetterMap: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
                const correctOptionIndex = correctLetterMap[ansLine];
                
                if (correctOptionIndex === undefined) {
                    formatErrors.push(`Block #${questionNumber}: Invalid answer letter '${ansLine}'. Must be A, B, C, or D.`);
                    return;
                }

                // Match with uploaded image
                let matchedFile: File | null = null;
                // Look for a file named something like "1.png" or "1.jpg"
                const possibleFileNameStart = `${questionNumber}.`;
                const foundFile = selectedFiles.find(f => f.name.startsWith(possibleFileNameStart) || f.name.split('.')[0] === questionNumber.toString());
                
                if (foundFile) {
                    matchedFile = foundFile;
                }

                parsedBlocks.push({
                    question: "Practical Question", // Default text since UI has no question text
                    options,
                    correctOptionIndex,
                    marks: 4,
                    topic: "Practical Specimen",
                    file: matchedFile
                });
            });

            if (formatErrors.length > 0) {
                setErrors(formatErrors);
            } else {
                setParsedData(parsedBlocks);
                toast.success(`Successfully validated ${parsedBlocks.length} questions.`);
            }

        } catch (error: any) {
            setErrors([`Error parsing format: ${error.message}`]);
        }
    };

    const handleUpload = async () => {
        if (!parsedData || parsedData.length === 0) return;
        setLoading(true);

        let successCount = 0;
        let failCount = 0;

        for (const q of parsedData) {
            try {
                let imageUrl = "";
                if (q.file) {
                    imageUrl = await examDataService.uploadImage(q.file);
                }

                await examDataService.saveMockQuestion({
                    mockTestId,
                    question: q.question,
                    options: q.options,
                    correctOptionIndex: q.correctOptionIndex,
                    marks: q.marks || 4,
                    topic: q.topic || "",
                    image: imageUrl
                });
                successCount++;
            } catch (error) {
                console.error("Failed to upload question", q.options[0], error);
                failCount++;
            }
        }

        setLoading(false);
        if (failCount > 0) {
            toast.warning(`Uploaded ${successCount} questions. Failed: ${failCount}`);
        } else {
            toast.success(`Successfully uploaded ${successCount} questions!`);
            setTextInput("");
            setSelectedFiles([]);
            setParsedData(null);
            onOpenChange(false);
        }
        onSave(); // Refresh test data
    };

    const copyTemplate = () => {
        navigator.clipboard.writeText(formatTemplate);
        toast("Template copied to clipboard");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Bulk Upload Options & Images
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
                    <Alert variant="default" className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Format Required</AlertTitle>
                        <AlertDescription className="text-blue-700 text-sm mt-2">
                            <p className="mb-2">Paste the options for your questions below. Leave a blank line between each question. For images, upload files named <strong>1.jpg</strong>, <strong>2.jpg</strong> corresponding sequentially to the text blocks.</p>
                            <div className="relative group">
                                <pre className="bg-gray-800 text-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                                    {formatTemplate}
                                </pre>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="absolute top-2 right-2 h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={copyTemplate}
                                >
                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">1. Attach Specimen Images (Named 1.jpg, 2.jpg...)</label>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 border border-gray-300 rounded-md p-1 mb-4"
                        />
                        {selectedFiles.length > 0 && (
                            <p className="text-xs text-green-600 mb-4">{selectedFiles.length} files selected.</p>
                        )}

                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Extract Options from Document (Word / PDF)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Automatically extract options text from a Word (.docx) or PDF (.pdf) file and fill it below.
                            </p>
                            <div className="flex gap-3 items-center">
                                <input 
                                    type="file" 
                                    accept=".docx,.pdf"
                                    onChange={handleDocumentChange}
                                    disabled={extracting}
                                    className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100 border border-gray-300 rounded-md p-1 bg-white"
                                />
                                {extracting && (
                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold shrink-0 animate-pulse">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Extracting...
                                    </div>
                                )}
                            </div>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">2. Paste Options Text</label>
                        <Textarea 
                            value={textInput}
                            onChange={e => {
                                setTextInput(e.target.value);
                                setParsedData(null); // Reset validation on edit
                            }}
                            placeholder="A) ...&#10;B) ...&#10;C) ...&#10;D) ...&#10;Ans: A"
                            className="font-mono text-sm min-h-[300px]"
                        />
                    </div>

                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                            <h4 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" /> Validation Errors
                            </h4>
                            <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
                                {errors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {parsedData && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-center gap-3 text-green-800 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                            <div>
                                <strong>Success!</strong> {parsedData.length} questions parsed. 
                                <span className="block text-xs mt-1 text-green-700">
                                    ({parsedData.filter(d => d.file).length} out of {parsedData.length} questions have a matching image attached.)
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-2 border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    {!parsedData ? (
                        <Button onClick={handleValidate} variant="secondary">
                            Validate Format
                        </Button>
                    ) : (
                        <Button onClick={handleUpload} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "Uploading..." : `Upload ${parsedData.length} Questions`}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
