// app/api/cf/contest-url/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: any) {
  const id = context?.params?.id;
  if (!id) {
    return NextResponse.json(
      { url: 'https://codeforces.com/contests', status: 'error' },
      { status: 400 }
    );
  }

  try {
    // Fetch the registration URL server-side (no CORS)
    // We follow redirects (default) and inspect the final response url.
    const res = await fetch(
      `https://codeforces.com/contestRegistration/${id}`,
      {
        cache: 'no-store',
      }
    );

    // If the remote server redirected us to some other registration page,
    // response.url will not contain the original /contestRegistration/{id}
    const finalUrl = (res as any)?.url || '';

    // If redirect happened (to another contest), treat as "not started"
    if (!finalUrl.includes(`/contestRegistration/${id}`)) {
      return NextResponse.json({
        url: 'https://codeforces.com/contests',
        status: 'not_started',
      });
    }

    // If final url still points to the requested registration page, inspect HTML text
    const html = await res.text();

    // Defensive check for explicit "not started" message
    if (
      html.includes('Registration has not started') ||
      html.includes('Before registration')
    ) {
      return NextResponse.json({
        url: 'https://codeforces.com/contests',
        status: 'not_started',
      });
    }

    // Otherwise, registration page is served -> open the registration link
    return NextResponse.json({
      url: `https://codeforces.com/contestRegistration/${id}`,
      status: 'open',
    });
  } catch (err) {
    console.error('Error checking CF contest registration:', err);
    return NextResponse.json({
      url: 'https://codeforces.com/contests',
      status: 'error',
    });
  }
}
