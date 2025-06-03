// app/nutrition-coach/page.tsx
"use client";

import { useState, useEffect, FormEvent, useRef, Fragment, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { 
    ArrowLeft, Loader2, Sparkles, FileDown, 
    UtensilsCrossed, CalendarDays, AlertTriangle, CheckCircle 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
    autoTable: (options: any) => jsPDF; // The method itself
    lastAutoTable: { // Property added by autoTable after execution
        finalY: number;
        // Add other properties of lastAutoTable if you use them
    };
    }
}

type NutritionToolMode = "mealPlanner" | "recipeGenerator" | null;

interface MealItem {
name: string;
items: string[];
notes?: string;
}
interface MealPlanDay {
day: string;
meals: MealItem[];
dailySummary?: string;
}
interface MealPlanResponse {
title: string;
overallSummary?: string;
planDurationDays: number;
dailyPlan: MealPlanDay[];
consolidatedShoppingList?: string[];
generalTips?: string[];
}
interface RecipeResponse {
title: string;
description?: string;
ingredients?: string[];
instructions?: string[];
prepTime?: string;
cookTime?: string;
servings?: string;
nutritionHighlights?: string[];
}

export default function NutritionCoachPage() {
const { toast } = useToast();
const [currentMode, setCurrentMode] = useState<NutritionToolMode>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const [mealPlanGoal, setMealPlanGoal] = useState<string>("maintenance");
const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
const [numMealsPerDay, setNumMealsPerDay] = useState<string>("3");
const [planDuration, setPlanDuration] = useState<string>("1");
const [dislikedFoods, setDislikedFoods] = useState<string>("");
const [coachingMode, setCoachingMode] = useState<boolean>(true);
const [generatedMealPlan, setGeneratedMealPlan] = useState<MealPlanResponse | null>(null);

const [recipeGoal, setRecipeGoal] = useState<string>("high-protein");
const [mainIngredients, setMainIngredients] = useState<string>("");
const [recipeDietaryPrefs, setRecipeDietaryPrefs] = useState<string[]>([]);
const [cuisineType, setCuisineType] = useState<string>("");
const [generatedRecipe, setGeneratedRecipe] = useState<RecipeResponse | null>(null);

const outputRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (generatedMealPlan || generatedRecipe || error) {
    outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}, [generatedMealPlan, generatedRecipe, error]);

const handleDietaryPrefChange = (preference: string, type: "mealPlan" | "recipe") => {
    const currentPrefs = type === "mealPlan" ? dietaryPrefs : recipeDietaryPrefs;
    const setter = type === "mealPlan" ? setDietaryPrefs : setRecipeDietaryPrefs;
    if (currentPrefs.includes(preference)) {
    setter(currentPrefs.filter(p => p !== preference));
    } else {
    setter([...currentPrefs, preference]);
    }
};

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true); setError(null); setGeneratedMealPlan(null); setGeneratedRecipe(null);
    const payload: any = { mode: currentMode };
    if (currentMode === "mealPlanner") {
    payload.goal = mealPlanGoal;
    payload.dietaryPreferences = dietaryPrefs;
    payload.numMealsPerDay = parseInt(numMealsPerDay);
    payload.planDurationDays = parseInt(planDuration);
    payload.dislikedFoods = dislikedFoods;
    payload.coachingMode = coachingMode;
    } else if (currentMode === "recipeGenerator") {
    payload.goal = recipeGoal;
    payload.mainIngredients = mainIngredients.split(',').map(s => s.trim()).filter(Boolean);
    payload.dietaryPreferences = recipeDietaryPrefs;
    payload.cuisineType = cuisineType;
    }
    try {
    const response = await fetch("/api/nutrition-tool", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `API request failed: ${response.statusText}`); }
    const data = await response.json();
    if (currentMode === "mealPlanner") setGeneratedMealPlan(data.result as MealPlanResponse);
    else if (currentMode === "recipeGenerator") setGeneratedRecipe(data.result as RecipeResponse);
    } catch (err: any) { setError(err.message || "An error occurred."); toast({ title: "Error", description: err.message || "Could not get response.", variant: "destructive"});
    } finally { setIsLoading(false); }
};

const generateMealPlanPDF = () => {
    if (!generatedMealPlan || !generatedMealPlan.dailyPlan || generatedMealPlan.dailyPlan.length === 0) {  // Fixed typo here
        toast({ title: "Error", description: "No meal plan data to download.", variant: "destructive" });
        return;
    }
    const doc = new jsPDF();
    const pageH = doc.internal.pageSize.height; 
    const pageW = doc.internal.pageSize.width; 
    const m = 14; // margin
    let y = 22; // current y position

    // --- Title ---
    doc.setFontSize(18); 
    doc.setFont("Helvetica", 'bold'); 
    doc.text(generatedMealPlan.title || "Custom Meal Plan", pageW / 2, y, { align: 'center' }); 
    y += 10;

    // --- Overall Summary ---
    if (generatedMealPlan.overallSummary) { 
        doc.setFontSize(10); 
        doc.setFont("Helvetica", 'italic'); 
        const sl = doc.splitTextToSize(generatedMealPlan.overallSummary || '', pageW - m * 2); 
        doc.text(sl, m, y); 
        y += sl.length * 5 + 5; 
    }

    // --- Plan Details Line ---
    doc.setFontSize(9); 
    doc.setFont("Helvetica", 'normal'); 
    doc.setTextColor(100); 
    doc.text(`Duration: ${generatedMealPlan.planDurationDays} day(s) | Meals/Day: ${generatedMealPlan.dailyPlan[0]?.meals?.length || 'N/A'}`, m, y); 
    y += 7; 
    doc.setTextColor(0);

    // --- Helper function for page breaks ---
    const addPg = (neededHeight: number) => { 
        if (y + neededHeight > pageH - m) { 
            doc.addPage(); 
            y = m + 5; // Reset y for new page
            return true; 
        } 
        return false; 
    };

    // --- Loop through Daily Plans ---
    generatedMealPlan.dailyPlan.forEach((dp, di) => {
        addPg(20); // Estimate space for day title + a bit more
        doc.setFontSize(14); 
        doc.setFont("Helvetica", 'bold'); 
        doc.setTextColor(44, 62, 80); // A darker blue/grey
        doc.text(dp.day || `Day ${di + 1}`, m, y); 
        y += 7; 
        doc.setTextColor(0); 
        doc.setFont("Helvetica", 'normal');

        // Daily Summary
        if (dp.dailySummary) { 
            const dailySummaryText = dp.dailySummary || '';
            addPg(10 + (doc.splitTextToSize(dailySummaryText, pageW - (m + 2) * 2).length * 4)); 
            doc.setFontSize(9); 
            doc.setFont("Helvetica", 'italic'); 
            doc.setTextColor(80); 
            const dsl = doc.splitTextToSize(`Summary: ${dailySummaryText}`, pageW - (m + 2) * 2); 
            doc.text(dsl, m + 2, y); 
            y += dsl.length * 4 + 3; 
            doc.setFont("Helvetica", 'normal'); 
            doc.setTextColor(0); 
        }

        // Meals for the day
        dp.meals.forEach(meal => {
            addPg(15); // Estimate space for meal name + one item
            doc.setFontSize(11); 
            doc.setFont("Helvetica", 'bold'); 
            doc.text(meal.name || "Meal", m + 2, y); 
            y += 5; 
            doc.setFontSize(10); 
            doc.setFont("Helvetica", 'normal');

            meal.items.forEach(item => { 
                addPg(8); // Estimate space per item
                const il = doc.splitTextToSize(`- ${item || ''}`, pageW - (m + 4) * 2); 
                doc.text(il, m + 4, y); 
                y += il.length * 4 + 1; 
            });

            if (meal.notes) { 
                addPg(8); // Estimate space for notes
                doc.setFontSize(9); 
                doc.setFont("Helvetica", 'italic'); 
                const nl = doc.splitTextToSize(`Note: ${meal.notes || ''}`, pageW - (m + 4) * 2); // Corrected pageW-(m+4)2 to pageW - (m+4)*2 and added || ''
                doc.text(nl, m + 6, y); 
                y += nl.length * 4 + 1; // Corrected nl.length4+1 to nl.length * 4 + 1
                doc.setFont("Helvetica", 'normal'); 
            }
            y += 3; // Space after a meal block
        });

        // Separator line between days
        if (di < generatedMealPlan.dailyPlan.length - 1) { 
            y += 5; 
            addPg(5); 
            doc.setDrawColor(200); 
            doc.line(m, y - 2, pageW - m, y - 2); 
        }
    });

    // --- Consolidated Shopping List ---
    if (generatedMealPlan.consolidatedShoppingList && generatedMealPlan.consolidatedShoppingList.length > 0) { 
        addPg(30); 
        doc.setFontSize(14); 
        doc.setFont("Helvetica", 'bold'); 
        doc.setTextColor(44,62,80); 
        doc.text("Consolidated Shopping List", m, y); 
        y += 8; 
        const td = generatedMealPlan.consolidatedShoppingList.map(i => [i || '']);
        
        // Use autoTable directly (no need for doc.autoTable)
        autoTable(doc, {
            startY: y, 
            head:[['Items to Buy']], 
            body: td, 
            theme:'grid', 
            styles:{fontSize:10, cellPadding:1.5}, 
            headStyles:{fillColor:[52,73,94], textColor:255, fontStyle:'bold'}, 
            margin:{left:m, right:m}
        }); 
        y = doc.lastAutoTable.finalY + 10; 
    }

    // --- General Tips ---
    if (generatedMealPlan.generalTips && generatedMealPlan.generalTips.length > 0) { 
        addPg(20); 
        doc.setFontSize(12); 
        doc.setFont("Helvetica", 'bold'); 
        doc.setTextColor(44,62,80); 
        doc.text("General Nutrition Tips", m, y); // Corrected "Tips" to "General Nutrition Tips"
        y += 6; 
        doc.setFontSize(10); 
        doc.setFont("Helvetica", 'normal'); 
        doc.setTextColor(0); 
        generatedMealPlan.generalTips.forEach(t => { 
            addPg(8); 
            const tl = doc.splitTextToSize(`• ${t || ''}`, pageW - m * 2); // Corrected pageW-m2 to pageW - m * 2
            doc.text(tl, m, y); 
            y += tl.length * 4 + 2; // Corrected tl.length4+2 to tl.length * 4 + 2
        }); 
    }

    // --- Save PDF ---
    doc.save(`${(generatedMealPlan.title || 'meal_plan').replace(/\s+/g, '_')}_${generatedMealPlan.planDurationDays}days.pdf`);
    toast({ title: "PDF Generated", description: "Your meal plan PDF has been downloaded." });
};

const renderMealPlannerForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
        <Label htmlFor="mealPlanGoal" className="text-sm font-medium">Primary Goal</Label>
        <Select value={mealPlanGoal} onValueChange={setMealPlanGoal}>
            <SelectTrigger id="mealPlanGoal"><SelectValue placeholder="Select your goal" /></SelectTrigger>
            <SelectContent>
            <SelectItem value="weight-loss">Weight Loss</SelectItem>
            <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="general-health">General Health</SelectItem>
            </SelectContent>
        </Select>
        </div>
        <div>
        <Label htmlFor="numMealsPerDay" className="text-sm font-medium">Meals Per Day</Label>
        <Select value={numMealsPerDay} onValueChange={setNumMealsPerDay}>
            <SelectTrigger id="numMealsPerDay"><SelectValue placeholder="Select number of meals" /></SelectTrigger>
            <SelectContent>
            <SelectItem value="2">2 Meals</SelectItem>
            <SelectItem value="3">3 Meals</SelectItem>
            <SelectItem value="4">4 Meals</SelectItem>
            <SelectItem value="5">5 Meals</SelectItem>
            </SelectContent>
        </Select>
        </div>
        <div>
        <Label htmlFor="planDuration" className="text-sm font-medium">Plan Duration (Days)</Label>
        <Select value={planDuration} onValueChange={setPlanDuration}>
            <SelectTrigger id="planDuration"><SelectValue placeholder="Select duration" /></SelectTrigger>
            <SelectContent>
            <SelectItem value="1">1 Day</SelectItem>
            <SelectItem value="3">3 Days</SelectItem>
            <SelectItem value="5">5 Days</SelectItem>
            <SelectItem value="7">7 Days</SelectItem>
            </SelectContent>
        </Select>
        </div>
    </div>
    <div>
        <Label className="text-sm font-medium">Dietary Preferences/Restrictions</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
        {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low-Carb", "High-Protein"].map(pref => (
            <div key={pref} className="flex items-center space-x-2">
            <Checkbox id={`meal-${pref}`} checked={dietaryPrefs.includes(pref)} onCheckedChange={() => handleDietaryPrefChange(pref, "mealPlan")} />
            <Label htmlFor={`meal-${pref}`} className="text-sm font-normal cursor-pointer">{pref}</Label>
            </div>
        ))}
        </div>
    </div>
    <div>
        <Label htmlFor="dislikedFoods" className="text-sm font-medium">Foods to Avoid (comma-separated)</Label>
        <Textarea id="dislikedFoods" value={dislikedFoods} onChange={(e) => setDislikedFoods(e.target.value)} placeholder="e.g., mushrooms, shellfish, cilantro" className="min-h-[80px]"/>
    </div>
    <div className="flex items-center space-x-2">
        <Checkbox id="coachingMode" checked={coachingMode} onCheckedChange={(checked) => setCoachingMode(checked as boolean)} />
        <Label htmlFor="coachingMode" className="text-sm font-normal cursor-pointer">Enable Coaching Mode (AI provides more tips and explanations)</Label>
    </div>
    <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 text-white text-base py-3 h-12 sm:h-14 rounded-md">
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CalendarDays className="mr-2 h-5 w-5" />} Generate Meal Plan
    </Button>
    </form>
);

const renderRecipeGeneratorForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
    <div>
        <Label htmlFor="recipeGoal" className="text-sm font-medium">Recipe Goal/Type</Label>
        <Select value={recipeGoal} onValueChange={setRecipeGoal}>
            <SelectTrigger id="recipeGoal"><SelectValue placeholder="What kind of recipe?" /></SelectTrigger>
            <SelectContent>
            <SelectItem value="high-protein">High Protein</SelectItem>
            <SelectItem value="low-carb">Low Carb</SelectItem>
            <SelectItem value="quick-easy">Quick & Easy (under 30 mins)</SelectItem>
            <SelectItem value="vegetarian-main">Vegetarian Main Dish</SelectItem>
            <SelectItem value="vegan-dessert">Vegan Dessert</SelectItem>
            <SelectItem value="healthy-snack">Healthy Snack</SelectItem>
            </SelectContent>
        </Select>
    </div>
    <div>
        <Label htmlFor="mainIngredients" className="text-sm font-medium">Main Ingredients (comma-separated)</Label>
        <Input id="mainIngredients" value={mainIngredients} onChange={(e) => setMainIngredients(e.target.value)} placeholder="e.g., chicken breast, broccoli, quinoa" />
    </div>
    <div>
        <Label className="text-sm font-medium">Dietary Preferences/Restrictions</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-2">
        {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free"].map(pref => (
            <div key={pref} className="flex items-center space-x-2">
            <Checkbox id={`recipe-${pref}`} checked={recipeDietaryPrefs.includes(pref)} onCheckedChange={() => handleDietaryPrefChange(pref, "recipe")} />
            <Label htmlFor={`recipe-${pref}`} className="text-sm font-normal cursor-pointer">{pref}</Label>
            </div>
        ))}
        </div>
    </div>
    <div>
        <Label htmlFor="cuisineType" className="text-sm font-medium">Cuisine Type (Optional)</Label>
        <Input id="cuisineType" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} placeholder="e.g., Italian, Mexican, Indian" />
    </div>
    <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white text-base py-3 h-12 sm:h-14 rounded-md">
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UtensilsCrossed className="mr-2 h-5 w-5" />} Generate Recipe
    </Button>
    </form>
);

const renderMealPlanResult = (plan: MealPlanResponse) => (
    <Card className="mt-6 animate-in fade-in-50 duration-500 border-primary/30">
        <CardHeader className="flex flex-row justify-between items-center sticky top-0 bg-card z-10 border-b p-4 sm:p-6">
            <div><CardTitle className="text-xl sm:text-2xl">{plan.title || "Custom Meal Plan"}</CardTitle><CardDescription>Duration: {plan.planDurationDays || 0} day(s)</CardDescription></div>
            <Button onClick={generateMealPlanPDF} variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4"/>Download PDF</Button>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
            {plan.overallSummary && <p className="text-muted-foreground italic border-l-4 border-primary/50 pl-3 py-1 bg-muted/50 rounded-r-md">{plan.overallSummary}</p>}
            {plan.dailyPlan?.map((dayPlan, dayIdx) => (
                <div key={dayPlan.day || `day-${dayIdx}`} className="py-4 border rounded-lg shadow-sm bg-background p-4">
                    <h4 className="text-lg font-semibold text-primary mb-3 border-b pb-2">{dayPlan.day || `Day ${dayIdx + 1}`}</h4>
                    {dayPlan.dailySummary && <p className="text-sm italic text-muted-foreground mb-3">{dayPlan.dailySummary}</p>}
                    <div className="space-y-4">
                        {dayPlan.meals.map((meal, mealIdx) => (
                            <div key={`${dayPlan.day}-${meal.name || mealIdx}-${mealIdx}`}>
                                <h5 className="font-medium text-md text-card-foreground">{meal.name || "Unnamed Meal"}</h5>
                                <ul className="list-disc list-inside text-sm text-muted-foreground pl-4 space-y-1 mt-1">
                                    {meal.items.map((item, itemIdx) => <li key={itemIdx}>{item || ''}</li>)}
                                </ul>
                                {meal.notes && <p className="text-xs italic text-muted-foreground/80 mt-1.5 pl-1">Note: {meal.notes}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {plan.consolidatedShoppingList && plan.consolidatedShoppingList.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                    <h4 className="text-lg font-semibold text-primary mb-2">Consolidated Shopping List</h4>
                    <ul className="columns-2 sm:columns-3 list-none space-y-1 text-sm">
                    {plan.consolidatedShoppingList.map((item, idx) => <li key={idx} className="flex items-center"><CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0"/>{item || ''}</li>)}
                    </ul>
                </div>
            )}
            {plan.generalTips && plan.generalTips.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                    <h4 className="text-lg font-semibold text-primary mb-2">General Nutrition Tips</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 pl-2">
                    {plan.generalTips.map((tip, idx) => <li key={idx}>{tip || ''}</li>)}
                    </ul>
                </div>
            )}
        </CardContent>
    </Card>
);

const renderRecipeResult = (recipe: RecipeResponse) => (
    <Card className="mt-6 animate-in fade-in-50 duration-500">
        <CardHeader><CardTitle className="text-xl sm:text-2xl">{recipe.title || "Generated Recipe"}</CardTitle>{recipe.description && <CardDescription>{recipe.description}</CardDescription>}</CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
                {recipe.prepTime && <div><strong>Prep:</strong> {recipe.prepTime}</div>}
                {recipe.cookTime && <div><strong>Cook:</strong> {recipe.cookTime}</div>}
                {recipe.servings && <div><strong>Servings:</strong> {recipe.servings}</div>}
            </div>
            {recipe.ingredients?.length && (<div><h4 className="font-semibold text-card-foreground mb-1">Ingredients:</h4><ul className="list-disc list-inside text-sm space-y-0.5">{recipe.ingredients.map((item, idx) => <li key={idx}>{item || ''}</li>)}</ul></div>)}
            {recipe.instructions?.length && (<div><h4 className="font-semibold text-card-foreground mb-1">Instructions:</h4><ol className="list-decimal list-inside text-sm space-y-1">{recipe.instructions.map((step, idx) => <li key={idx}>{step || ''}</li>)}</ol></div>)}
            {recipe.nutritionHighlights?.length && (<div><h4 className="font-semibold text-card-foreground mb-1">Nutrition Highlights:</h4><ul className="list-disc list-inside text-sm space-y-0.5">{recipe.nutritionHighlights.map((item, idx) => <li key={idx}>{item || ''}</li>)}</ul></div>)}
        </CardContent>
    </Card>
);


return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
    <Header />
    <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-3xl lg:max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
            <Link href="/" passHref>
            <Button variant="ghost" size="icon" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 bg-clip-text text-transparent">AI Nutrition Tools</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Get AI-powered meal plans and recipe ideas.</p>
            </div>
        </div>

        {!currentMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 animate-in fade-in-0 duration-500">
            <Card onClick={() => setCurrentMode("mealPlanner")} className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all group">
                <CardHeader className="items-center text-center">
                <CalendarDays className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform"/>
                <CardTitle className="text-2xl">Meal Planner</CardTitle>
                <CardDescription>Generate personalized meal plans based on your goals and preferences.</CardDescription>
                </CardHeader>
            </Card>
            <Card onClick={() => setCurrentMode("recipeGenerator")} className="cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all group">
                <CardHeader className="items-center text-center">
                <UtensilsCrossed className="w-12 h-12 text-primary mb-3 group-hover:scale-110 transition-transform"/>
                <CardTitle className="text-2xl">Recipe Generator</CardTitle>
                <CardDescription>Get custom recipe ideas based on ingredients, goals, or cuisine type.</CardDescription>
                </CardHeader>
            </Card>
            </div>
        )}

        {currentMode && (
            <Button variant="outline" onClick={() => {setCurrentMode(null); setGeneratedMealPlan(null); setGeneratedRecipe(null); setError(null);}} className="mb-6 text-sm">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Tool Selection
            </Button>
        )}
        
        <Card className="shadow-xl border-primary/20">
            <CardHeader className={!currentMode ? 'hidden' : ''}>
            <CardTitle className="flex items-center gap-2 text-xl">
                {currentMode === "mealPlanner" && <><CalendarDays className="w-6 h-6 text-primary" /> Meal Planner Tool</>}
                {currentMode === "recipeGenerator" && <><UtensilsCrossed className="w-6 h-6 text-primary" /> Recipe Generator Tool</>}
            </CardTitle>
            </CardHeader>
            <CardContent className={!currentMode ? 'hidden' : 'pt-6'}>
            {currentMode === "mealPlanner" && renderMealPlannerForm()}
            {currentMode === "recipeGenerator" && renderRecipeGeneratorForm()}
            </CardContent>
        </Card>

        <div ref={outputRef} className="mt-1">
            {error && (
                <Card className="mt-6 bg-destructive/10 border-destructive/50 text-destructive">
                    <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5"/>Error</CardTitle></CardHeader>
                    <CardContent><p>{error}</p></CardContent>
                </Card>
            )}
            {currentMode === "mealPlanner" && generatedMealPlan && renderMealPlanResult(generatedMealPlan)}
            {currentMode === "recipeGenerator" && generatedRecipe && renderRecipeResult(generatedRecipe)}
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-8 max-w-lg mx-auto">
            AI Nutrition tools provide general information and suggestions. They are not a substitute for professional medical or dietary advice. Always consult a qualified healthcare provider or registered dietitian for personalized guidance.
        </p>
        </div>
    </main>
    </div>
);
}