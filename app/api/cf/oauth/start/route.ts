import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get("handle")

    if (!handle) {
      return NextResponse.json(
        { error: "Handle parameter is required" },
        { status: 400 }
      )
    }

    // Verify the handle exists on Codeforces
    const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
    const cfData = await cfResponse.json()

    if (cfData.status !== "OK" || !cfData.result?.[0]) {
      return NextResponse.json(
        { error: "Codeforces handle not found" },
        { status: 404 }
      )
    }

    const cfUser = cfData.result[0]
    
    // No database storage needed - verification works without authentication
    console.log(`Successfully verified CF handle: ${cfUser.handle}`)
    console.log(`User stats - Rating: ${cfUser.rating}, Max Rating: ${cfUser.maxRating}, Rank: ${cfUser.rank}`)

    // Redirect to success page with user data
    const successUrl = new URL('/cf-verification-success', request.url)
    successUrl.searchParams.set('handle', cfUser.handle)
    successUrl.searchParams.set('rating', (cfUser.rating || 0).toString())
    successUrl.searchParams.set('maxRating', (cfUser.maxRating || 0).toString())
    successUrl.searchParams.set('rank', cfUser.rank || 'unrated')

    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error("OAuth start error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}