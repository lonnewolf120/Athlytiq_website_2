// app/food-scanner/page.tsx
"use client"

import { useState, useRef, ChangeEvent, FormEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { ArrowLeft, UploadCloud, Image as ImageIcon, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FoodScannerPage() {
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [analysisResult, setAnalysisResult] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const [isDragging, setIsDragging] = useState(false);

const processFile = (file: File | null) => {
    setAnalysisResult(null); 
    setError(null);       
    if (file) {
    if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file (JPEG, PNG, GIF, WEBP).");
        setSelectedImage(null);
        setPreviewUrl(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    } else {
    setSelectedImage(null);
    setPreviewUrl(null);
    }
};

const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files ? event.target.files[0] : null);
};

const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); 
    event.stopPropagation();
    setIsDragging(true);
};

const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
};

const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    processFile(event.dataTransfer.files[0]);
    event.dataTransfer.clearData();
    }
};

const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    });
};

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedImage) {
    setError("Please select an image first.");
    return;
    }
    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);
    try {
    const base64Image = await convertFileToBase64(selectedImage);
    const pureBase64 = base64Image.split(',')[1];
    const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        image_data: pureBase64,
        mime_type: selectedImage.type,
        prompt: "Analyze this image of food. Identify the items and provide a very general, ballpark estimate of the total calories if possible. Emphasize that this is a rough estimate and not for precise dietary tracking. If you cannot identify food or estimate calories, say so.",
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }
    const data = await response.json();
    setAnalysisResult(data.analysis);
    } catch (err: any) {
    console.error("Error analyzing food image:", err);
    setError(err.message || "An error occurred while analyzing the image.");
    } finally {
    setIsLoading(false);
    }
};

const clearSelection = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null); 
    setAnalysisResult(null); 
    if (fileInputRef.current) {
    fileInputRef.current.value = "";
    }
};

return (
    <div className="min-h-screen bg-background text-foreground">
    <Header />
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* MODIFIED THIS LINE FOR WIDER CONTENT AREA */}
        <div className="container mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl"> {/* Example: Wider on larger screens */}
        <div className="flex items-center gap-3 mb-8">
            <Link href="/">
            <Button variant="ghost" size="icon" aria-label="Go back">
                <ArrowLeft className="h-5 w-5" />
            </Button>
            </Link>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
                AI Food Scanner
                </span> (Beta)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
                Upload an image of your meal for a general analysis.
            </p>
            </div>
        </div>

        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl"> {/* Slightly larger title */}
                <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> {/* Slightly larger icon */}
                Upload Food Image
            </CardTitle>
            <CardDescription className="text-sm sm:text-base"> {/* Slightly larger description */}
                Get a general idea of what's in your meal. Calorie estimates are very approximate.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                <label
                    htmlFor="food-image-upload"
                    // Adjusted height for larger screens, kept h-48 as base
                    className={`flex flex-col items-center justify-center w-full h-48 sm:h-56 md:h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors
                    ${isDragging ? "bg-muted/50 dark:bg-muted/30 border-primary" : "bg-muted/20 dark:bg-muted/10 border-muted-foreground/30"} 
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {previewUrl ? (
                    <div className="relative w-full h-full p-2 sm:p-3">
                        <Image
                        src={previewUrl}
                        alt="Selected food"
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-md"
                        />
                    </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <UploadCloud className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="mb-2 text-sm sm:text-base text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground/80">
                        PNG, JPG, GIF, WEBP (MAX. 5MB)
                        </p>
                    </div>
                    )}
                    <input
                    id="food-image-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    />
                </label>
                {selectedImage && (
                    <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="mt-2 text-xs h-auto p-0 text-muted-foreground hover:text-destructive"
                        onClick={clearSelection}
                    >
                        Clear selection
                    </Button>
                )}
                </div>

                <Button
                type="submit"
                disabled={!selectedImage || isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white text-base sm:text-lg py-3 h-12 sm:h-14 rounded-md" // Increased font size and height
                >
                {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                )}
                Analyze Meal
                </Button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-base sm:text-lg">Analysis Error</p> {/* Increased font size */}
                    <p className="text-sm sm:text-base">{error}</p> {/* Increased font size */}
                </div>
                </div>
            )}

            {analysisResult && !error && (
                <Card className="mt-6 bg-muted/30 dark:bg-muted/10">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2"> {/* Increased font size */}
                        <Sparkles className="w-5 h-5 sm:w-6 sm:w-6 text-primary" />
                        Analysis Result
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed"> {/* Increased font size */}
                    {analysisResult}
                </CardContent>
                </Card>
            )}
            </CardContent>
        </Card>
        <p className="text-xs sm:text-sm text-center text-muted-foreground mt-8 max-w-xl mx-auto"> {/* Increased font, centered, max-width for readability */}
            Note: Food analysis and calorie estimations are provided by AI and are for informational purposes only. They are very approximate and should not be used for medical diagnosis or precise dietary planning. Always consult with a nutritionist or healthcare professional for accurate dietary advice.
        </p>
        </div>
    </div>
    </div>
);
}