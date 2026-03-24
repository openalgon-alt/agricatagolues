import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ZoomIn, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
    imageClassName?: string;
}

export function ZoomableImage({ src, alt, className, imageClassName }: ZoomableImageProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className={cn("relative group cursor-zoom-in inline-block", className)}>
                    <img
                        src={src}
                        alt={alt}
                        className={cn("transition-transform duration-300 group-hover:scale-[1.02]", imageClassName || "w-full h-full object-contain")}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center pointer-events-none">
                <DialogTitle className="sr-only">Zoomed Image</DialogTitle>
                <DialogDescription className="sr-only">Detailed view of the image</DialogDescription>
                <div className="relative w-full h-full flex items-center justify-center p-4 pointer-events-auto">
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-10 w-10 backdrop-blur-sm"
                        >
                            <X className="w-6 h-6" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DialogClose>
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
