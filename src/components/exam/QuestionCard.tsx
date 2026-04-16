import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoomableImage } from "./ZoomableImage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Question {
    id: number;
    question: string;
    image?: string | null;
    options: string[];
    marks?: number;
}

interface QuestionCardProps {
    question: Question;
    selectedOption: string | null;
    onSelect: (option: string) => void;
    currentQuestionIndex: number;
}

export function QuestionCard({ question, selectedOption, onSelect, currentQuestionIndex }: QuestionCardProps) {
    return (
        <Card className="w-full h-full shadow-sm border-gray-200 flex flex-col bg-white rounded-xl">
            <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm md:text-base shadow-sm">
                            Q{currentQuestionIndex + 1}
                        </span>
                        <span className="hidden sm:inline">Question</span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                         {question.marks ? (
                             <span className="text-xs font-semibold text-gray-600 bg-gray-200/50 px-2.5 py-1 rounded-md">
                                 +{question.marks} Mark{question.marks > 1 ? 's' : ''}
                             </span>
                         ) : null}
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                            Single Choice
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="space-y-6 md:space-y-8">
                    {question.image && (
                        <div className="flex flex-wrap gap-4 mb-4 justify-center">
                            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center p-2">
                                 <div className="relative w-full flex justify-center">
                                    <ZoomableImage
                                        src={question.image}
                                        alt={`Question Image`}
                                        className="block"
                                        imageClassName="max-h-[250px] md:max-h-[300px] object-contain bg-white"
                                    />
                                </div>
                                <span className="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1 cursor-pointer hover:underline">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                                    Click image to zoom
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed max-w-4xl">
                        {question.question}
                    </div>

                    <RadioGroup
                        value={selectedOption || ""}
                        onValueChange={onSelect}
                        className="grid gap-3 md:gap-4 max-w-4xl"
                    >
                        {question.options.map((option, index) => {
                            const optionId = `q${question.id}-opt${index}`;
                            // value is the index as a string — avoids any text-encoding issues
                            const indexStr = String(index);
                            const isSelected = selectedOption === indexStr;
                            return (
                                <div key={index} className={cn(
                                    "flex items-start space-x-4 border p-4 md:p-5 rounded-xl cursor-pointer transition-all hover:bg-gray-50/80",
                                    isSelected ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600 shadow-sm" : "border-gray-200"
                                )}>
                                    <div className="pt-0.5">
                                        <RadioGroupItem value={indexStr} id={optionId} className={cn("w-5 h-5 text-blue-600", isSelected ? "border-blue-600" : "")} />
                                    </div>
                                    <Label htmlFor={optionId} className="flex-1 cursor-pointer font-medium text-base md:text-lg text-gray-700 leading-relaxed">
                                        {option}
                                    </Label>
                                </div>
                            );
                        })}
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    );
}
