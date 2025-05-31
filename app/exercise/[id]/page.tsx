"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, BarChart3, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useParams } from "next/navigation"

interface ExerciseDemo {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  duration_minutes: number
  youtube_url: string
}

export default function ExercisePage() {
  const [exercise, setExercise] = useState<ExerciseDemo | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data, error } = await supabase.from("exercise_demos").select("*").eq("id", params.id).single()

        if (error) throw error
        setExercise(data)
      } catch (error) {
        console.error("Error fetching exercise:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchExercise()
    }
  }, [params.id])

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "from-green-500 to-emerald-500"
      case "intermediate":
        return "from-orange-500 to-yellow-500"
      case "advanced":
        return "from-red-500 to-pink-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exercise not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Exercise Demo
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-border/50 mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl(exercise.youtube_url)}
                    title={exercise.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{exercise.title}</h2>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getDifficultyColor(exercise.difficulty_level)}`}
                    >
                      {exercise.difficulty_level}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{exercise.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Exercise Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-semibold">{exercise.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{exercise.duration_minutes} min</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-semibold capitalize">{exercise.difficulty_level}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Community</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Join thousands of users who have tried this exercise and share your experience!
                </p>
                <Link href="/auth">
                  <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    Join Discussion
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Always warm up before exercising</li>
                  <li>• Focus on proper form over speed</li>
                  <li>• Listen to your body and rest when needed</li>
                  <li>• Stay hydrated throughout your workout</li>
                  <li>• Consult a professional if you're unsure</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
