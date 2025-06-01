// app/api/analyze-food/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: CHOOSE A MULTIMODAL MODEL THAT SUPPORTS IMAGE INPUT
// e.g., "gemini-1.5-pro-latest" or the vision-enabled "gemini-1.5-flash-latest"
// Check Google AI documentation for the exact model names available to your API key.
const MODEL_NAME = "gemini-1.5-flash-latest"; // OR "gemini-1.5-flash-latest" (ensure it's vision capable)

const API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
}

try {
    const { image_data, mime_type, prompt } = await req.json(); // image_data is base64 encoded

    if (!image_data || !mime_type || !prompt) {
    return NextResponse.json({ error: "Missing image_data, mime_type, or prompt" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const imagePart: Part = {
    inlineData: {
        data: image_data, // Base64 string
        mimeType: mime_type,
    },
    };

    const textPart: Part = {
    text: prompt,
    };

    const result = await model.generateContent([textPart, imagePart]); // Order can matter, text prompt first often works well
    // Or: await model.generateContent([prompt, imagePart]); if the model prefers prompt as string first

    const response = result.response;
    const analysisText = response.text();

    return NextResponse.json({ analysis: analysisText });

} catch (error: any) {
    console.error("Error calling Gemini API for food analysis:", error);
    let errorMessage = "Failed to get response from AI for food analysis.";
    if (error.message) {
    errorMessage = error.message;
    }
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        errorMessage = error.response.data.error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
}
}