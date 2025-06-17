import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Verify the user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Delete the user using the admin client (requires service role key)
    // Note: This operation should ideally be performed with a Supabase service role key
    // on the server-side to bypass Row Level Security (RLS) and ensure proper deletion.
    const { error: deleteError } = await supabase.auth.admin.deleteUser(session.user.id)

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return NextResponse.json({ message: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}