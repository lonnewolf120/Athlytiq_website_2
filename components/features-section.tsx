"use client"

import { Activity, Heart, Users, Brain, Camera, MapPin, TrendingUp, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Activity,
    title: "Track Workouts",
    description: "Log exercises, sets, and reps effortlessly to monitor your fitness progress over time.",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Monitor Health",
    description: "Keep an eye on key metrics like weight, heart rate, BMI and comprehensive training reports.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect, share, and inspire with fellow fitness enthusiasts from around the world.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Brain,
    title: "AI Diet Recommendation",
    description: "Get personalized diet recommendations based on your specific fitness goals and needs.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Camera,
    title: "Food Scanning",
    description: "Scan food items instantly to measure macros and track your nutritional intake accurately.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    icon: MapPin,
    title: "Location-Based Insights",
    description: "Receive location and deficiency-based recommendations for optimal nutrition planning.",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "Progress Visualization",
    description: "Visualize your fitness journey with detailed charts and progress tracking analytics.",
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Zap,
    title: "Smart Training",
    description: "AI-powered workout recommendations that adapt to your fitness level and goals.",
    color: "from-orange-500 to-red-500",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to achieve your fitness goals in one comprehensive app
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 hover:border-red-500/20"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex p-3 rounded-full bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
