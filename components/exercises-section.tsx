"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Clock, BarChart3 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface ExerciseDemo {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  duration_minutes: number
  youtube_url: string
}

export function ExercisesSection() {
  const [exercises, setExercises] = useState<ExerciseDemo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase.from("exercise_demos").select("*").limit(6)

        if (error) throw error
        setExercises(data || [])
      } catch (error) {
        console.error("Error fetching exercises:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

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
      <section id="exercises" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="exercises" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Exercise Demos
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            High-quality exercise demonstrations to perfect your form and technique
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Play className="h-12 w-12 text-white/80" />
                  </div>
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getDifficultyColor(exercise.difficulty_level)}`}
                  >
                    {exercise.difficulty_level}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{exercise.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{exercise.description}</p>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{exercise.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>{exercise.category}</span>
                  </div>
                </div>

                <Link href={`/exercise/${exercise.id}`}>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/exercises">
            <Button variant="outline" size="lg" className="border-red-500/20 hover:bg-red-500/10">
              View All Exercises
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
