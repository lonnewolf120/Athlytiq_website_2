// components/fitness-chatbot.tsx
"use client";

import { useState, useEffect, useRef, FormEvent, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Loader2, Bot, UserCircle2 } from "lucide-react"; // Changed User to UserCircle2 for better avatar

interface Message {
id: string;
role: "user" | "model";
text: string;
}

export function FitnessChatbot() {
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const scrollAreaRef = useRef<HTMLDivElement>(null);
const inputRef = useRef<HTMLInputElement>(null);

// --- useEffect hooks (greeting, focus, scroll) remain the same ---
useEffect(() => {
    const fetchInitialGreeting = async () => {
    setIsLoading(true);
    try {
        const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "", history: [] }),
        });

        if (!res.ok) {
        const errorData = await res.json();
        console.error("Chatbot: API Error (initial greeting):", errorData);
        setMessages([{ id: "error-init", role: "model", text: `Error: ${errorData.error || "Could not start chat."}` }]);
        } else {
        const data = await res.json();
        if (data.response) {
            setMessages([{ id: Date.now().toString(), role: "model", text: data.response }]);
        }
        }
    } catch (error) {
        console.error("Chatbot: Network or parsing error (initial greeting):", error);
        setMessages([{ id: "error-init-catch", role: "model", text: "Error: Could not connect to FitBot." }]);
    } finally {
        setIsLoading(false);
    }
    };

    if (isOpen && messages.length === 0 && !isLoading) {
    fetchInitialGreeting();
    }
}, [isOpen, messages.length, isLoading]);

useEffect(() => {
    if (isOpen && inputRef.current) {
    inputRef.current.focus();
    }
}, [isOpen]);

useEffect(() => {
    // Enhanced scroll to bottom with a slight delay for smoother rendering
    if (messages.length > 0) {
        setTimeout(() => {
            if (scrollAreaRef.current) {
                const scrollableViewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
                if (scrollableViewport) {
                    scrollableViewport.scrollTo({ top: scrollableViewport.scrollHeight, behavior: 'smooth' });
                } else if (scrollAreaRef.current.scrollTo) {
                    scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
                } else {
                    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                }
            }
        }, 100); // 100ms delay
    }
}, [messages]);


const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userInputText = input.trim();
    const newUserMessage: Message = { id: Date.now().toString(), role: "user", text: userInputText };
    
    const currentMessagesForApi = [...messages]; 
    
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInputText, history: currentMessagesForApi }), 
    });

    let botResponseText = "Sorry, I encountered an issue. Please try again.";
    if (!res.ok) {
        const errorData = await res.json();
        console.error("Chatbot: API Error on submit:", errorData);
        botResponseText = `Error: ${errorData.error || "Failed to get response."}${errorData.details ? ` (${errorData.details})` : ''}`;
    } else {
        const data = await res.json();
        botResponseText = data.response;
    }
    
    const newBotMessage: Message = { id: (Date.now() + 1).toString(), role: "model", text: botResponseText };
    setMessages((prevMessages) => [...prevMessages, newBotMessage]);

    } catch (error) {
    console.error("Chatbot: Network or parsing error on submit:", error);
    const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Error: Could not connect to the AI service.",
    };
    setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    } finally {
    setIsLoading(false);
    if (inputRef.current) {
        inputRef.current.focus();
    }
    }
};

const toggleChat = () => {
    setIsOpen(!isOpen);
};

const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, lineIndex) => (
    <Fragment key={`line-${lineIndex}`}>
        {lineIndex > 0 && <br />}
        {line.split(/('"[^"]+"'|"[^"]+")/).map((segment, segmentIndex) => {
        if (segment.match(/^('"[^"]+"'|"[^"]+")$/)) {
            const cleanedSegment = segment.replace(/^'|'$/g, "").replace(/^"|"$/g, "");
            return (
            <code key={`quote-${lineIndex}-${segmentIndex}`} className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-1.5 py-0.5 rounded-md font-mono text-sm mx-0.5 select-all">
                "{cleanedSegment}"
            </code>
            );
        }
        return <span key={`text-${lineIndex}-${segmentIndex}`}>{segment}</span>;
        })}
    </Fragment>
    ));
};

return (
    <>
    {/* Floating Action Button */}

    <Button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 w-16 h-16 rounded-full shadow-xl z-50 bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105"
        size="icon"
        aria-label="Toggle Fitness Chatbot"
    >
        {isOpen ? (
            <>
                <img
                    src="/Chatbot_light.png"
                    alt="Close Chat Light"
                    className="w-7 h-7 block dark:hidden"
                />
                <img
                    src="/Chatbot_dark.png"
                    alt="Close Chat Dark"
                    className="w-7 h-7 hidden dark:block"
                />
            </>
        ) : (
            <>
                <img
                    src="/Chatbot_light.png"
                    alt="Open Chat Light"
                    className="w-7 h-7 block dark:hidden"
                />
                <img
                    src="/Chatbot_dark.png"
                    alt="Open Chat Dark"
                    className="w-7 h-7 hidden dark:block"
                />
            </>
        )}
    </Button>



    {/* Chat Window */}
    {isOpen && (
        <div className="fixed bottom-[calc(4rem+1.5rem)] right-5 sm:bottom-[calc(5rem+1.5rem)] sm:right-8 w-[calc(100vw-2.5rem)] max-w-md h-[65vh] max-h-[550px] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-40 overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in-0 slide-in-from-bottom-5">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30 dark:bg-muted/50 flex-shrink-0">
            <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-full">
                <Bot size={22} className="text-primary" />
            </div>
            <h3 className="font-semibold text-md text-card-foreground">FitBot Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-muted-foreground hover:bg-muted/60">
            <X size={18} />
            </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-grow p-4 bg-background/30 dark:bg-black/10" ref={scrollAreaRef}>
            <div className="space-y-5 pr-1"> {/* Added pr-1 for scrollbar spacing */}
            {messages.map((msg) => (
                <div
                key={msg.id}
                className={`flex gap-2.5 text-sm ${ 
                    msg.role === "user" ? "justify-end" : "justify-start"
                }`}
                >
                {msg.role === 'model' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center self-end mb-1">
                        <Bot size={18} className="text-primary" />
                    </div>
                )}
                <div
                    className={`max-w-[80%] sm:max-w-[75%] rounded-xl shadow-sm break-words leading-relaxed ${ // Added leading-relaxed
                    msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none p-3.5" // Different rounding for user
                        : "bg-muted text-card-foreground rounded-bl-none p-3" // Different rounding for bot
                    }`}
                >
                    {renderMessageContent(msg.text)}
                </div>
                {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center self-end mb-1">
                        <UserCircle2 size={20} className="text-muted-foreground" />
                    </div>
                )}
                </div>
            ))}
            {isLoading && (messages.length === 0 || messages[messages.length -1]?.role === 'user') && (
                <div className="flex justify-start items-center gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center self-end mb-1">
                        <Bot size={18} className="text-primary" />
                    </div>
                <div className="bg-muted text-card-foreground rounded-xl rounded-bl-none p-3 shadow-sm">
                    <Loader2 size={18} className="animate-spin text-primary" />
                </div>
                </div>
            )}
            </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-border bg-muted/30 dark:bg-muted/50 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
            <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask FitBot..."
                className="flex-grow bg-background focus:ring-2 focus:ring-primary/80 ring-offset-background ring-offset-2 text-sm h-11 px-4 rounded-lg shadow-sm"
                disabled={isLoading && messages.length === 0}
            />
            <Button 
                type="submit" 
                size="default" // Made button slightly larger
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 w-11 sm:w-auto sm:px-5 rounded-lg shadow-sm transition-all duration-200"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
            >
                <Send size={18} className="sm:mr-0 lg:mr-2" /> <span className="hidden lg:inline">Send</span>
            </Button>
            </form>
        </div>
        </div>
    )}
    </>
);
}