import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFileSelect: (file: File) => Promise<void>;
    accept?: string;
    maxSizeMB?: number;
    label?: string;
}

export const FileUpload = ({
    onFileSelect,
    accept = "application/pdf",
    maxSizeMB = 10,
    label = "Upload PDF"
}: FileUploadProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateAndUpload = async (selectedFile: File) => {
        // Validate type
        if (accept && accept !== "*") {
            const acceptedTypes = accept.split(",").map(type => type.trim());
            const fileType = selectedFile.type;
            const fileName = selectedFile.name.toLowerCase();

            const isValid = acceptedTypes.some(type => {
                if (type.endsWith("/*")) {
                    const mainType = type.split("/")[0];
                    return fileType.startsWith(mainType + "/");
                }
                if (type.startsWith(".")) {
                    return fileName.endsWith(type.toLowerCase());
                }
                return fileType === type;
            });

            if (!isValid) {
                setErrorMessage(`Invalid file type. Accepted: ${accept}`);
                setStatus('error');
                return;
            }
        }

        // Validate size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setErrorMessage(`File too large. Max size is ${maxSizeMB}MB.`);
            setStatus('error');
            return;
        }

        setFile(selectedFile);
        setStatus('uploading');
        setProgress(0);
        setErrorMessage("");

        // Simulate progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            await onFileSelect(selectedFile);
            clearInterval(interval);
            setProgress(100);
            setStatus('success');
        } catch (err) {
            clearInterval(interval);
            setStatus('error');
            setErrorMessage("Upload failed. Please try again.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const triggerInput = () => {
        inputRef.current?.click();
    };

    const removeFile = () => {
        setFile(null);
        setStatus('idle');
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="w-full">
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors text-center cursor-pointer",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                    status === 'error' ? "border-red-500 bg-red-50" : "",
                    status === 'success' ? "border-green-500 bg-green-50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={status !== 'success' ? triggerInput : undefined}
            >
                <input
                    ref={inputRef}
                    className="hidden"
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    disabled={status === 'uploading' || status === 'success'}
                />

                {status === 'idle' && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-muted rounded-full">
                            <UploadCloud className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                                Drag & drop or click to select (Max {maxSizeMB}MB)
                            </p>
                        </div>
                    </div>
                )}

                {(status === 'uploading' || status === 'success') && file && (
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-background rounded border">
                            <File className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <Progress value={progress} className="h-1 mt-2" />
                        </div>
                        {status === 'success' ? (
                            <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-100" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                                <CheckCircle2 className="h-5 w-5" />
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                        )}
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-2 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                        <p className="text-sm font-medium">{errorMessage}</p>
                        <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
