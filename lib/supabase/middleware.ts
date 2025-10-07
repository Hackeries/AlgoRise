import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured properly, skip auth middleware
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "https://your-project.supabase.co" ||
    supabaseUrl === "https://your-project-ref.supabase.co" ||
    supabaseAnonKey === "your-anon-key-here" ||
    supabaseAnonKey === "[YOUR-ANON-KEY-HERE]"
  ) {
    console.warn("Supabase environment variables not configured, skipping auth middleware")
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicPaths = [
    "/",
    "/login",
    "/auth",
    "/cf-verification-success",
    "/analytics",
    "/train",
    "/contests",
    "/adaptive-sheet",
    "/groups",
    "/visualizers",
    "/paths",
    "/settings",
  ]

  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path),
  )

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")

  if (!user && !isPublicPath && !isApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && !isApiRoute && !isPublicPath) {
    // Allow access to profile page without CF verification
    if (request.nextUrl.pathname === "/profile" || request.nextUrl.pathname === "/settings") {
      return supabaseResponse
    }

    // Check if user has verified CF handle
    const { data: cfHandle } = await supabase.from("cf_handles").select("verified").eq("user_id", user.id).single()

    if (!cfHandle?.verified) {
      const url = request.nextUrl.clone()
      url.pathname = "/profile"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
