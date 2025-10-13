import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Also export as named export for compatibility
export { middleware }

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - exclude auth callback to avoid PKCE interference
     * - exclude /api and common public assets/extensions from middleware
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
}
