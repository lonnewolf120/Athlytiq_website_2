import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client-side singleton
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// Types for the data
export interface UserFeedback {
  id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  user_name?: string
}

export interface Comment {
  id: string
  user_id: string
  content: string
  user_name?: string
  user_avatar?: string
  created_at: string
  updated_at: string
}

// Enhanced comment creation function with proper Supabase integration
export const createCommentWithProfile = async (userId: string, content: string) => {
  try {
    console.log("Creating comment for user:", userId, "with content:", content.slice(0, 50) + "...")

    // Validate inputs
    if (!userId || !content.trim()) {
      throw new Error("User ID and content are required")
    }

    // First, get user profile to fetch the current full_name
    let displayName = null
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single()

      if (!profileError && profile) {
        displayName = profile.full_name
        console.log("Found profile name:", displayName)
      } else {
        console.log("Profile not found or error:", profileError?.message)
      }
    } catch (profileErr) {
      console.log("Error fetching profile:", profileErr)
    }

    // If profile name not found, get user auth data as fallback
    if (!displayName) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || `User ${userId.slice(0, 8)}`

        console.log("Using fallback name:", displayName)
      } catch (authErr) {
        console.log("Error fetching auth user:", authErr)
        displayName = `User ${userId.slice(0, 8)}`
      }
    }

    // Prepare comment data
    const commentData = {
      user_id: userId,
      content: content.trim(),
      user_name: displayName,
      user_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    }

    console.log("Inserting comment with data:", commentData)

    // Insert comment to Supabase
    const { data, error } = await supabase.from("comments").insert(commentData).select().single()

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to save comment: ${error.message}`)
    }

    console.log("Comment created successfully:", data)
    return { data, error: null }
  } catch (error) {
    console.error("Error in createCommentWithProfile:", error)
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        code: "COMMENT_CREATION_FAILED",
      },
    }
  }
}

// Function to fetch comments with updated usernames from profiles
export const fetchCommentsWithProfiles = async (limit = 10) => {
  try {
    // First get all comments
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        id,
        user_id,
        content,
        user_name,
        user_avatar,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    // For each comment, check if we need to update the username from profiles
    const commentsWithUpdatedNames = await Promise.all(
      (comments || []).map(async (comment) => {
        // If the comment already has a user_name, use it
        if (comment.user_name) {
          return comment
        }

        // Otherwise try to get the name from profiles
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", comment.user_id)
            .single()

          if (profile?.full_name) {
            // Update the comment in the database with the profile name
            await supabase.from("comments").update({ user_name: profile.full_name }).eq("id", comment.id)

            return {
              ...comment,
              user_name: profile.full_name,
            }
          }
        } catch (err) {
          console.log("Error fetching profile for comment:", err)
        }

        return comment
      }),
    )

    return { data: commentsWithUpdatedNames, error: null }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { data: [], error }
  }
}

// Simple function to test database connectivity
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("comments").select("count").limit(1)
    return { connected: !error, error }
  } catch (error) {
    return { connected: false, error }
  }
}
