import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options) {
        supabaseResponse.cookies.set(name, value, options)
      },
      remove(name: string, options) {
        supabaseResponse.cookies.set(name, "", { ...options, maxAge: 0 })
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
    "/settings",
    "/visualizers",
    "/groups",
    "/analytics",
    "/learn",
    "/paths",
    "/train",
    "/adaptive-sheet",
    "/contests",
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
    if (
      request.nextUrl.pathname === "/profile" ||
      request.nextUrl.pathname === "/profile/overview" ||
      request.nextUrl.pathname === "/settings"
    ) {
      return supabaseResponse
    }

    // Check if user has verified CF handle
    const { data: cfHandle } = await supabase.from("cf_handles").select("verified").eq("user_id", user.id).single()

    if (!cfHandle?.verified) {
      const url = request.nextUrl.clone()
      url.pathname = "/profile"
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase.from("profiles").select("status").eq("user_id", user.id).single()

    if (!profile?.status) {
      // Profile not complete, redirect to profile page
      const url = request.nextUrl.clone()
      url.pathname = "/profile"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
