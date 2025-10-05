import { NextResponse } from "next/server"

export async function GET() {
  // NOTE: Stubbed values for now. Replace with real CF profile/contest snapshot later.
  const data = {
    ratingDelta: -180, // negative means rating drop in last contest
    lastContestAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    nextContestAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
  }
  return NextResponse.json(data)
}
