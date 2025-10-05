import { NextRequest, NextResponse } from "next/server"
import { cfGetUserInfo, cfGetUserRating } from "@/lib/codeforces-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get('handle')

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }

    // Get user info
    const userResponse = await cfGetUserInfo(handle)
    if (userResponse.status !== 'OK' || !('result' in userResponse) || !userResponse.result?.[0]) {
      return NextResponse.json({ 
        error: 'comment' in userResponse ? userResponse.comment : 'User not found' 
      }, { status: 404 })
    }

    const user = userResponse.result[0]

    // Get contest history
    const ratingResponse = await cfGetUserRating(handle)
    const contestCount = ratingResponse.status === 'OK' && 'result' in ratingResponse ? ratingResponse.result?.length || 0 : 0

    return NextResponse.json({
      eligible: contestCount >= 3,
      contestCount,
      rating: user.rating || 1200,
      maxRating: user.maxRating || user.rating || 1200,
      handle: user.handle
    })

  } catch (error) {
    console.error('CF eligibility check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check CF eligibility' 
    }, { status: 500 })
  }
}
