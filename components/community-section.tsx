import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Trophy, Heart } from "lucide-react"
import Link from "next/link"

export function CommunitySection() {
  return (
    <section id="community" className="py-20 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Join Our
                </span>
                <br />
                <span className="text-foreground">Community</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Connect with thousands of fitness enthusiasts, share your journey, and get inspired!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Global Network</h3>
                  <p className="text-muted-foreground">
                    Connect with fitness enthusiasts from around the world and share your success stories.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Share Experience</h3>
                  <p className="text-muted-foreground">
                    Exchange tips, motivation, and support with like-minded individuals on their fitness journey.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Challenges & Goals</h3>
                  <p className="text-muted-foreground">
                    Participate in community challenges and achieve your fitness goals together.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                <Heart className="mr-2 h-5 w-5" />
                Join Community
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-1 shadow-xl">
                  <img
                    src="/placeholder.svg?height=400&width=200"
                    alt="Community Feature 1"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-1 shadow-xl">
                  <img
                    src="/placeholder.svg?height=300&width=200"
                    alt="Community Feature 2"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-1 shadow-xl">
                  <img
                    src="/placeholder.svg?height=300&width=200"
                    alt="Community Feature 3"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-1 shadow-xl">
                  <img
                    src="/placeholder.svg?height=400&width=200"
                    alt="Community Feature 4"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
