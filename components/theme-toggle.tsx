// components/theme-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

// Define icon size and button classes consistent with header.tsx
const iconSize = 20; // Match the iconSize in header.tsx
const themeButtonClasses = "h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/80 dark:hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-95";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder with the same dimensions to prevent layout shift
    return (
      <Button variant="ghost" size="icon" className={`${themeButtonClasses} opacity-0`} disabled>
        {/* Using a placeholder icon of the target size */}
        <Sun size={iconSize} /> 
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme

  return (
    <Button
      variant="ghost"
      size="icon" // size="icon" from Button props usually makes it square. We override with h-10 w-10.
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className={themeButtonClasses} // Apply the consistent styling classes
      aria-label="Toggle theme"
    >
      <Sun size={iconSize} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon size={iconSize} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {/* The sr-only span for "Toggle theme" is good, but aria-label on button is primary for screen readers */}
    </Button>
  )
}