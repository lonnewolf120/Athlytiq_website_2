"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DeleteAccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "You have been signed in successfully. You can now proceed to delete your account.",
      })
      setIsSignedIn(true)
      setEmail("")
      setPassword("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) {
        throw new Error("No active session found. Please sign in again.")
      }

      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.session.access_token}`
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete account.")
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })
      router.push("/") // Redirect to home page after deletion
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg group-hover:scale-105 transition-transform">
              {/* Dumbbell icon from app/auth/page.tsx */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M14.4 14.4L9.6 9.6" />
                <path d="M18.6 6.6L6.6 18.6" />
                <path d="M12 22a2 2 0 0 1-2-2V4a2 2 0 0 1 4 0v16a2 2 0 0 1-2 2z" />
                <path d="M22 12a2 2 0 0 1-2-2H4a2 2 0 0 1 0 4h16a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Athlytiq
            </span>
          </Link>
        </div>

        <Card className="border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignedIn ? "Delete Your Account" : "Sign In to Delete Account"}
            </CardTitle>
            <p className="text-muted-foreground">
              {isSignedIn
                ? "This action is irreversible. Please confirm to proceed."
                : "Please sign in to confirm your identity before deleting your account."}
            </p>
          </CardHeader>
          <CardContent>
            {!isSignedIn ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-red-500 font-semibold">
                  WARNING: Deleting your account is permanent and cannot be undone. All your data will be lost.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    To confirm, please type "DELETE" in the box below:
                  </Label>
                  <Input
                    id="confirm-delete"
                    type="text"
                    placeholder="Type 'DELETE' to confirm"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    className="uppercase"
                  />
                </div>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || confirmationText !== "DELETE"}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? "Deleting Account..." : "Delete My Account"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}