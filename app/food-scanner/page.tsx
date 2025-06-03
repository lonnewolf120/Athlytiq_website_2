// app/food-scanner/page.tsx
"use client";

import { useState, useRef, ChangeEvent, FormEvent, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { ArrowLeft, UploadCloud, Image as ImageIcon, Sparkles, AlertTriangle, Loader2, Send, Bot as BotIcon, UserCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area"; // For chat messages

interface ChatMessage {
id: string;
role: "user" | "model" | "system"; // "system" for initial analysis prompt
text: string;
imageUrl?: string; // To display the uploaded image alongside the first analysis
}

export default function FoodScannerPage() {
const [selectedImage, setSelectedImage] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
const [isDragging, setIsDragging] = useState(false);

// Chat-related state
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [currentChatInput, setCurrentChatInput] = useState("");
const [conversationStarted, setConversationStarted] = useState(false);
const [currentBase64Image, setCurrentBase64Image] = useState<string | null>(null);
const [currentMimeType, setCurrentMimeType] = useState<string | null>(null);

const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);


const processFile = (file: File | null) => {
    setMessages([]); // Clear previous chat on new image
    setCurrentChatInput("");
    setConversationStarted(false);
    setCurrentBase64Image(null);
    setCurrentMimeType(null);
    setError(null);

    if (file) {
    if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
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

const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => processFile(event.target.files?.[0] || null);
const handleDragOver = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); event.stopPropagation(); setIsDragging(true); };
const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); event.stopPropagation(); setIsDragging(false); };
const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault(); event.stopPropagation(); setIsDragging(false);
    if (event.dataTransfer.files?.[0]) processFile(event.dataTransfer.files[0]);
    event.dataTransfer.clearData();
};

const convertFileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // Return pure base64
    reader.onerror = reject;
});

// Handles initial image analysis
const handleInitialAnalysis = async () => {
    if (!selectedImage || !previewUrl) {
    setError("Please select an image first.");
    return;
    }
    setIsLoading(true);
    setError(null);
    setMessages([]); // Start a new conversation

    try {
    const base64 = await convertFileToBase64(selectedImage);
    setCurrentBase64Image(base64);
    setCurrentMimeType(selectedImage.type);

    const initialPrompt = "You are a helpful food analysis assistant. Analyze the provided image of food. Identify the main items you see. Provide a general, ballpark estimate of the total calories if possible, but clearly state this is a very rough estimate not for precise dietary tracking. If you cannot identify food or estimate calories, clearly say so. After your analysis, invite the user to ask follow-up questions about the food items or nutrition.";
    
    // Add a system message for context and the image itself for the user
    setMessages([
        { id: "img-display", role: "user", text: "Image submitted for analysis:", imageUrl: previewUrl },
    ]);

    const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        image_data: base64,
        mime_type: selectedImage.type,
        prompt: initialPrompt,
        history: [], // No prior history for initial analysis
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }
    const data = await response.json();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "model", text: data.analysis }]);
    setConversationStarted(true);
    } catch (err: any) {
    setError(err.message || "Error analyzing image.");
    setMessages(prev => [...prev, {id: "error-msg", role: "model", text: `Analysis failed: ${err.message}`}]);
    } finally {
    setIsLoading(false);
    }
};

// Handles follow-up chat messages
const handleChatSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!currentChatInput.trim()) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: "user", text: currentChatInput.trim() };
    const currentHistory = messages.filter(m => m.role === 'user' || m.role === 'model').map(m => ({role: m.role, text: m.text}));


    setMessages(prev => [...prev, userMessage]);
    setCurrentChatInput("");
    setIsLoading(true);
    setError(null);

    try {
    // For follow-up, we might not need to resend the image unless specifically prompted to refer to it.
    // The API route needs to be designed to handle history.
    // The initial prompt should be part of the history.
    const payload: any = {
        prompt: userMessage.text, // The new user query
        history: currentHistory, // Send previous turns for context
    };
    // Conditionally add image data if it's the first *model* response being generated after image upload
    // or if a more complex logic requires re-referencing. For now, send with initial prompt.
    // The API needs to know if an image is relevant for the current turn.
    // For simplicity, if this is a follow-up, we rely on the text history.
    // A more advanced setup could allow re-sending image_data or a reference to it.

    const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...payload,
            // Only send image data again if the AI specifically needs it or if it's the first actual follow-up
            // For now, our API for analyze-food will primarily use the image for the first turn based on an empty history.
            // If history is present, it might operate more like a standard chatbot.
            // This might require the API to be smarter or the client to indicate if image is still relevant.
            image_data: messages.length <= 2 ? currentBase64Image : undefined, // Crude check: resend image if very start of convo
            mime_type: messages.length <= 2 ? currentMimeType : undefined,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }
    const data = await response.json();
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "model", text: data.analysis }]);
    } catch (err: any) {
    setError(err.message || "Error in chat.");
    setMessages(prev => [...prev, {id: "error-chat", role: "model", text: `Response error: ${err.message}`}]);
    } finally {
    setIsLoading(false);
    }
};


const clearSelection = () => { /* ... same as before ... */ };

return (
    <div className="min-h-screen bg-background text-foreground">
    <Header />
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        {/* ... Page Header ... */}

        <Card className="shadow-lg mb-8">
            <CardHeader>{/* ... Card Header content ... */}</CardHeader>
            <CardContent>
            {/* Image Upload Section */}
            {!conversationStarted && (
                <div className="space-y-6">
                <div>
                    <label htmlFor="food-image-upload" className={`...`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                    {previewUrl ? ( <div className="relative w-full h-full p-2 sm:p-3"><Image src={previewUrl} alt="Selected food" fill style={{ objectFit: "contain" }} className="rounded-md"/></div>
                    ) : ( <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center"><UploadCloud className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} /><p className="mb-2 text-sm sm:text-base text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p><p className="text-xs sm:text-sm text-muted-foreground/80">PNG, JPG, GIF, WEBP (MAX. 5MB)</p></div>)}
                    <input id="food-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} ref={fileInputRef}/>
                    </label>
                    {selectedImage && ( <Button type="button" variant="link" size="sm" className="mt-2 text-xs h-auto p-0 text-muted-foreground hover:text-destructive" onClick={clearSelection}>Clear selection</Button> )}
                </div>
                <Button onClick={handleInitialAnalysis} disabled={!selectedImage || isLoading} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-90 text-white text-base sm:text-lg py-3 h-12 sm:h-14 rounded-md">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />} Analyze Meal
                </Button>
                </div>
            )}

            {/* Error display for image upload/initial analysis */}
            {error && !conversationStarted && ( <div className="mt-6 p-4 bg-destructive/10 ...">{error}</div> )}

            {/* Chat Interface - Appears after initial analysis or if conversation started */}
            {(conversationStarted || messages.length > 0) && (
                <div className="mt-6">
                <CardTitle className="text-lg sm:text-xl mb-4 flex items-center gap-2">
                    <BotIcon className="w-6 h-6 text-primary"/> Meal Conversation
                </CardTitle>
                <ScrollArea className="h-[300px] sm:h-[350px] w-full border rounded-md p-4 bg-muted/10 mb-4">
                    {messages.map((msg) => (
                    <div key={msg.id} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.role === 'model' && <BotIcon className="w-6 h-6 text-primary/80 mb-1 flex-shrink-0" />}
                        {msg.role === 'user' && <UserCircle2 className="w-6 h-6 text-muted-foreground mb-1 flex-shrink-0" />}
                        <div className={`p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none'}`}>
                            {msg.imageUrl && (
                            <div className="mb-2 relative w-full aspect-video max-h-48 overflow-hidden rounded">
                                <Image src={msg.imageUrl} alt="Uploaded food for analysis" layout="fill" objectFit="contain" />
                            </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        </div>
                    </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                </ScrollArea>
                
                {/* Chat Input Form */}
                <form onSubmit={handleChatSubmit} className="flex items-center gap-2 sm:gap-3">
                    <Input
                    type="text"
                    value={currentChatInput}
                    onChange={(e) => setCurrentChatInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-grow h-11 px-4 rounded-lg shadow-sm"
                    disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !currentChatInput.trim()} className="h-11 px-5 rounded-lg shadow-sm bg-primary text-primary-foreground">
                    <Send className="w-5 h-5" />
                    </Button>
                </form>
                {/* Error display for chat */}
                {error && conversationStarted && ( <p className="text-xs text-destructive mt-1.5">{error}</p> )}
                </div>
            )}
            </CardContent>
        </Card>
        <p className="text-xs sm:text-sm text-center text-muted-foreground mt-8 max-w-xl mx-auto">
            Note: Food analysis and calorie estimations are provided by AI...
        </p>
        </div>
    </div>
    </div>
);
}