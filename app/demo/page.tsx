"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { ArrowLeft, Play, Youtube } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [videoId, setVideoId] = useState("")

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = extractVideoId(youtubeUrl)
    if (id) {
      setVideoId(id)
    } else {
      alert("Please enter a valid YouTube URL")
    }
  }

  const demoVideos = [
    {
      id: "dQw4w9WgXcQ",
      title: "Workout Tracking Demo",
      description: "See how our AI analyzes your form and tracks your progress",
    },
    {
      id: "dQw4w9WgXcQ",
      title: "Nutrition Scanning",
      description: "Watch how food scanning works with computer vision",
    },
    {
      id: "dQw4w9WgXcQ",
      title: "Community Features",
      description: "Explore how to connect with other fitness enthusiasts",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Watch Demo
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                See aithletiq in action with our demo videos
              </p>
            </div>
          </div>

          {/* YouTube URL Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                Watch Custom YouTube Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="url"
                  placeholder="Paste YouTube URL here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Load Video
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Video Player */}
          {videoId && (
            <Card className="mb-8">
              <CardContent className="p-0">
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Videos Grid */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Featured Demo Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {demoVideos.map((video, index) => (
                <Card
                  key={index}
                  className="bg-card border-border hover:border-red-500/20 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                      <Button variant="ghost" size="lg" onClick={() => setVideoId(video.id)} className="w-full h-full">
                        <Play className="w-12 h-12 text-red-500" />
                      </Button>
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-2">{video.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">{video.description}</p>
                    <Button variant="outline" size="sm" onClick={() => setVideoId(video.id)} className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Demo
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <CardContent className="p-6 sm:p-8 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-sm sm:text-base mb-6 opacity-90">
                Download aithletiq today and start your AI-powered fitness journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/download">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Download App
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-red-500 w-full sm:w-auto"
                  >
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
