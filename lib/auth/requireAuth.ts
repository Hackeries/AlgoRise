import { NextRequest, NextResponse } from 'next/server';

/**
 * Minimal auth check for API routes.
 * 
 * TODO: Replace this stub with Supabase auth integration.
 * Currently checks for a 'user_id' cookie or header for basic auth gating.
 * 
 * @param request - The incoming request
 * @returns User ID if authenticated, null otherwise
 */
export function requireAuth(request: NextRequest): string | null {
  // TODO: Integrate with Supabase auth
  // const supabase = createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return null;
  // return user.id;

  // Stub: Check for user_id in cookies or headers
  const userId = 
    request.cookies.get('user_id')?.value || 
    request.headers.get('x-user-id') ||
    // For development: allow anonymous sessions with generated ID
    `anonymous_${Date.now()}`;

  return userId;
}

/**
 * Middleware helper to return 401 response
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized', message: 'Authentication required' },
    { status: 401 }
  );
}
