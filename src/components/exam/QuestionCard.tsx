import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoomableImage } from "./ZoomableImage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Question {
    id: number;
    question: string;
    image: string | null;
    options: string[];
}

interface QuestionCardProps {
    question: Question;
    selectedOption: string | null;
    onSelect: (option: string) => void;
}

export function QuestionCard({ question, selectedOption, onSelect }: QuestionCardProps) {
    return (
        <Card className="w-full h-full shadow-lg border-green-100 flex flex-col">
            <CardHeader className="bg-green-50 border-b border-green-100 p-4">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-bold text-green-900">
                        Question {question.id}
                    </CardTitle>
                    <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        Single Choice
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                    <div className="text-lg font-medium text-gray-800">
                        {question.question}
                    </div>

                    {question.image && (
                        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex justify-center p-2">
                            <ZoomableImage
                                src={question.image}
                                alt={`Question ${question.id}`}
                                className="block"
                                imageClassName="max-h-[300px] object-contain"
                            />
                        </div>
                    )}

                    <RadioGroup
                        value={selectedOption || ""}
                        onValueChange={onSelect}
                        className="grid gap-4"
                    >
                        {question.options.map((option, index) => {
                            // Use index as key to ensure uniqueness if options are duplicates (rare but possible)
                            const optionId = `q${question.id}-opt${index}`;
                            return (
                                <div key={index} className={cn(
                                    "flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all hover:bg-green-50/50",
                                    selectedOption === option ? "border-green-500 bg-green-50 ring-1 ring-green-500" : "border-gray-200"
                                )}>
                                    <RadioGroupItem value={option} id={optionId} className="text-green-600" />
                                    <Label htmlFor={optionId} className="flex-1 cursor-pointer font-normal text-base text-gray-700">
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
